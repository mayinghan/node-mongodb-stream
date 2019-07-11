
'use strict';

const Future = require('fluture');
const MongoClient = require('mongodb').MongoClient;
const {pick, reduce, splitEvery} = require('ramda');

module.exports = options => items => {
	console.log(items.length)
	const {url, db, collection, key, updateKeys, insertKeys, op='upsert', batchSize=10000} = options;
	const connect = Future.encaseP( url => new MongoClient(url).connect() );
	const withConnection = Future.hook(
		connect(url),
		client => Future.try(client.close.bind(client))
	);

	const initBulkOp = (client, db, collection) => client.db(db).collection(collection).initializeUnorderedBulkOp();
	const batchUpsert = (client, db, collection, op, items) => reduce(op, initBulkOp(client, db, collection), items).execute();

	const getOp = op => op==='upsert' ? 
		(bulk, item) => bulk.find(pick(key, item)).upsert().update({$set: pick(updateKeys, item),$setOnInsert: pick(insertKeys, item)}) && bulk : 
		(bulk, item) => bulk.insert(item) && bulk;
	
	return withConnection(
		client => {
			//const batchedItems = splitEvery(batchSize, items);
			const batchByItems = (batch) => batchUpsert(client, db, collection, getOp(op), batch);
			const update = items => Promise.resolve().then(batchByItems(items)).catch(console.error);
			
			return Future.tryP(() => update(batchedItems));
		}
	);
};

