const fs = require('fs');
const lisp = require('./lisp');

let instance = lisp.interpreter({});

const path = process.argv[2] || './test.lisp';

const runFile = path => {
    fs.readFile(path, 'utf8', (err, file) => {
        if (err) {
            console.log(err);
            return;
        }
        instance.run(file);
    });
}

runFile(path);