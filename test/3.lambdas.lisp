(!
    (import "stdlib")
    (import "test")

    (println " * Lambda calculi")
    (!
        (print "\t* Simple lambda invocation: ")
        (defun execute (l) (+ (l 1) (l 2)))

        (assert (eq 15 (execute (lambda (x) (* 5 x)))))
    )
    (!
        (print "\t* Passing lambda as argument (depth = 2): ")
        (defun do1 (f) (! (print ".") (f) (print "."))) 
        (defun do2 (g) (do1 g))

        (assert (eq 4 (do2 (lambda () (4)))))
    )
    (!
        (print "\t* Fold + lambda: ")
        (defun prepend' (s e) (prepend e s))
        (println
            (foldr 
                (lambda (s e) (! (println e s)))
                (empty nil)
                (list 1 2 3 4 5))
        )
    )
)