(!
    ;; m3.lisp - Standard Library
    ;; Matt Stasch <matt.stasch@gmail.com>

    (if (eq stdlib-loaded nil) (!
    (let stdlib-loaded "AAA")


    (defun measure (f) (!
        (let m-start (time '()))
        (let result (f '()))
        (println (- (time '()) m-start) " ms")
        result
    ))

    (import "logic")
    (import "lists")
    (import "term")

    (defun id (x) (x))
    (defun swp (f x y) (f y x))

    ;; Version
    (defun show-version () (println "m3.lisp " version " by " author))
    ) nil)
)