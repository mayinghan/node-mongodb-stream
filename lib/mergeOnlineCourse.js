
'use strict';

const {sortWith, ascend, reject, converge, mergeRight, last, groupWith, concat, prop, pipe, map, sortBy, eqProps, propEq, reduce, over, lensProp, partition, compose, o, head} = require('ramda');

// [a] -> a
const combineEnrollmentByCourse = reduce( (acc, item) => over(lensProp('enrollment'), concat(item.enrollment), acc), {enrollment:[]});

// [a] -> [a]
const mergeEnrollmentRecords = pipe(
	sortWith([
		ascend(prop('courseId')),
		ascend(prop('city'))
	]),
	groupWith((a, b) => a.courseId + a.city === b.courseId + b.city),
	map(
		converge(mergeRight, [last, combineEnrollmentByCourse])
	)
);

// [a] -> [a]
module.exports = compose(
	converge(
		concat,
		[
			o(mergeEnrollmentRecords, head),
			last
		]
	),
	partition(propEq('clsType', '在线'))
);
