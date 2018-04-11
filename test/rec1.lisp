(! (defun r (x) (!
    (print x)
    (r (dec x))
))
(r 100)
)