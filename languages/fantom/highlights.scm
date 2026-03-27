; Fantom syntax highlighting for Zed

; ── Comments ──────────────────────────────────────────────────
(line_comment) @comment
(block_comment) @comment
(doc_comment) @comment.doc

; ── Keywords ──────────────────────────────────────────────────
[
  "using"
  "class"
  "return"
  "new"
  "enum"
  "mixin"
  "facet"
] @keyword

; ── Control flow ──────────────────────────────────────────────
[
  "if"
  "else"
  "while"
  "for"
  "switch"
  "case"
  "default"
  "try"
  "catch"
  "finally"
  "throw"
] @keyword

(break_statement) @keyword
(continue_statement) @keyword

; ── Modifiers ─────────────────────────────────────────────────
[
  "abstract"
  "const"
  "final"
  "native"
  "once"
  "override"
  "static"
  "virtual"
  "public"
  "protected"
  "internal"
  "private"
  "readonly"
] @keyword.modifier

; ── Keyword operators ─────────────────────────────────────────
[
  "is"
  "isnot"
  "as"
] @keyword

; ── Built-in constants ────────────────────────────────────────
(bool_literal) @constant.builtin
(null_literal) @constant.builtin

; ── Special identifiers ───────────────────────────────────────
(this_expression) @variable.builtin
(super_expression) @variable.builtin
(it_expression) @variable.builtin

; ── Types ─────────────────────────────────────────────────────
"Void" @type.builtin

(class_declaration
  name: (identifier) @type)

(enum_declaration
  name: (identifier) @type)

(mixin_declaration
  name: (identifier) @type)

(facet_declaration
  name: (identifier) @type)

(enum_value
  name: (identifier) @constant)

(facet_annotation
  "@" @attribute
  name: (identifier) @attribute)

(nullable_type
  (identifier) @type)

(list_type
  (identifier) @type)

(map_type
  (identifier) @type)

(inheritance
  (identifier) @type)

(parameter
  type: (identifier) @type)

(field_declaration
  type: (identifier) @type)

(method_declaration
  return_type: (identifier) @type)

(type_check_expression
  type: (identifier) @type)

(type_cast_expression
  type: (identifier) @type)

(catch_clause
  type: (identifier) @type)

; ── Functions/Methods ─────────────────────────────────────────
(method_declaration
  name: (identifier) @function.method)

(constructor_declaration
  name: (identifier) @function.method)

(call_expression
  function: (identifier) @function.call)

(call_expression
  function: (member_access
    member: (identifier) @function.call))

(call_expression
  function: (safe_member_access
    member: (identifier) @function.call))

; ── Dynamic invoke ────────────────────────────────────────────
(dynamic_invoke
  member: (identifier) @function.call)

(safe_dynamic_invoke
  member: (identifier) @function.call)

; ── Fields/Properties ─────────────────────────────────────────
(field_declaration
  name: (identifier) @property)

(member_access
  member: (identifier) @property)

(safe_member_access
  member: (identifier) @property)

; ── Parameters ────────────────────────────────────────────────
(parameter
  name: (identifier) @variable.parameter)

(closure_param
  type: (identifier) @type)

(closure_param
  name: (identifier) @variable.parameter)

; ── Function types ────────────────────────────────────────────
(function_type
  "|" @punctuation.bracket)

(function_type
  "->" @punctuation.delimiter)

(closure_params
  "|" @punctuation.bracket)

(closure_params
  "->" @punctuation.delimiter)

; ── Literals ──────────────────────────────────────────────────
(int_literal) @number
(float_literal) @number
(decimal_literal) @number
(duration_literal) @number

(string_literal) @string
(triple_string_literal) @string
(uri_literal) @string.special
(dsl_literal) @string.special

(escape_sequence) @string.escape

(type_literal
  (identifier) @type
  "#" @punctuation.special)

(type_literal
  (qualified_type
    pod: (identifier) @module
    name: (identifier) @type)
  "#" @punctuation.special)

(slot_literal
  (identifier) @type
  "#" @punctuation.special
  (identifier) @property)

(slot_literal
  "#" @punctuation.special
  (identifier) @property)

(qualified_type
  pod: (identifier) @module
  name: (identifier) @type)

(interpolation
  "$" @punctuation.special)
(interpolation
  "${" @punctuation.special
  "}" @punctuation.special)

; ── Operators ─────────────────────────────────────────────────
(binary_expression
  operator: _ @operator)

(assignment_expression
  operator: _ @operator)

(range_expression
  operator: _ @operator)

(unary_expression
  ["!" "-" "+" "++" "--"] @operator)

(ternary_expression
  "?" @operator
  ":" @operator)

(elvis_expression
  "?:" @operator)

; ── Punctuation ───────────────────────────────────────────────
["(" ")" "[" "]" "{" "}"] @punctuation.bracket
["," "." "::" ":=" ";" "->" "?->" "?."] @punctuation.delimiter

; ── Using statement parts ─────────────────────────────────────
(using_statement
  pod: (identifier) @module)
(using_statement
  type: (identifier) @type)
