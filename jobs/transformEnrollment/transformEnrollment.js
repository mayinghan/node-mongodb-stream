'use strict';

const { pipe, map, tap } = require('ramda');
const funcGroup = {
    transform: require('./transform'),
    aggregate: require('./aggregate')
}

let counter = 0;
let dataContainer = [];

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

module.exports = (source, destination) => {
    source
        .on('batch', (docs, done) => {
            counter += docs.length;
            console.log(counter);
            //do the job
            dataContainer.push(...pipeFunc(docs, ['transform', 'aggregate']));
            //console.log(`${dataContainer.length} items in the buffer`)

            destination.store(dataContainer)
                .then(() => {
                    console.log('write done');
                    done();
                })
                .catch(console.error)
            dataContainer = [];
        })
        .on('done', docs => {
            //get the last batch of data
            counter += docs.length;
            console.log(counter);

            //do the job
            dataContainer.push(...pipeFunc(docs, ['transform', 'aggregate']));

            //store and close the db
        
            destination.final(dataContainer)
                .then(() => {
                    console.log('All job done!!');
                });

            dataContainer = null;
        });
}