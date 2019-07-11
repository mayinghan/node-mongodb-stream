
'use strict';

const {omit, keys, o, filter, ap, flip, test} = require('ramda');

const datePointKeys = o( filter(test(/\d{4}-\d{2}-\d{2}/)), keys);

module.exports = ap(flip(omit), datePointKeys);
