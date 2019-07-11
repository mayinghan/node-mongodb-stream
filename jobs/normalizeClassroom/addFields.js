
'use strict';

const {match, nth, o, compose, prop, head} = require('ramda');

const matchDate = match(/(\d{4})-(\d{2})/);
const getYear = compose(Number, nth(1), matchDate, prop('cla_start_date'));
const getMonth = compose(Number, nth(2), matchDate, prop('cla_start_date'));

const matchTerm = o(match(/春季班|秋季班|寒假班|暑期班/g), prop('cla_term_name'));
const termSeason = compose(head, head, matchTerm);

const getTerm = (item) => (termSeason(item) === '寒' && getMonth(item) > 10 ? getYear(item) + 1 : getYear(item) ) + (termSeason(item));

const getTermYear = compose(Number, head, match(/(\d+)/g), getTerm);

module.exports = item => {
	return {
		termYear: getTermYear(item),
		termSeason: termSeason(item),
	};
};
