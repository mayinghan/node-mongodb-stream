
'use strict';

const {mergeLeft, converge} = require('ramda');

module.exports = (addFields, omitFields) => converge(mergeLeft, [addFields, omitFields]);
