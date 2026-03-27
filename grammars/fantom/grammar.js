/// <reference types="tree-sitter-cli/dsl" />
// Tree-sitter grammar for the Fantom programming language
// Reference: https://fantom.org/doc/docLang/Grammar

const PREC = {
  ASSIGN: 1,
  TERNARY: 2,
  OR: 3,
  AND: 4,
  EQUALITY: 5,
  RELATIONAL: 6,
  RANGE: 7,
  ADDITIVE: 8,
  MULTIPLICATIVE: 9,
  UNARY: 10,
  POSTFIX: 11,
  PRIMARY: 12,
};

module.exports = grammar({
  name: 'fantom',

  extras: $ => [
    /\s+/,
    $.line_comment,
    $.block_comment,
    $.doc_comment,
  ],

  supertypes: $ => [
    $._expression,
    $._statement,
    $._declaration,
    $._type,
  ],

  externals: $ => [],

  conflicts: $ => [
    [$._simple_type, $._expression],
    [$._type, $.nullable_type],
    [$._type, $.list_type],
    [$.enum_value, $._simple_type],
    [$.type_literal, $.slot_literal],
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat(choice(
      $.using_statement,
      $.facet_annotation,
      $._declaration,
    )),

    // ── Using ──────────────────────────────────────────────────
    using_statement: $ => seq(
      'using',
      field('pod', $.identifier),
      optional(seq('::', field('type', $.identifier))),
      optional(seq('as', field('alias', $.identifier))),
    ),

    // ── Declarations ───────────────────────────────────────────
    _declaration: $ => choice(
      $.class_declaration,
      $.enum_declaration,
      $.mixin_declaration,
      $.facet_declaration,
    ),

    class_declaration: $ => seq(
      optional($.modifiers),
      'class',
      field('name', $.identifier),
      optional($.inheritance),
      field('body', $.class_body),
    ),

    inheritance: $ => seq(
      ':',
      $._type,
      repeat(seq(',', $._type)),
    ),

    class_body: $ => seq(
      '{',
      repeat($._class_member),
      '}',
    ),

    // ── Enum ───────────────────────────────────────────────────
    enum_declaration: $ => seq(
      optional($.modifiers),
      'enum',
      'class',
      field('name', $.identifier),
      optional($.inheritance),
      field('body', $.enum_body),
    ),

    enum_body: $ => seq(
      '{',
      // enum values come first
      optional(seq(
        $.enum_value,
        repeat(seq(',', $.enum_value)),
      )),
      // then regular class members
      repeat($._class_member),
      '}',
    ),

    enum_value: $ => seq(
      field('name', $.identifier),
      optional(field('arguments', $.argument_list)),
    ),

    // ── Mixin ─────────────────────────────────────────────────
    mixin_declaration: $ => seq(
      optional($.modifiers),
      'mixin',
      field('name', $.identifier),
      optional($.inheritance),
      field('body', $.class_body),
    ),

    // ── Facet ─────────────────────────────────────────────────
    facet_declaration: $ => seq(
      optional($.modifiers),
      'facet',
      'class',
      field('name', $.identifier),
      optional($.inheritance),
      field('body', $.class_body),
    ),

    _class_member: $ => choice(
      $.facet_annotation,
      $.field_declaration,
      $.method_declaration,
      $.constructor_declaration,
    ),

    field_declaration: $ => seq(
      optional($.modifiers),
      field('type', $._type),
      field('name', $.identifier),
      optional(seq(':=', field('value', $._expression))),
    ),

    method_declaration: $ => seq(
      optional($.modifiers),
      field('return_type', $._type),
      field('name', $.identifier),
      field('params', $.parameter_list),
      optional(field('body', $.block)),
    ),

    constructor_declaration: $ => seq(
      optional($.modifiers),
      'new',
      field('name', $.identifier),
      field('params', $.parameter_list),
      field('body', $.block),
    ),

    parameter_list: $ => seq(
      '(',
      optional(seq(
        $.parameter,
        repeat(seq(',', $.parameter)),
      )),
      ')',
    ),

    parameter: $ => seq(
      field('type', $._type),
      field('name', $.identifier),
      optional(seq(':=', field('default', $._expression))),
    ),

    modifiers: $ => repeat1(choice(
      'abstract',
      'const',
      'final',
      'native',
      'once',
      'override',
      'static',
      'virtual',
      'public',
      'protected',
      'internal',
      'private',
      'readonly',
    )),

    // ── Facet Annotations ──────────────────────────────────────
    facet_annotation: $ => seq(
      '@',
      field('name', $.identifier),
      optional(field('config', $.facet_config)),
    ),

    facet_config: $ => seq(
      '{',
      repeat(seq(
        field('key', $.identifier),
        '=',
        field('value', $._expression),
      )),
      '}',
    ),

    // ── Types ──────────────────────────────────────────────────
    _type: $ => choice(
      $._simple_type,
      $.nullable_type,
      $.list_type,
      $.map_type,
      $.function_type,
    ),

    _simple_type: $ => choice(
      $.identifier,
      $.qualified_type,
      'Void',
    ),

    qualified_type: $ => seq(
      field('pod', $.identifier),
      '::',
      field('name', $.identifier),
    ),

    nullable_type: $ => seq(
      $._simple_type,
      '?',
    ),

    list_type: $ => seq(
      $._simple_type,
      '[',
      ']',
    ),

    map_type: $ => seq(
      '[',
      $._simple_type,
      ':',
      $._simple_type,
      ']',
    ),

    // |Int, Int->Str|  |->Bool|  |Str|  |->|
    function_type: $ => prec.left(seq(
      '|',
      optional(seq(
        $._type,
        repeat(seq(',', $._type)),
      )),
      optional(seq('->', $._type)),
      '|',
    )),

    // ── Statements ─────────────────────────────────────────────
    _statement: $ => choice(
      $.return_statement,
      $.throw_statement,
      $.break_statement,
      $.continue_statement,
      $.if_statement,
      $.while_statement,
      $.for_statement,
      $.switch_statement,
      $.try_statement,
      $.local_declaration,
      $.expression_statement,
      $.block,
    ),

    block: $ => seq('{', repeat($._statement), '}'),

    return_statement: $ => prec.right(seq(
      'return',
      optional($._expression),
    )),

    throw_statement: $ => prec.right(seq(
      'throw',
      $._expression,
    )),

    break_statement: $ => 'break',

    continue_statement: $ => 'continue',

    if_statement: $ => prec.right(seq(
      'if',
      field('condition', $.parenthesized_expression),
      field('consequence', $._statement),
      optional(seq(
        'else',
        field('alternative', $._statement),
      )),
    )),

    while_statement: $ => seq(
      'while',
      field('condition', $.parenthesized_expression),
      field('body', $._statement),
    ),

    for_statement: $ => seq(
      'for',
      '(',
      field('init', optional(choice($.local_declaration, $._expression))),
      ';',
      field('condition', optional($._expression)),
      ';',
      field('update', optional($._expression)),
      ')',
      field('body', $._statement),
    ),

    switch_statement: $ => seq(
      'switch',
      field('value', $.parenthesized_expression),
      '{',
      repeat($.case_clause),
      optional($.default_clause),
      '}',
    ),

    case_clause: $ => seq(
      'case',
      field('value', $._expression),
      ':',
      repeat($._statement),
    ),

    default_clause: $ => seq(
      'default',
      ':',
      repeat($._statement),
    ),

    try_statement: $ => seq(
      'try',
      field('body', $.block),
      repeat($.catch_clause),
      optional($.finally_clause),
    ),

    catch_clause: $ => seq(
      'catch',
      optional(seq(
        '(',
        field('type', $._type),
        field('name', $.identifier),
        ')',
      )),
      field('body', $.block),
    ),

    finally_clause: $ => seq(
      'finally',
      field('body', $.block),
    ),

    local_declaration: $ => choice(
      seq(
        field('type', $._type),
        field('name', $.identifier),
        ':=',
        field('value', $._expression),
      ),
      seq(
        field('name', $.identifier),
        ':=',
        field('value', $._expression),
      ),
    ),

    expression_statement: $ => $._expression,

    // ── Expressions ────────────────────────────────────────────
    _expression: $ => choice(
      $.identifier,
      $._literal,
      $.this_expression,
      $.super_expression,
      $.it_expression,
      $.parenthesized_expression,
      $.member_access,
      $.safe_member_access,
      $.dynamic_invoke,
      $.safe_dynamic_invoke,
      $.call_expression,
      $.index_expression,
      $.unary_expression,
      $.binary_expression,
      $.ternary_expression,
      $.elvis_expression,
      $.type_check_expression,
      $.type_cast_expression,
      $.range_expression,
      $.assignment_expression,
      $.closure_expression,
      $.it_block,
    ),

    this_expression: $ => 'this',
    super_expression: $ => 'super',
    it_expression: $ => 'it',

    parenthesized_expression: $ => seq('(', $._expression, ')'),

    member_access: $ => prec(PREC.PRIMARY, seq(
      field('object', $._expression),
      '.',
      field('member', $.identifier),
    )),

    safe_member_access: $ => prec(PREC.PRIMARY, seq(
      field('object', $._expression),
      '?.',
      field('member', $.identifier),
    )),

    dynamic_invoke: $ => prec.left(PREC.PRIMARY, seq(
      field('object', $._expression),
      '->',
      field('member', $.identifier),
      optional(field('arguments', $.argument_list)),
    )),

    safe_dynamic_invoke: $ => prec.left(PREC.PRIMARY, seq(
      field('object', $._expression),
      '?->',
      field('member', $.identifier),
      optional(field('arguments', $.argument_list)),
    )),

    call_expression: $ => prec.left(PREC.PRIMARY, choice(
      seq(
        field('function', $._expression),
        field('arguments', $.argument_list),
        optional(field('trailing_closure', choice($.closure_expression, $.it_block))),
      ),
      seq(
        field('function', $._expression),
        field('trailing_closure', choice($.closure_expression, $.it_block)),
      ),
    )),

    index_expression: $ => prec(PREC.PRIMARY, seq(
      field('object', $._expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    argument_list: $ => seq(
      '(',
      optional(seq(
        $._expression,
        repeat(seq(',', $._expression)),
      )),
      ')',
    ),

    unary_expression: $ => choice(
      prec(PREC.UNARY, seq(choice('!', '-', '+'), $._expression)),
      prec(PREC.UNARY, seq(choice('++', '--'), $._expression)),
      prec(PREC.POSTFIX, seq($._expression, choice('++', '--'))),
    ),

    binary_expression: $ => choice(
      prec.left(PREC.MULTIPLICATIVE, seq($._expression, field('operator', choice('*', '/', '%')), $._expression)),
      prec.left(PREC.ADDITIVE, seq($._expression, field('operator', choice('+', '-')), $._expression)),
      prec.left(PREC.RELATIONAL, seq($._expression, field('operator', choice('<', '<=', '>', '>=', '<=>')), $._expression)),
      prec.left(PREC.EQUALITY, seq($._expression, field('operator', choice('==', '!=', '===', '!==')), $._expression)),
      prec.left(PREC.AND, seq($._expression, field('operator', '&&'), $._expression)),
      prec.left(PREC.OR, seq($._expression, field('operator', '||'), $._expression)),
    ),

    ternary_expression: $ => prec.right(PREC.TERNARY, seq(
      field('condition', $._expression),
      '?',
      field('consequence', $._expression),
      ':',
      field('alternative', $._expression),
    )),

    elvis_expression: $ => prec.right(PREC.TERNARY, seq(
      field('left', $._expression),
      '?:',
      field('right', $._expression),
    )),

    type_check_expression: $ => prec(PREC.RELATIONAL, seq(
      field('object', $._expression),
      field('operator', choice('is', 'isnot')),
      field('type', $._type),
    )),

    type_cast_expression: $ => prec(PREC.RELATIONAL, seq(
      field('object', $._expression),
      'as',
      field('type', $._type),
    )),

    range_expression: $ => prec.left(PREC.RANGE, seq(
      field('start', $._expression),
      field('operator', choice('..', '..<')),
      field('end', $._expression),
    )),

    assignment_expression: $ => prec.right(PREC.ASSIGN, seq(
      field('left', $._expression),
      field('operator', choice('=', '+=', '-=', '*=', '/=', '%=')),
      field('right', $._expression),
    )),

    // ── Closures ──────────────────────────────────────────────
    // |Int a, Int b->Int| { return a + b }
    closure_expression: $ => seq(
      field('params', $.closure_params),
      field('body', $.block),
    ),

    closure_params: $ => seq(
      '|',
      optional(seq(
        $.closure_param,
        repeat(seq(',', $.closure_param)),
      )),
      optional(seq('->', field('return_type', $._type))),
      '|',
    ),

    closure_param: $ => seq(
      field('type', $._type),
      field('name', $.identifier),
    ),

    // { echo(it) } — trailing block used as closure argument
    it_block: $ => prec(-1, $.block),

    // ── Literals ───────────────────────────────────────────────
    _literal: $ => choice(
      $.int_literal,
      $.float_literal,
      $.decimal_literal,
      $.duration_literal,
      $.string_literal,
      $.triple_string_literal,
      $.uri_literal,
      $.dsl_literal,
      $.bool_literal,
      $.null_literal,
      $.type_literal,
      $.slot_literal,
      $.list_literal,
      $.map_literal,
    ),

    int_literal: $ => token(choice(
      /[0-9][0-9_]*/,
      /0x[0-9a-fA-F][0-9a-fA-F_]*/,
      /0b[01][01_]*/,
      /'.'/,
      /'\\[bfnrt'`$\\]'/,
      /'\\u[0-9a-fA-F]{4}'/,
    )),

    float_literal: $ => token(seq(
      /[0-9][0-9_]*/,
      choice(
        seq('.', /[0-9][0-9_]*/, optional(seq(/[eE][+-]?/, /[0-9]+/)), /[fF]/),
        seq(/[eE][+-]?/, /[0-9]+/, /[fF]/),
        /[fF]/,
      ),
    )),

    decimal_literal: $ => token(seq(
      /[0-9][0-9_]*/,
      choice(
        seq('.', /[0-9][0-9_]*/, optional(seq(/[eE][+-]?/, /[0-9]+/)), /[dD]/),
        seq(/[eE][+-]?/, /[0-9]+/, /[dD]/),
        /[dD]/,
      ),
    )),

    string_literal: $ => seq(
      '"',
      repeat(choice(
        $.string_content,
        $.escape_sequence,
        $.interpolation,
      )),
      '"',
    ),

    triple_string_literal: $ => token(seq(
      '"""',
      repeat(choice(
        /[^"\\]/,
        seq('\\', /./),
        seq('"', /[^"]/),
        seq('""', /[^"]/),
      )),
      '"""',
    )),

    uri_literal: $ => seq(
      '`',
      repeat(choice(
        $.uri_content,
        $.escape_sequence,
        $.interpolation,
      )),
      '`',
    ),

    dsl_literal: $ => token(seq(
      '<|',
      repeat(choice(
        /[^|]/,
        seq('|', /[^>]/),
      )),
      '|>',
    )),

    string_content: $ => token(prec(-1, /[^"\\$]+/)),

    uri_content: $ => token(prec(-1, /[^`\\$]+/)),

    interpolation: $ => choice(
      seq('$', $.identifier),
      seq('${', $._expression, '}'),
    ),

    escape_sequence: $ => token(seq(
      '\\',
      choice(
        /[bfnrt"'`$\\]/,
        /u[0-9a-fA-F]{4}/,
      ),
    )),

    // 5sec, 3min, 100ms, 4ns, 2hr, 1day
    duration_literal: $ => token(seq(
      /[0-9][0-9_]*/,
      optional(seq('.', /[0-9][0-9_]*/)),
      choice('ns', 'ms', 'sec', 'min', 'hr', 'day'),
    )),

    // Str#  pod::Type#
    type_literal: $ => seq(
      $._simple_type,
      token.immediate('#'),
    ),

    // Int#plus  #echo
    slot_literal: $ => choice(
      seq($._simple_type, token.immediate('#'), $.identifier),
      seq('#', $.identifier),
    ),

    // [1, 2, 3]  Int[1, 2]  [,]
    list_literal: $ => choice(
      seq(
        optional($._simple_type),
        '[',
        $._expression,
        repeat(seq(',', $._expression)),
        ']',
      ),
      seq(
        optional($._simple_type),
        '[',
        ',',
        ']',
      ),
    ),

    // [1:"one", 2:"two"]  [:]  [Int:Str][:]
    map_literal: $ => choice(
      seq(
        optional(seq('[', $._simple_type, ':', $._simple_type, ']')),
        '[',
        $._expression, ':', $._expression,
        repeat(seq(',', $._expression, ':', $._expression)),
        ']',
      ),
      seq(
        optional(seq('[', $._simple_type, ':', $._simple_type, ']')),
        '[',
        ':',
        ']',
      ),
    ),

    bool_literal: $ => choice('true', 'false'),

    null_literal: $ => 'null',

    // ── Comments ───────────────────────────────────────────────
    line_comment: $ => token(seq('//', /[^\n]*/)),

    block_comment: $ => token(seq(
      '/*',
      /[^*]*\*+([^/*][^*]*\*+)*/,
      '/',
    )),

    doc_comment: $ => token(seq('**', /[^\n]*/)),

    // ── Identifiers ────────────────────────────────────────────
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
