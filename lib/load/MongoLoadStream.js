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
    }

	init() {
		        MongoClient.connect(this.url, { useNewUrlParser: true })
            .then(client => {
                console.log('mongo load stream opened...');

                this.client = client;
                this.bulk = this.client.db(this.db).collection(this.collection).initializeUnorderedBulkOp();
                this.emit('ready');
            })
            .catch(console.error);
	}

    store(items) {
        console.log(`writing ${items.length} to mongodb`);
        if(this.op !== 'upsert') {
            return this.insert(items);
        }
        
        return this.upsert(items);
    }

    insert(items) {
        return this.client.db(this.db).collection(this.collection).insertMany(items);
    }

    upsert(items) {
        const batchedItems = splitEvery(2000, items);
        const getOp = (bulk, item) => bulk.find(pick(this.key, item)).upsert().update({ $set: pick(this.updateKeys, item), $setOnInsert: pick(this.insertKeys, item) }) && bulk;
        const batchUpsert = (op, items) => reduce(op, this.bulk, items).execute();
        const batchByItems =  items => batchUpsert(getOp, items);
        const update = reduce((p, batch) => p.then(() => batchByItems(batch).catch((err) => console.log(err.writeErrors[0].err))), Promise.resolve());
        //const update = items => Promise.resolve().then(batchByItems(items).catch((err) => console.log(err.writeErrors[0].err))).catch(console.error);
    
        return update(batchedItems);
    }

    finish(items) {
        return this.store(items).then(() => this.client.close());
    }
}

module.exports = MongoLoadStream;
