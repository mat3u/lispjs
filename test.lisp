(!
    (import "stdlib")
    (show-version '())

    (defun factorial (N) (
        if (eq 0 N) 
        1 
        (* N (factorial (- N 1)))
    ))

    (let N (read-line '()))
    (println (measure (lambda () (factorial N))))
)