// External scanner for Fantom Tree-sitter grammar
// Handles: DSL strings (<|...|>)

#include "tree_sitter/parser.h"
#include <string.h>

enum TokenType {
  DSL_START,
  DSL_END,
  DSL_CONTENT,
};

typedef struct {
  bool in_dsl;
} Scanner;

void *tree_sitter_fantom_external_scanner_create() {
  return calloc(1, sizeof(Scanner));
}

void tree_sitter_fantom_external_scanner_destroy(void *payload) {
  free(payload);
}

unsigned tree_sitter_fantom_external_scanner_serialize(void *payload, char *buffer) {
  Scanner *s = (Scanner *)payload;
  buffer[0] = s->in_dsl ? 1 : 0;
  return 1;
}

void tree_sitter_fantom_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
  Scanner *s = (Scanner *)payload;
  s->in_dsl = length > 0 && buffer[0] == 1;
}

bool tree_sitter_fantom_external_scanner_scan(
  void *payload,
  TSLexer *lexer,
  const bool *valid_symbols
) {
  Scanner *s = (Scanner *)payload;

  // Error recovery guard
  if (valid_symbols[DSL_START] && valid_symbols[DSL_END] && valid_symbols[DSL_CONTENT]) {
    if (!s->in_dsl) return false;
  }

  // Inside DSL
  if (s->in_dsl) {
    // Check for |> end
    if (valid_symbols[DSL_END] && lexer->lookahead == '|') {
      lexer->mark_end(lexer);
      lexer->advance(lexer, false);
      if (lexer->lookahead == '>') {
        lexer->advance(lexer, false);
        lexer->result_symbol = DSL_END;
        s->in_dsl = false;
        return true;
      }
      // Not |>, fall through to content
    }

    if (valid_symbols[DSL_CONTENT]) {
      bool has_content = false;
      while (lexer->lookahead != 0) {
        if (lexer->lookahead == '|') {
          lexer->mark_end(lexer);
          lexer->advance(lexer, false);
          if (lexer->lookahead == '>') {
            if (has_content) {
              lexer->result_symbol = DSL_CONTENT;
              return true;
            }
            return false;
          }
          has_content = true;
          continue;
        }
        lexer->advance(lexer, false);
        has_content = true;
      }
      if (has_content) {
        lexer->mark_end(lexer);
        lexer->result_symbol = DSL_CONTENT;
        return true;
      }
    }
    return false;
  }

  // DSL start: <|
  if (valid_symbols[DSL_START] && lexer->lookahead == '<') {
    lexer->mark_end(lexer);
    lexer->advance(lexer, false);
    if (lexer->lookahead == '|') {
      lexer->advance(lexer, false);
      lexer->result_symbol = DSL_START;
      s->in_dsl = true;
      return true;
    }
    return false;
  }

  return false;
}
