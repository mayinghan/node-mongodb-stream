
'use strict';

const {both, converge, mergeRight, last, groupWith, complement, test, mean, sum, of, toPairs, unnest, split, o, zip, tail, concat, fromPairs, ap, T, length, head, prop, pipe, map, tap, filter, sortBy, eqProps, propEq, reduce, over, lensProp, compose, flip, assoc, sortWith, descend, ascend, pick, eqBy, propSatisfies, juxt} = require('ramda');
const {countDistinct, statGroupBy} = require('../../lib/common.js');

const tapTs = name => tap((xs) => console.log(`${new Date().toJSON()} ${name}, ${xs.length} left.`));

// const offlineOnly = propSatisfies(test(/面授|双师/), 'clsType');
const incomeOfOneLesson = item => item.lessonPrice * item.nearestEnrollment;
const done = item => new Date(item.lessonDate) <= new Date();
const todo = item => new Date(item.lessonDate) > new Date();
// const offlineOnlyDone = both(done, offlineOnly);
// const offlineOnlyTodo = both(done, offlineOnly);

const doneIncomeByCity = statGroupBy(incomeOfOneLesson, it => `doneIncome-city-${it.city}-${it.clsType}-${it.termYearOfCourse}-${it.termSeasonOfCourse}-${it.termYearOfLesson}-${it.termSeasonOfLesson}`, done, sum);
const todoIncomeByCity = statGroupBy(incomeOfOneLesson, it => `todoIncome-city-${it.city}-${it.clsType}-${it.termYearOfCourse}-${it.termSeasonOfCourse}-${it.termYearOfLesson}-${it.termSeasonOfLesson}`, todo, sum);

const doneIncomeBySubject = statGroupBy(incomeOfOneLesson, it => `doneIncome-subject-${it.subject}-${it.clsType}-${it.termYearOfCourse}-${it.termSeasonOfCourse}-${it.termYearOfLesson}-${it.termSeasonOfLesson}`, done, sum);
const todoIncomeBySubject = statGroupBy(incomeOfOneLesson, it => `todoIncome-subject-${it.subject}-${it.clsType}-${it.termYearOfCourse}-${it.termSeasonOfCourse}-${it.termYearOfLesson}-${it.termSeasonOfLesson}`, todo, sum);

const doneIncomeByGroup = statGroupBy(incomeOfOneLesson, it => `doneIncome-group-${it.group}-${it.clsType}-${it.termYearOfCourse}-${it.termSeasonOfCourse}-${it.termYearOfLesson}-${it.termSeasonOfLesson}`, done, sum);
const todoIncomeByGroup = statGroupBy(incomeOfOneLesson, it => `todoIncome-group-${it.group}-${it.clsType}-${it.termYearOfCourse}-${it.termSeasonOfCourse}-${it.termYearOfLesson}-${it.termSeasonOfLesson}`, todo, sum);

const groups = juxt([
	doneIncomeByCity,
	todoIncomeByCity,
    
	doneIncomeBySubject,
	todoIncomeBySubject,
    
	doneIncomeByGroup,
	todoIncomeByGroup
]);

const dimensionKeys = ['dimensionName', 'dimensionValue', 'clsType', 'termYearOfCourse', 'termSeasonOfCourse', 'termYearOfLesson', 'termSeasonOfLesson'];
const fieldsFromPair = ([fst,lst]) => {
	const splitFields = split('-');
	const getIndicatorName = o(head, splitFields);
	const getDimensions = o(tail, splitFields);
	const fixedFields = [
		['indicator', getIndicatorName(fst) ],
		['value', lst]
	];
	
	return pipe(getDimensions, zip(dimensionKeys), concat(fixedFields), fromPairs) (fst);
};

module.exports = pipe(
	groups,
	map(toPairs),
	unnest,
	map(fieldsFromPair)
);
