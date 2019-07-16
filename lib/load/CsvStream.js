
'use strict';

const fs = require('fs');
const moment = require('moment');
const Event = require('events').EventEmitter;
const { props, join, compose, map } = require('ramda');

class CsvStream extends Event {
    constructor({ fields, dir, name }) {
        super();

        this.fields = fields;
        this.writeStream = fs.createWriteStream(`${dir}${name}_${moment().format('YYYY-MM-DD')}.test.csv`);
        this.writeStream.write(`\ufeff${fields.join()}\n`);
        this.emit('ready');
    }

	init() {
		this.emit('ready');
	}
	/**
	   write an array of Objects
	   */
    write(item) {
        const valuesToLine = compose(join(','), props(this.fields));
        const toLines = compose(join('\n'), map(valuesToLine));

        this.writeStream.write(toLines(item));
    }

	/**
	   write arrays of string(number)
	*/
	writeArray(item) {
		const valuesToLine = compose(join(','));
		const toLines = compose(join('\n'), map(valuesToLine));

		this.writeStream.write(toLines(item));
}

module.exports = CsvStream;
