'use strict';

const { pipe, map, tap } = require('ramda');
const funcGroup = {
    transform: require('./transform'),
    aggregate: require('./aggregate')
}

let counter = 0;
let dataContainer = [];
let result = [];

const pipeFunc = (docs, func) => {
    if(func.length === 2) {
        return pipe(
            funcGroup[func[0]],
            tap((x) => (console.log(`${func[0]} done: ${x.length} documents`))),
            funcGroup[func[1]],
            tap((x) => (console.log(`${func[1]} done: ${x.length} documents`)))
        )(docs)
    } else {
        return pipe(
            funcGroup[func[0]],
            tap((x) => (console.log(`${func[0]} done: ${x.length} documents`))),
        )(docs)
    }
};

module.exports = (stream, destination) => {
    stream
        .on('batch', (docs, done) => {
            counter += docs.length;
            console.log(counter);
            //do the job
            dataContainer.push(...pipeFunc(docs, ['transform']));
            //console.log(`${dataContainer.length} items in the buffer`)
            done();
        })
        .on('done', docs => {
            //get the last batch of data
            counter += docs.length;
            console.log(counter);

            //do the job
            dataContainer.push(...pipeFunc(docs, ['transform']));

            //store and close the db
            result = [...pipeFunc(dataContainer, ['aggregate'])];
            dataContainer = null;
            destination.finish(result)
                .then(() => {
                    console.log('All job done!!');
                });
        });
}