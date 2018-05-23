(!
    (import "stdlib")
    (show-version '())

    (defun factorial (N) (
        if (eq 0 N) 
        1 
        (* N (factorial (- N 1)))
    ))

    (println (factorial 20))
)
