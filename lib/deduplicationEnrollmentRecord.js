
'use strict';

const R = require('ramda');
const maxEachDay = (acc, item, idx, list) => acc.has(item.date) ? item.course_regist_count > list[acc.get(item.date)].course_regist_count ? acc.set(item.date, idx) : acc : acc.set(item.date, idx);

module.exports = (items) => {
	return R.props(
		[...R.addIndex(R.reduce)(maxEachDay, new Map(), items).values()],
		items
	);
};
