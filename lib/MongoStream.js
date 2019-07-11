'use strict';

const Event = require('events').EventEmitter;
const MongoClient = require('mongodb').MongoClient;

class MongoStream extends Event {
    constructor({ connection, db, collection, op, load }) {
        super();

        let batchSize = 100;
        let buf = [];
        let keySet = new Set();
        load.on('ready', () => {
            MongoClient.connect(connection.url, { useNewUrlParser: true })
                .then(connect => {
                    let stream = op.name === 'aggregate' ? connect.db(db).collection(collection).aggregate(op.pipeline, op.options)
                        : connect.db(db).collection(collection)[op.name](op.query, op.options).stream();

                    stream.on('data', doc => {
                        buf.push(doc);
                        // console.log(buf.length)
                        // if(!keySet.has(doc._id)) {
                        //     keySet.add(doc._id);
                        // } else {
                        //     process.exit(0);
                        // }

                        if (buf.length >= batchSize) {
                            stream.pause();
                            this.emit('batch', buf, () => {
                                console.log('resume')
                                stream.resume();
                                buf = [];
                            })
                        }
                    });

                    //need to send back the last batch of data
                    stream.on('end', () => {
                        this.emit('done', buf);
                        connect.close();
                    });

                    stream.on('error', err => {
                        stream.removeAllListeners('data');
                        connect.close();
                        this.emit('error', err);
                    });

                    stream.on('close', () => { });
                })

                .catch(console.error);
        })
    }
}

module.exports = MongoStream;