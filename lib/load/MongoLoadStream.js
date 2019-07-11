'use strict';

const MongoClient = require('mongodb').MongoClient;
const Event = require('events').EventEmitter;
const Writable = require('stream').Writable;
const { pick, reduce, splitEvery } = require('ramda');
const es = require('event-stream');

class MongoLoadStream extends Event {
    constructor(options) {
        super();

        this.url = options.url;
        this.db = options.db;
        this.collection = options.collection;
        this.key = options.key;
        this.updateKeys = options.updateKeys;
        this.insertKeys = options.insertKeys;
        this.op = options.op ? options.op : 'upsert';

        this.client = null;
        this.bulk = null;

        console.log('initing mongodb load stream');

        MongoClient.connect(this.url, { useNewUrlParser: true })
                .then(client => {
                    console.log('mongo load stream opened...');

                    this.client = client;
                    this.bulk = this.client.db(this.db).collection(this.collection).initializeUnorderedBulkOp();
                    this.emit('ready');
                })
                .catch(console.error);

    }

    helper(items) {
        const getOp = op => op === 'upsert' ?
            (bulk, item) => bulk.find(pick(this.key, item)).upsert().update({ $set: pick(this.updateKeys, item), $setOnInsert: pick(this.insertKeys, item) }) && bulk :
            (bulk, item) => bulk.insert(item) && bulk;

        const batchUpsert = (op, items) => reduce(op, this.bulk, items).execute();
        const batchByItems = batch => batchUpsert(getOp(this.op), batch);
        const update = items => Promise.resolve().then(batchByItems(items).then(console.log('insert done')).catch((err) => console.log(err.writeErrors[0].err))).catch(console.error);

        //console.log(items)
        return update(items);
    }

    store(items, next) {
        console.log(`writing ${items.length} to mongodb`);
        return this.helper(items)
    }

    finish(items, next) {
        this.helper(items).then(() => this.emit('close')).catch(console.error);
        next();
    }
}

module.exports = MongoLoadStream;