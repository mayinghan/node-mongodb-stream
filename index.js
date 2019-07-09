
'use strict';

const nconf = require('nconf');
const path = require('path');
// const heapdump = require('heapdump');
const { pipe, map, tap } = require('ramda');

const cfg = nconf
	.argv()
	.env()
	.file('stage', path.resolve(__dirname, 'config/', 'env-' + nconf.get('NODE_ENV') + '.json'))
	.file(path.resolve(__dirname, 'config/', 'config.json'));

/* cfg.defaults({
}); */

cfg.required(['job']);


/**
 *  MongoStream
 * 	
 */

const MongoStream = require('./lib/MongoStream');

/**
 * entrance of the program for each job
 */

 const entrance = require(`./jobs/${cfg.get('job')}/${cfg.get('job')}.js`)

// const load = cfg.get(`jobs:${cfg.get('job')}:output:type`) === 'mongodb' ?
// 	loadToMongo({
// 		url: cfg.get(`jobs:${cfg.get('job')}:output:url`),
// 		db: cfg.get(`jobs:${cfg.get('job')}:output:db`),
// 		collection: cfg.get(`jobs:${cfg.get('job')}:output:collection`),
// 		key: cfg.get(`jobs:${cfg.get('job')}:output:key`),
// 		updateKeys: cfg.get(`jobs:${cfg.get('job')}:output:updateKeys`),
// 		insertKeys: cfg.get(`jobs:${cfg.get('job')}:output:insertKeys`),
// 		op: cfg.get(`jobs:${cfg.get('job')}:output:op`)
// 	}) : loadToCsv({
// 		dir: cfg.get(`jobs:${cfg.get('job')}:output:dir`),
// 		name: cfg.get(`jobs:${cfg.get('job')}:output:name`),
// 		fields: cfg.get(`jobs:${cfg.get('job')}:output:fields`)
// 	});


const stream = new MongoStream({
	connection: cfg.get(`jobs:${cfg.get('job')}:input:connection`),
	db: cfg.get(`jobs:${cfg.get('job')}:input:db`),
	collection: cfg.get(`jobs:${cfg.get('job')}:input:collection`),
	op: cfg.get(`jobs:${cfg.get('job')}:input:op`)
});

entrance(stream);