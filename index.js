
'use strict';

const nconf = require('nconf');
const path = require('path');
const heapdump = require('heapdump');
const { map } = require('ramda');

const cfg = nconf
	.argv()
	.env()
	.file( 'stage', path.resolve( __dirname, 'config/', 'env-' + nconf.get( 'NODE_ENV' ) + '.json' ) )
	.file( path.resolve( __dirname, 'config/', 'config.json' ) );

/* cfg.defaults({
}); */

cfg.required([ 'job']);


/** extract
 *    {k: v} -> Future a b
 *
 */
const extract = require('./lib/extract/');

/** transform
 *    a -> c
 *
 */
const transform = require(`./jobs/${cfg.get('job')}/transform.js`);

/** aggregate
 *    [c] -> d
 *
 */
const aggregate = require(`./jobs/${cfg.get('job')}/aggregate.js`);

/** load
 *   Any -> Future a b
 *
 */
const loadToCsv = require('./lib/load/csv.js');
const loadToMongo = require('./lib/load/mongo.js');

const load = cfg.get(`jobs:${cfg.get('job')}:output:type`) === 'mongodb' ?
	loadToMongo({
		url: cfg.get(`jobs:${cfg.get('job')}:output:url`),
		db: cfg.get(`jobs:${cfg.get('job')}:output:db`),
		collection: cfg.get(`jobs:${cfg.get('job')}:output:collection`),
		key: cfg.get(`jobs:${cfg.get('job')}:output:key`),
		updateKeys: cfg.get(`jobs:${cfg.get('job')}:output:updateKeys`),
		insertKeys: cfg.get(`jobs:${cfg.get('job')}:output:insertKeys`),
		op: cfg.get(`jobs:${cfg.get('job')}:output:op`)
	}) : loadToCsv({
		dir: cfg.get(`jobs:${cfg.get('job')}:output:dir`),
		name: cfg.get(`jobs:${cfg.get('job')}:output:name`),
		fields: cfg.get(`jobs:${cfg.get('job')}:output:fields`)
	});

extract({
	connection: cfg.get(`jobs:${cfg.get('job')}:input:connection`),
	db: cfg.get(`jobs:${cfg.get('job')}:input:db`),
	collection: cfg.get(`jobs:${cfg.get('job')}:input:collection`),
	op: cfg.get(`jobs:${cfg.get('job')}:input:op`)
})
	.map(x => (console.log(`${new Date().toJSON()} Pulled ${x.length} documents done.`), x))
	.map(transform)
	.map(x => (console.log(`${new Date().toJSON()} Transformed ${x.length} documents done.`), x) )
	.map(aggregate)
	.map(x => (console.log(`${new Date().toJSON()} Aggregated ${x.length} documents done.`), x) )
	.chain(load)
	.fork(console.error, () => (console.log(`${new Date().toJSON()} Load documents done.`)));
	