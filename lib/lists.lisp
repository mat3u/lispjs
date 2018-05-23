(!
(defun is-empty (l) (eq nil (head l)))

(defun foldr (f z A) (!
    (if (is-empty A)
        z
        (foldr f (f z (head A)) (tail A))
    )
))

(defun map (f A) (foldr
    (lambda (Z a) (append Z (f a)))
    (empty '())
    A
))

(defun iter (f A) (foldr
    (lambda (_ a) (! (f a) nil))
    nil
    A
));

(defun rev (A) (foldr (prepend) (empty '())  A))
)