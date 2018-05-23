Program = SExpr*

// Expressions
SExpr =
  //  s v:Func e { return [{func: v}] }
  s s:SExpr e { return s; }
  / Comment { return { comment: true }; }
  / s e { return []; }
  / v:Value { return v; }
  / v:Func { return { var: text() }; }
  / s f:Func args:(_ SExpr)* e { return [{ func: f }, ...args.map(a => a[1]).filter(a => !(a || {}).comment)]; }


// Functions
Func = $[^"^\t^\n^\r^ ^(^)]+

// Value types
Value
  = s v:Value e { return v; }
  / v:(Nil / Number / Bool / String) { return v; }

Bool =
	"true"i { return true; }
  / "false"i { return false; }

Nil =
	"'()" { return null; }
  / "nil" { return null; }

Number
	= [+-]? ([0-9]* "." [0-9]+ / [0-9]+) ("e" [+-]? [0-9]+)? {
      	return parseFloat(text());
    }

String
  = '"' chars:DoubleChar* '"' { return chars.join(''); }
  / "'" chars:SingleChar* "'" { return chars.join(''); }

DoubleChar
  = !('"' / "\\") char:. { return char; }
  / "\\" sequence:Escape { return sequence; }

SingleChar
  = !("'" / "\\") char:. { return char; }
  / "\\" sequence:Escape { return sequence; }

Escape
  = "'"
  / '"'
  / "\\"
  / "b"  { return "\b";   }
  / "f"  { return "\f";   }
  / "n"  { return "\n";   }
  / "r"  { return "\r";   }
  / "t"  { return "\t";   }
  / "v"  { return "\x0B"; }

Comment = s Comment e / ";;" [^\n]* ([\n] / !.)

s = _ "(" _
e = _ ")" _

_ "whitespace" = $[ \t\n\r]*
__ "required_whitespace" = $[ \t\n\r]+