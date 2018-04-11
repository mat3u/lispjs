const _ = require('lodash');
const parser = require('./parser');

const flatMap = (op, arr) => _.flatMap(arr, op);

const L = (...args) => {
    console.log(...args);
};

const interpreter = (initial) => {
    const globals = { ...initial
    };

    const functions = {
        'debug': (g, l, ...args) => {
            L('ARGS:', args, 'EVAL:', flatMap(arg => arg(g, l), args));
            return 0;
        },

        // Math
        'max': (g, l, ...args) => Math.max(...(flatMap(arg => arg(g, l), args))),
        'min': (g, l, ...args) => Math.min(...(flatMap(arg => arg(g, l), args))),
        'cos': (g, l, v) => Math.cos(v(g, l)),
        'sin': (g, l, v) => Math.sin(v(g, l)),
        'abs': (g, l, v) => Math.abs(v(g, l)),
        'sqrt': (g, l, v) => Math.sqrt(v(g, l)),
        'pow': (g, l, v, p) => Math.pow(v(g, l), p(g, l)),
        '+': (g, l, a, b) => a(g, l) + b(g, l),
        '-': (g, l, a, b) => (b === undefined ? -a(g, l) : a(g, l) - b(g, l)),
        '*': (g, l, a, b) => a(g, l) * b(g, l),
        '%': (g, l, a, b) => a(g, l) % b(g, l),
        '/': (g, l, a, b) => a(g, l) / b(g, l),

        // Logic
        'eq': (g, l, a, b) => a(g, l) === b(g, l),
        'not': (g, l, v) => !v(g, l),
        'and': (g, l, a, b) => a(g, l) && b(g, l),
        'or': (g, l, a, b) => a(g, l) || b(g, l),
        'xor': (g, l, a, b) => {
            const av = a(g, l);
            const bv = b(g, l);

            return (a || !b) && (!a || b);
        },
        '<': (g, l, a, b) => a(g, l) < b(g, l),

        // String
        'to-upper': (g, l, v) => v(g, l).toUpperCase(),
        'to-lower': (g, l, v) => v(g, l).toLowerCase(),
        'join': (g, l, sep, ...args) => flatMap(arg => arg(g, l), args).join(sep(g, l)),
        'split': (g, l, sep, str) => str(g, l).split(sep(g, l)),
        'to-str': (g, l, val) => `${val(g, l)}`,
        'print': (g, l, text) => console.log(text(g, l)),
        'println': (g, l, text) => console.log(`${text(g, l)}\r\n`),

        // Date time

        // Misc: defun, let, lambda(?)
        'defun': (cg, cl, namef, argfs, body) => {
            const name = namef.__def__.var;
            const fnargs = argfs.__def__.map(argf => argf.func || argf.var);

            if (!_.isString(name)) {
                throw `Function name should be a string! Got: ${name}`;
            }

            if (!!functions[name]) {
                throw `Function with name '${name}' already exists!`;
            }

            functions[name] = (g, l, ...args) => {
                const invocationVars = {};

                for (const idx in fnargs) {
                    invocationVars[fnargs[idx]] = (_c, _l) => {  args[idx] ? args[idx](g, l) : null };
                }

                L('defun vars:', { ...g,
                    ...l,
                    ...cg,
                    ...cl,
                    ...invocationVars
                });

                return body({
                    ...g,
                    ...cg,
                }, {...invocationVars, ...l, ...cl});
            }
        },
        'let': (g, l, name, expr) => {
            const varname = name.__def__.var;

            if (!varname) {
                throw "Bad variable name!";
            }

            globals[varname] = expr(g ,l);
        },
        'if': (g, l, expr, iftrue, iffalse) => {
            if (expr(g, l)) {
                return iftrue(g, l);
            } else {
                return iffalse(g, l);
            }
        },
        '!': (g, l, ...args) => {
            let result;
            for (const arg of args) {
                result = arg(g, l);
            }

            return result;
        }
    };

    const evalS = (S, ast, globals, locals) => {
        L('----------------------------', '\r\nS-Expr: ', S, '\r\nAST: ', ast, '\r\nVariables: ', globals, '\r\nLocals: ', locals);
        if (!!S.func) {
            if (!functions[S.func]) {
                const varvalue = evalS({
                    var: S.func
                }, ast, globals, locals);

                // Should be checked against undefined, because null is a valid value!
                if (varvalue) {
                    return varvalue;
                }

                throw `Function '${S.func}' is undefined!`;
            }

            const f = functions[S.func];

            const toVarFun = v => {
                const f = (globals, locals) => eval(v, globals, locals);

                f.__def__ = v;

                return f;
            };

            const args = _.drop(ast, 1).map(toVarFun);

            return f.call(null, globals, locals, ...args) || null;
        }

        if (!!S.var) {
            // BUG?: What if in locals will be null?
            const varf = locals[S.var] || globals[S.var];

            if (_.isFunction(varf)) {
                return varf(globals, locals);
            } else {
                return varf || null;
            }
        }
    }

    const eval = (ast, globals, locals) => {
        if (_.isString(ast) || _.isInteger(ast) || _.isBoolean(ast) || _.isFinite(ast)) {
            return ast;
        }

        if (_.isArray(ast)) { // BExpression
            if (_.isObject(ast[0])) { // Func / Var / ...
                return evalS(ast[0], ast, globals, locals);
            } else {
                throw "Unsupported type of node!";
            }
        }

        if (_.isObject(ast)) {
            return evalS(ast, ast, globals, locals);
        }
    };

    return {
        run: source => {
            try {
                return eval(parser.parse(source.trim())[0], globals, {});
            } catch (e) {
                console.log('-----------------------------------')
                console.log('Error when parsing file: ', source);
                console.log(e);
            }
        }
    }
}

exports.interpreter = interpreter;