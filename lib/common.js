
const {groupBy, reduce, allPass, complement, trim, not, isEmpty, either, T, curry, compose, assoc, keys, cond, ifElse, identity, map, is, propSatisfies, when, set, lensProp, ap, flip, replace, over, uniqBy,uniq, sortBy, transpose, filter, mapObjIndexed, last, times, init, join, values, pipe, groupWith, head, eqBy, length, fromPairs} = require('ramda');

// {k : v} -> {k : x} -> {x : v}
const renameKeys = curry(
	(keysMap, obj) =>
		fromPairs(
			map(key => [keysMap[key] || key, obj[key]])(keys(obj))
		)
);

// String -> Boolean
const hasContent = compose(not, isEmpty, trim);

// * -> Boolean
const numerical = allPass( [is(String),  hasContent, complement(isNaN)] );

// Functor f => (a -> b) -> f a -> f b
function mapRecusive(fn){
	return function mf(a){
		return cond([
			[either(is(Array), is(Object)), map(mf)],
			[is(String), fn],
			[T, identity]
		])(a);
	};
}

// a -> a | Number
const ensureNumber = ifElse( numerical, Number, identity);

// Functor f = f a -> f b
const ensureNumberDeep = mapRecusive(ensureNumber);

/**
 *    (a → Boolean) → String → ({String: a} → b) → {String: a} → {String: b}
 *
 *
 */ 
const fillWhenBy = (predicate, key, fn)=>when(
	propSatisfies(predicate, key),
	ap(
		flip(
			set(lensProp(key))
		),
		fn
	)
);

//const cleanBlank = val => is(String, val) ? val.replace(/\s+/g, ' ') : val;

/**
 *    (a → Boolean) → (a → a) → a → a
 *
 *
 */
const cleanBlank = when(is(String), replace(/\s+/g, ''));

/**
 *    String → (a → b) → {String: a} → {String: b}
 *
 *
 */
const overKey = (key, fn) => over(lensProp(key), fn);

// const overKeys = ()=>();

const summary = ()=>{};

const groupByMultiple = curry((fields, data) => {
	if (fields.length === 1) return groupBy(fields[0], data);
	
	let groupBy = groupBy(last(fields));
	
	times(() => {
		groupBy = mapObjIndexed(groupBy);
	}, fields.length - 1);

	return groupBy(groupByMultiple(init(fields), data));
});

const statGroupBy = curry( (valueFn, keyFn, predicate, statFn) => compose(
	map(
		compose(statFn, map(valueFn))
	),
	groupBy(keyFn),
	filter(predicate)
));

const countDistinct = compose(length, uniq);

const strValues = compose(join('_'), values);

// uniq :: [{k: v}] -> [{k: v}]
const uniqKv = pipe(
	sortBy(strValues),
	groupWith(eqBy(strValues)),
	map(head)
);

module.exports = {
	ensureNumberDeep,
	
	// for an item
	ensureNumber,
	renameKeys,
	fillWhenBy,
	cleanBlank,
	overKey,
	
	// for a list of items
	uniqBy,
	sortBy,
	transpose,
	filter,
	summary,
	statGroupBy,
	mapRecusive,
	uniq: uniqKv,
	countDistinct
};
