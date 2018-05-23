(!
    (import "stdlib")
    (import "test")
    
    (println " * Variables")
    (print "\t* Create variable: ")
    (!
        ;; Given / When
        (let a 3)
        
        ;; Then
        (assert (eq 3 a))
    )
    (print "\t* Mutate variable: ")
    (!
        ;; Given
        (let a 5)

        ;; When
        (let a 10)

        ;;Then
        (assert (eq 10 a))
    )
)