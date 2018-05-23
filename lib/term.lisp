(!
;; Terminal Controls
(let COLOR_BLACK "[30m")
(let COLOR_RED "[31m")
(let COLOR_GREEN "[32m")
(let COLOR_YELLOW "[33m")
(let COLOR_BLUE "[34m")
(let COLOR_MAGENTA "[35m")
(let COLOR_CYAN "[36m")
(let COLOR_WHITE "[37m")
(let COLOR_DEFAULT "[39m")
(let LF "\n")
(let CR "\r")

(defun set-color (color) (print (raw 27) color))
)