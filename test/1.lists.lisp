(!
    (import "stdlib")
    (import "test")
    
    (println " * Lists")
    (print "\t* Create list: ")
    (!
        ;; Given
        (let A (list 1 2 3 4))

        ;; Then
        (assert (eq 1 (head A)))
    )
    (print "\t* Prepend list with a value: ")
    (!
        ;; Given
        (let A (list 2 3 4 5))

        ;; When
        (let B (prepend A 1))

        ;; Then
        (assert (eq (head B) 1))
    )
    (print "\t* Reverse list: ")
    (!
        ;; Given
        (let A (list 1 2 3 4))

        ;; When
        (let B (rev A))

        ;;Then
        (assert (eq 4 (head B)))
    )
)