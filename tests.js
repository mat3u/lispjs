const interpreter = require('./lisp').interpreter;

const globals = {
    'version': '0.0.1',
    'author': 'Matt Stasch'
};

const instance = interpreter(globals);

instance.run('(+ 1 2)');
instance.run('(+ (- 8 2) (max 4 5 4 3 2 0 4))');
instance.run('(to-upper "aaaBBa")');
instance.run('(to-upper version)');
instance.run('(join " " (to-upper author) version)');
instance.run('(join "!" (split "." version))');

instance.run('(let pi 3.4135)');
instance.run('(print (cos pi))');

instance.run(`
(defun distance (x1 y1 x2 y2) 
  (sqrt 
    (+
      (* (- x2 x1)(- x2 x1))
      (* (- y2 y1)(- y2 y1))
    )
  )
)`);

instance.run('(distance 0 0 5 5)');
instance.run(`(defun version-and-author () (
    println (join " | " author version)
))`)
instance.run('(version-and-author)')