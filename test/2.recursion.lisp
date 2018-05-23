(!
    (import "stdlib")
    (import "test")
    
    (println " * Recursion")
    (!
        (print "\t* Recursive function with accumulator: ")
        ;; Given
        (defun rec (n acc)
            (!
                (if (eq 0 n)
                    (acc)
                    (rec (- n 1) (prepend acc n))
                )       
            )
        )
        ;; When + Then
        (println list)
        (assert (eq-list (list 1 2 3 4 5) (rec 5 (empty '()))))
    )
)