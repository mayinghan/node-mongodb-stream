
'use strict';

const R = require('ramda');
const {overKey, fillWhenBy} = require('./common.js');

module.exports = R.compose(
	overKey('course_regist_count', Number),
	fillWhenBy(R.isNil, 'course_regist_count', R.prop('crc_regist_count')),
	fillWhenBy(R.isNil, 'course_regist_count', R.prop('regist_count'))
);
