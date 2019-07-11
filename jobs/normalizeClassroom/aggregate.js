
'use strict';

const {ascend, head, prop, pipe, map, tap, sortWith, groupWith, pick, eqBy} = require('ramda');
const {uniq} = require('../../lib/common.js');

const sortSeason = (s1, s2) => ({ '春': 1, '暑': 2, '秋': 3, '寒': 0 }[prop('termSeason', s1)] - { 春: 1, 暑: 2, 秋: 3, 寒: 0 }[prop('termSeason', s2)] );
const tapTs = name => tap((xs) => console.log(`${new Date().toJSON()} ${name}, ${xs.length} left.`));

module.exports = pipe(
	uniq,
	tapTs('uniq'),
	sortWith([
		ascend(prop('venueId')),
		ascend(prop('classroom')),
		ascend(prop('clsType')),
		ascend(prop('termYear')),
		sortSeason
	]),
	tapTs('sort'),
	groupWith(eqBy(pick(['venueId', 'classroom', 'clsType']))),
	tapTs('group'),
	map(head),
	tapTs('first'),
);
