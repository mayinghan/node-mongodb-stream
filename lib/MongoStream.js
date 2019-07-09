'use strict';

const Event = require('events').EventEmitter;
const MongoClient = require('mongodb').MongoClient;

class MongoStream extends Event {
    constructor({ connection, db, collection, op }) {
        super();

        let batchSize = 500;
        let buf = [];

        MongoClient.connect(connection.url).then(db => {
            let stream = op.name === 'aggregate' ? db.collection(collection).aggregate(op.pipeline, op.options)
                : db.collection(collection)[op.name](op.query, op.options).stream();

            
            stream.on('data', doc => {
                buf.push(doc);

                if(buf.length >= batchSize) {
                    stream.pause();
                    this.emit('batch', buffer, () => {
                        stream.resume();
                        buf = [];
                    })
                }
            });

            //need to send back the last batch of data
            stream.on('end', () => {
                this.emit('done', buf);
                db.close();
            });

            stream.on('error', err => {
                stream.removeAllListeners('data');
                db.close();
                this.emit('error', err);
            });

            stream.on('close', () => {});
        })
    }
}

module.exports = MongoStream;