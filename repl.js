const readline = require('readline');
const lisp = require('./lisp');
const fs = require('fs');

let instance = lisp.interpreter({});

const runFile = path => {
    fs.readFile(path, 'utf8', (err, file) => {
        if (err) {
            console.log(err);
            return;
        }
        instance.run(file);
    });
}

instance.run('(import "stdlib")')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let buffer = '';
process.stdout.write('> ');
rl.on('line', line => {
    try {
        const text = line.trim();
        switch (text) {
            case '':
                process.stdout.write(
                    `${instance.run(buffer || '\'()')}`
                );
                process.stdout.write('\r\n')
                buffer = '';
                break;
            case ':Q':
                rl.close();
                return;
            default:
                buffer += line;
                break;
        }
    } finally {
        process.stdout.write('> ');
    }
});