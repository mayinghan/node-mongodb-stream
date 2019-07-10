
'use strict';

const moment = require('moment');
const {times, objOf,flatten, dissoc, mergeRight, sortBy, prop, pathOr, tap, map, compose, pipe} = require('ramda');
const {renameKeys, overKey} = require('../../lib/common.js');
const normalizeEnrollment = require('../../lib/normalizeEnrollmentRecord.js');
const deduplicationRecord = require('../../lib/deduplicationEnrollmentRecord.js');
const mergeOnlineCourse = require('../../lib/mergeOnlineCourse.js');
const addFields = require('./addFields.js');
const omitFields = require('./omitFields');

const manipulateItem = compose(
	omitFields,
	addFields
);

const enrollments = compose(
	sortBy(prop('date')),
	deduplicationRecord,
	map(normalizeEnrollment)
);

module.exports =
	pipe(
		map(renameKeys({'cla_course_id': 'courseId', 'cla_start_date': 'startDate', 'cla_term_name': 'termName','cla_price':'price', 'cla_class_count':'nLesson', 'cla_end_date':'endDate'})),
		tap(()=>console.log(`${new Date().toJSON()} renamed keys.`)),
		mergeOnlineCourse,
		tap((items)=>{
			const nRecords = items.reduce((acc, item) => {
				return acc + item.enrollment.length;
			}, 0);
			console.log(`${new Date().toJSON()} merged online courses. nEnrollmentRecords: ${nRecords}`);
		}),
		map(overKey('timeTable', pathOr([],['0','course_table']))),
		tap(()=>console.log(`${new Date().toJSON()} timeTable has been modified.`)),

		map(overKey('enrollment', enrollments)),
		
		tap(()=>console.log(`${new Date().toJSON()} enrollment records sorted.`)),
		map(item => {
			if(item.timeTable.length===0){
				const periodDays = (new Date(item.endDate) - new Date(item.startDate)) / 86400 / 1000 + 1;
				const daysBetween = periodDays / Number(item.nLesson);// (days) between two lesson
				const generateOneLesson = i => ({lessonDate: moment(item.startDate,'YYYY-MM-DD').add(i * daysBetween, 'd').format('YYYY-MM-DD')});
				const tbs = times(generateOneLesson , Number(item.nLesson));
				
				if(tbs.length!=item.nLesson){
					console.log(item.cla_id, item.startDate, item.endDate);
					console.log(tbs);
					console.log(periodDays, daysBetween);
				}

				return tbs.map(mergeRight(dissoc('timeTable',item)));
			}else{
				return item.timeTable.map(tb => objOf('lessonDate')(tb.cuc_class_date || moment.unix(tb.endTime).format('YYYY-MM-DD'))).map(mergeRight(dissoc('timeTable',item)));
			}
		}),
		tap(()=>console.log(`${new Date().toJSON()} unfolded to lesson records.`)),
		flatten,
		map(manipulateItem),
		// tap(items => console.log(items)),
		tap(()=>console.log(`${new Date().toJSON()} manipulated items .`))
		// tap(items => console.log(items.slice(0,10).map(prop('timeTable'))))
	);
