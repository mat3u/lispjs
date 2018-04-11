const _ = require('lodash');
const parser = require('./parser');

const flatMap = (op, arr) => _.flatMap(arr, op);
const nullify = v => v === undefined ? null : v;

const L = (...args) => {
    return;
    console.log(...args);
};

const interpreter = (initial) => {
    const globals = { ...initial
    };

    const functions = {
        'debug': (vars, ...args) => {
            L('ARGS:', args, 'EVAL:', flatMap(arg => arg(vars), args));
            return 0;
        },

        // Math
        'max': (vars, ...args) => Math.max(...(flatMap(arg => arg(vars), args))),
        'min': (vars, ...args) => Math.min(...(flatMap(arg => arg(vars), args))),
        'cos': (vars, v) => Math.cos(v(vars)),
        'sin': (vars, v) => Math.sin(v(vars)),
        'abs': (vars, v) => Math.abs(v(vars)),
        'sqrt': (vars, v) => Math.sqrt(v(vars)),
        'pow': (vars, v, p) => Math.pow(v(vars), p(vars)),
        '+': (vars, a, b) => a(vars) + b(vars),
        '-': (vars, a, b) => (b === undefined ? -a(vars) : a(vars) - b(vars)),
        '*': (vars, a, b) => a(vars) * b(vars),
        '%': (vars, a, b) => a(vars) % b(vars),
        '/': (vars, a, b) => a(vars) / b(vars),

        // Logic
        'eq': (vars, a, b) => a(vars) === b(vars),
        'not': (vars, v) => !v(vars),
        'and': (vars, a, b) => a(vars) && b(vars),
        'or': (vars, a, b) => a(vars) || b(vars),
        'xor': (vars, a, b) => {
            const av = a(vars);
            const bv = b(vars);

            return (a || !b) && (!a || b);
        },
        '<': (vars, a, b) => a(vars) < b(vars),

        // String
        'to-upper': (vars, v) => v(vars).toUpperCase(),
        'to-lower': (vars, v) => v(vars).toLowerCase(),
        'join': (vars, sep, ...args) => flatMap(arg => arg(vars), args).join(sep(vars)),
        'split': (vars, sep, str) => str(vars).split(sep(vars)),
        'to-str': (vars, val) => `${val(vars)}`,
        'print': (vars, val) => process.stdout.write(`${val(vars)}`),
        'println': (vars, val) => process.stdout.write(`${val(vars)}\r\n`),

        // Date time

        // Misc: defun, let, lambda(?)
        'defun': (closurevars, namef, argfs, body) => {
            const name = namef.__def__.var;
            const fnargs = argfs.__def__.map(argf => argf.func || argf.var);

            if (!_.isString(name)) {
                throw `Function name should be a string! Got: ${name}`;
            }

            if (!!functions[name]) {
                throw `Function with name '${name}' already exists!`;
            }

            functions[name] = (vars, ...args) => {
                const invocationVars = {};

                for (const idx in fnargs) {
                    invocationVars[fnargs[idx]] = nullify(args[idx]) === null ? null : args[idx](vars);
                }

                L('defun vars:', { ...closurevars,
                    ...vars,
                    ...invocationVars
                });

                return body({ ...closurevars,
                    ...vars,
                    ...invocationVars
                });
            }
        },
        'let': (vars, name, expr) => {
            const varname = name.__def__.var;

            if (!varname) {
                throw "Bad variable name!";
            }

            globals[varname] = expr(vars);
        },
        'if': (vars, expr, iftrue, iffalse) => {
            if (expr(vars)) {
                return iftrue(vars);
            } else {
                return iffalse(vars);
            }
        },
        '!': (vars, ...args) => {
            let result;
            for (const arg of args) {
                result = arg(vars);
            }

            return result;
        }
    };
  
    const eval = (ast, variables) => {
        //L('eval!', '\r\n\tAST: ', ast, '\r\n\t Variables: ', variables);
        if (_.isString(ast) || _.isInteger(ast) || _.isBoolean(ast) || _.isFinite(ast)) {
            return ast;
        }

        if (_.isArray(ast)) { // BExpression
            const S = ast[0];

            if (!!S.func) {
                if (!functions[S.func]) {
                    const varvalue = eval([{
                        var: S.func
                    }, ...ast.slice(1)], variables);

                    if (varvalue) {
                        return varvalue;
                    }

                    throw `Function '${S.func}' is undefined!`;
                }

                const f = functions[S.func];

                const toVarFun = v => {
                    const f = vars => eval(v, vars);

                    f.__def__ = v;

                    return f;
                };

                const args = _.drop(ast, 1).map(toVarFun);

                return nullify(f.call(null, variables, ...args));
            }

            if (!!S.var) {
                const varf = variables[S.var];

                if (_.isFunction(varf)) {
                    return varf(variables);
                } else {
                    return nullify(varf);
                }
            }
        }

        if (_.isObject(ast)) {
            return eval([ast], variables);
        }
    };

    return {
        run: source => {
            try {
                return eval(parser.parse(source.trim())[0], globals);
            } catch (e) {
                console.log('-----------------------------------')
                console.log('Error when parsing file: ', source);
                console.log(e);
            }
        }
    }
}

exports.interpreter = interpreter;