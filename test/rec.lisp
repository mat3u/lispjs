(!
    (defun printN (n) (
        (if (eq 0 n)
            (print (join "!" n n))
            (!
                (print n)
                (printN (dec n))
            )
        ))
    )
    (printN 1)
)