
'use strict';

const fs = require('fs');
const moment = require('moment');
const {keys, head, props, join, compose, map} = require('ramda');

class CsvStream {
    constructor({fields, dir, name}) {
        this.fields = fields;
        this.writeStream = fs.createWriteStream(`${dir}${name}_${moment().format('YYYY-MM-DD')}.test.csv`);
        this.writeStream.write(`\ufeff${fields.join()}\n`);
    }

    write(item) {
        const valuesToLine = compose(join(','), props(this.fields));
        const toLines = compose(join('\n'), map(valuesToLine));
        
        this.writeStream.write(toLines(item));
    }
}

module.exports = CsvStream;
