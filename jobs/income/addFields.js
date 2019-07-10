
'use strict';

const {tap, dropWhile, pick, mean, map, isNil, last, sortBy, match, nth, o, compose, prop, propOr, head, mergeRight, applySpec, ap} = require('ramda');
const {fillWhenBy, renameKeys, overKey} = require('../../lib/common.js');

const termMap = ['寒', '寒', '春', '春', '春', '暑', '暑', '暑', '秋', '秋', '秋', '寒'];
const translateName = name => propOr('Other/Multi Subject', name, {
	'语文': 'Language',
	'数学': 'Mathematics',
	'数学联赛': 'Mathematics',
	'英语': 'English',
	'英语2': 'English',
	'物理': 'Science',
	'生物化学': 'Science',
	'化学': 'Science',
	'科学': 'Science',
	'生物': 'Science'
});

const translateSubject = o(translateName, prop('cla_subject_names'));

const lessonPrice = (item) => item.price / Number(item.nLesson);

function enrollmentByDate(item) {
	const records = prop('enrollment', item);//sortBy(prop('date'), item.enrollment);
	const rst = binary_search(records, 0, records.length - 1, item.lessonDate);

	if (!(rst instanceof Array)) {
		return records[rst].course_regist_count;
	} else {
		const minus0 = new Date(records[rst[0]].date) - new Date(item.lessonDate);
		const minus1 = new Date(records[rst[1]].date) - new Date(item.lessonDate);
		
		return Math.abs(minus0) > Math.abs(minus1) ?
			records[rst[1]].course_regist_count
			: records[rst[0]].course_regist_count;
	}
}

function binary_search(arr, low, high, target) {
	if (arr[low].date >= target) {
		return low;
	}
	
	if (arr[high].date <= target) {
		return high;
	}
	
	while (low <= high) {
		let mid = parseInt((high + low) / 2);
		if (arr[mid].date == target) return mid;
		if (arr[mid].date < target) low = mid + 1;
		if (arr[mid].date > target) high = mid - 1;
	}

	return [high, low];
}

const matchDate = match(/(\d{4})-(\d{2})/);
const getYear = compose(Number, nth(1), matchDate, prop('startDate'));
const getMonth = compose(Number, nth(2), matchDate, prop('startDate'));

const termSeason = compose(head, prop('termName'));

const getTerm = (item) => (termSeason(item) === '寒' && getMonth(item) > 10 ? getYear(item) + 1 : getYear(item) ) + (termSeason(item));

const getTermYear = compose(Number, head, match(/(\d+)/g), getTerm);

function termOfLesson(item) {
	let matches = item.lessonDate.match(/(\d{4})-(\d{2})/);
	let year = Number(matches[1]);
	let month = Number(matches[2]);
	let term = termMap[month - 1];
	year = (month == 12) ? (year + 1) : year;
	return [year, term];
}

const newFields = applySpec({
	termYearOfLesson: compose(head, termOfLesson),
	termSeasonOfLesson: compose(last, termOfLesson),
	termYearOfCourse: getTermYear,
	termSeasonOfCourse: termSeason,
	subject: translateSubject,
	nearestEnrollment: enrollmentByDate,
	lessonPrice: lessonPrice
});

module.exports = ap(mergeRight, newFields);
