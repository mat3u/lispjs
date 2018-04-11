(!
    (defun printN (n) (
        (if (eq 0 n)
            (println n)
            (!
                (println n)
                (printN (dec n))
            )
        ))
    )
    (printN 5)
)