const readline = require('readline');
const lisp = require('./lisp');
const stdlib = require('./stdlib');

let instance = lisp.interpreter({});

for (expr of stdlib.expressions) {
    //console.log(expr);
    instance.run(expr);
}

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