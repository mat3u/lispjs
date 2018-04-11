const fs = require('fs');
const lisp = require('./lisp');
const stdlib = require('./stdlib');

let instance = lisp.interpreter({});

for (expr of stdlib.expressions) {
    instance.run(expr);
}

console.log('################################################');

const path = process.argv[2] || './test/iter.lisp';

fs.readFile(path, 'utf8', (err, file) => {
    if (err) {
        console.log(err);
        return;
    }
    instance.run(file);
});