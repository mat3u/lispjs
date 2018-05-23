const _ = require('lodash');
const fs = require('fs');
const process = require('process');
const parser = require('./parser');

const nullify = v => v === undefined ? null : v;

function getDifferenceShallow(object, base) {
    const result = {};

    for (const name of Object.getOwnPropertyNames(base)) {
        if(base[name] !== object[name]) {
            result[name] = object[name];
        }
    }

    return result;
}

const L = (...args) => {
    return;
    console.log(...args);
};

const parser_info = {
    version: "0.0.1",
    author: "Matt Stasch"
};

const stdlibDir = __dirname + '/lib';

const interpreter = (initial) => {
    const defvars = {};

    const eval = (ast, variables, functions) => {
        //console.log(ast);
        if (_.isString(ast) || _.isInteger(ast) || _.isBoolean(ast) || _.isFinite(ast) || ast === null) {
            return ast;
        }

        if (_.isArray(ast)) { // BExpression
            const S = ast[0];

            if (!!S.func) {
                const f = {
                    ...functions,
                    ...variables
                }[S.func];

                if (!f) {
                    throw `${S.func} is not defined!`;
                }

                const toVarFun = v => {
                    const f = vars => eval(v, vars, functions);

                    f.__def__ = v;

                    return f;
                };

                const args = _.drop(ast, 1).map(toVarFun);
                return nullify(f.call({
                    eval: true
                }, variables, ...args));
            }
        }

        // Evaluate variables
        if (_.isObject(ast) && ast.var) {
            const varf = { 
                ...functions,
                ...variables
            }[ast.var];

            // If variable is a function then return function
            if (varf && (varf.__type__ === 'func')) {
                return varf;
            }
            if (_.isFunction(varf)) {
                return varf(variables);
            } else {
                return nullify(varf);
            }
        }

        console.log('AST:', ast);
        throw "Unknown node type!";

    };

    const functions = {
        // Math
        'max': (vars, ...args) => Math.max(...(_.flatMap(args, arg => arg(vars)))),
        'min': (vars, ...args) => Math.min(...(_.flatMap(args, arg => arg(vars)))),
        'cos': (vars, v) => Math.cos(v(vars)),
        'sin': (vars, v) => Math.sin(v(vars)),
        'abs': (vars, v) => Math.abs(v(vars)),
        'sqrt': (vars, v) => Math.sqrt(v(vars)),
        'pow': (vars, v, p) => Math.pow(v(vars), p(vars)),
        '+': (vars, ...args) => _.reduce(_.flatMap(args, arg => arg(vars)), (v,e) => v + e, 0),
        '*': (vars, ...args) => _.reduce(_.flatMap(args, arg => arg(vars)), (v,e) => v * e, 1),
        '-': (vars, a, b) => (b === undefined ? -a(vars) : a(vars) - b(vars)),
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
        'lt': (vars, a, b) => a(vars) < b(vars),
        'gt': (vars, a, b) => a(vars) < b(vars),

        // String
        'raw': (vars, ...v) => String.fromCharCode(...v.map(v => v(vars))),
        'to-upper': (vars, v) => v(vars).toUpperCase(),
        'to-lower': (vars, v) => v(vars).toLowerCase(),
        'join': (vars, sep, ...args) => _.flatMap(args, arg => arg(vars)).join(sep(vars)),
        'split': (vars, sep, str) => str(vars).split(sep(vars)),
        'to-str': (vars, val) => `${val(vars)}`,
        'print': (vars, ...vals) => {
            const fragments = vals.map(v => {
                const value = v(vars);

                return typeof(value) === 'function' ? '(fun)' : value;
            });
            process.stdout.write(`${fragments.join("")}`)
        },
        'println': (vars, ...vals) => functions.print(vars, ...vals, () => "\r\n"),
        // Date time

        // Collections
        'empty': (vars) => [],
        'list': (vars, ...args) => [...args.map(a => a(vars))], // TODO: Should be lazy!
        'head': (vars, args) => {
            const ev = args(vars);
            return (ev || []).length === 0 ? null : ev[0];
        },
        'tail': (vars, args) => {
            const ev = args(vars);
            return (ev || []).length <= 1 ? [] : ev.slice(1);
        },
        'prepend': (vars, list, elem) => {
            return [elem(vars), ...(list(vars) || [])];
        },
        'append': (vars, list, elem) => [...(list(vars) || []), elem(vars)],
        'len': (vars, list) => (list(vars) || []).length,
        'eq-list': (vars, a, b) => _.every(_.zip(a(vars), b(vars)), ([a, b]) => a === b),

        // Misc: defun, let, lambda, import
        'import': (vars, name) => {
            const fname = name(vars);

            const searchPaths = [
                stdlibDir + '/' + fname,
                stdlibDir + '/' + fname + '.lisp',
                process.cwd() + '/' + fname,
                process.cwd() + '/' + fname + '.lisp'
            ];

            const path = _.find(searchPaths, v => fs.existsSync(v));

            const source = fs.readFileSync(path, 'utf8');

            eval(parser.parse(source.trim())[0], vars, functions);
        },
        'defun': (closureVars, namef, args, body) => {
            const name = namef.__def__.var;

            const argdefs = _.isArray(args.__def__) ? args.__def__ : [args.__def__];
            const fnargs = argdefs.map(def => def.func || def.var);

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

                return body({
                    ...vars,
                    ...closureVars,
                    ...invocationVars,
                });
            };

            functions[name].__type__ = 'func';
        },
        'lambda': (closureVars, args, body) => {
            const name = 'lambda_' + (new Date() * 1) + '_' + Math.random();

            functions.defun(closureVars, {
                __def__: {
                    var: name
                }
            }, args, body);

            return functions[name];
        },
        'let': (vars, name, expr) => {
            // TODO: Scoping of the variables - right now, let will make global variable
            const varname = name.__def__.var;

            if (!varname) {
                throw "Bad variable name!";
            }

            defvars[varname] = expr(vars);
        },
        'if': (vars, expr, iftrue, iffalse) => {
            if (expr(vars)) {
                return iftrue(vars);
            }
            return iffalse(vars);
        },
        '!': (vars, ...args) => {
            let result;
            const tmp_defvars = _.clone(defvars);
            for (const arg of args) {
                // PROBLEM!
                // defvars can change during each iteration, while vars (which should be assumed as context of invocations)
                // remains unchanged. In situation: vars = {A: 5}, when somebody will run (let A 10) then next lines will see still A as 5.
                // Following line finds differences and applies to context.
                const diffVars = getDifferenceShallow(defvars, tmp_defvars);

                result = arg({
                     ...defvars,
                     ...vars,
                     ...diffVars
                });
            }

            return result;
        },
        'time': () => 1 * new Date()
    };

    for (const name of Object.getOwnPropertyNames(functions)) {
        functions[name].__type__ = 'func';
    }

    return {
        run: source => {
            try {
                const variables = {
                    ...parser_info,
                    ...initial,
                    ...defvars
                };

                return eval(parser.parse(source.trim())[0], variables, functions);
            } catch (e) {
                console.log('-----------------------------------')
                console.log('Error when parsing file: ', source);
                console.log(e);
            }
        }
    }
}

exports.interpreter = interpreter;