'use strict';

const { pipe, map, tap } = require('ramda');
const funcGroup = {
	transform: require('./transform'),
	aggregate: require('./aggregate')
}

let counter = 0;
let dataContainer = [];
let result = null;

const pipeFunc = (docs, func) => pipe(
	funcGroup[func],
	tap((x) => (console.log(`${func} done: ${x.length} documents`))),
)(docs);

module.exports = (stream, destination) => stream
	.on('batch', (docs, done) => {
		counter += docs.length;
		console.log(counter);

		//do the job
		dataContainer.push(...pipeFunc(docs, 'transform'));

		//done
		done();
	})
	.on('done', docs => {
		//get the last batch of data
		counter += docs.length;
		//do the job
		dataContainer.push(...pipeFunc(docs, 'transform'));
		console.log(dataContainer[dataContainer.length - 1]);

		//do final aggregation
		result = [...pipeFunc(dataContainer, 'aggregate')];
		dataContainer = null;
		
		destination.write(result);
	});