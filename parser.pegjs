Program =
	(BExpression / Comment)*

BExpression =
	v: (_ "(" Expression _ ")" / _ "(" BExpression ")" / _ _ Value / _ _ Variable / _ _ "(" ")") Comment? { return v[2] == "(" ? [] : v[2] }

Expression =
	_ v:(Value / Function) Comment? { return v; }

Function = 
	name: Name  args:BExpression* {
        return [{ func: name }, ...args];
    }

Value = Float / Integer / Bool / Nil / Atom / String

Nil = "nil" / "'()" { return null; }
Bool = "true" / "false" { return (text() === "true" ? true : false); }
Atom = "'" v:[^ ^\t^\n^\r^)]+ { return { atom: v.join('')}; }
Integer = "-"? [0-9]+ { return parseInt(text(), 10); }
Float = "-"? [0-9]+ [\.] [0-9]+ { return parseFloat(text()); }

String = '"' s:(StringChars*) '"' { return s.join(""); }
StringChars = StringEscape / [^"]
StringEscape = '\\\"' { return "\""; }

Variable = _ Name { return { var: text().trim() }}

Name = n: (_ ([a-zA-Z]+[a-zA-Z0-9\-]*) / "(" Name ")" / _ [+-/*%!]) { return Array.isArray(n[1]) ? n[1].map(f => f.join('')).join('') : n[1]; }

Comment = _ ';;' [^\n]*

_ "whitespace"
  = [ \t\n\r]*
