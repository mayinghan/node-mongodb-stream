
'use strict';

const {map, compose, pipe} = require('ramda');
const manipulateField = require('../../lib/manipulateField.js');
const addFields = require('./addFields.js');
const omitFields = require('./omitFields');

const manipulateItem = compose(
	manipulateField(addFields, omitFields)
);

module.exports =
	pipe(
		map(manipulateItem),
	);
