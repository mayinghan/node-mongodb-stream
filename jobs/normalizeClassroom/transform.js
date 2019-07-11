
'use strict';

const {propEq, map, compose, filter, reject, pipe, propSatisfies, test} = require('ramda');
const {renameKeys} = require('../../lib/common.js');
const manipulateField = require('../../lib/manipulateField.js');
const addFields = require('./addFields.js');
const omitFields = require('./omitFields');

const manipulateItem = compose(
	renameKeys({'cla_venue_id': 'venueId', 'cla_venue_name':'venueName', 'cla_classroom_name': 'classroom'}),
	manipulateField(addFields, omitFields)
);

module.exports =
	pipe(
		reject(propSatisfies(test(/虚拟教学点|待定考室/),'cla_venue_name')),
		map(manipulateItem),
	);
