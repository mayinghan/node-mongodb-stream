
'use strict';

const {omit, test, objOf, map, apply, filter, assoc, toPairs, match, nth, o, compose, propOr, prop, head, gt} = require('ramda');

const datePointFilter = compose(test(/\d{4}-\d{2}-\d{2}/), head);
const assocByTuple = apply(assoc('date'));
const filterStarDate = (item) => {
    let startDate = new Date(item.cla_start_date);
    let potentOmitDate = [];
    let pairs = toPairs(item);

    for(let field of pairs) {
        let date = head(field);
        
        if(test(/\d{4}-\d{2}-\d{2}/, date)) {
            let currDate = new Date(date);

            if(currDate > startDate) {
                return omit(potentOmitDate, item);
            }
            potentOmitDate.push(date);
        }
    }
    return item;
}

module.exports = compose(objOf('enrollment'), map(assocByTuple), filter(datePointFilter), toPairs, filterStarDate);