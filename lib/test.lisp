(!
(defun assert (cond) (if cond 
    (!
        (set-color COLOR_GREEN)
        (println "OK!")
        (set-color COLOR_DEFAULT)
    )
    (!
        (set-color COLOR_RED)
        (println "FAIL!")
        (set-color COLOR_DEFAULT)
    )
))
)