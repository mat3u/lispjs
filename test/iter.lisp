(!
    (defun printN (n text) (
        (if (eq 0 n)
            (print n)
            (! 
                (print n)
                (printN (dec n) text)
            )
        ))
    )
    (printN 1 ".")
)