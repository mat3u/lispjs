(!
    (import "stdlib")
    (import "test")
    
    (println " * Higher Order Functions")
    (!
        (print "\t* foldr: ")
        (assert (eq 15 (foldr + 0 (list 1 2 3 4 5))))
    )
    (!
        (print "\t* map: ")
        (defun double (x) (* 2 x))

        (assert (eq-list (list 2 4 6 8 10) (map double (list 1 2 3 4 5))))
    )
    (!
        (print "\t* Calling function more than once: ")
        ;; Given
        (let counter 0)
        (defun do-twice (fn) (! (fn nil) (fn nil)))
        (defun incc () (!
            (let counter (inc counter))
        ))

        ;; When
        (do-twice incc)

        ;; Then
        (assert (eq counter 2))
        (println counter)
    )
)