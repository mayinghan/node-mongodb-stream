'use strict';

const { pipe, map, tap } = require('ramda');
const transform = require('./transform');
const aggregate = require('./aggregate');

let counter = 0;
let dataContainer = [];

module.exports = stream => stream
	.on('batch', (docs, done) => {
		counter += docs.length;
		console.log(counter)
		//do the job
		let tempObj = pipe(
			transform,
			tap((x) => (console.log(`transform done: transfromed ${x.length} documents`))),
			aggregate,
			tap((x) => console.log(`aggregate ${x.length} documents done`))
		)(docs);

		dataContainer.push(...tempObj);

		//done
		done();
	})
	.on('done', docs => {
		//get the last batch of data
		count += docs.length;
		//do the job
		dataContainer.push(transform(docs));
	});