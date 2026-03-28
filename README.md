# Fantom Language Support for Zed

Syntax highlighting, bracket matching, auto-indentation, and symbol outline for the [Fantom](https://fantom.org/) programming language in [Zed](https://zed.dev/).

## Features

- Syntax highlighting for all Fantom constructs
- String interpolation (`$name`, `${expr}`)
- Triple-quoted strings, URI literals, DSL strings
- Closures, function types, it-blocks
- Enums, mixins, facets, and annotations
- Duration, type, slot, list, and map literals
- Bracket matching and auto-indentation
- Symbol outline for classes, methods, and fields

## Install

### From Zed Extensions (once published)

1. Open Zed
2. Open the Extensions panel (`Cmd+Shift+X`)
3. Search for "Fantom"
4. Click Install

### As a Dev Extension (for development/testing)

1. Clone this repository:
   ```
   git clone https://github.com/afrankvt/zed-fantom.git
   ```

2. In Zed, open the command palette (`Cmd+Shift+P`) and run:
   ```
   zed: install dev extension
   ```

3. Select the `zed-fantom` directory.

4. Open any `.fan` file — syntax highlighting should be active.

## Build Task

To add a global build task that finds and runs the nearest `build.fan`, add the following to your Zed tasks file (`~/.config/zed/tasks.json`):

```json
[
  {
    "label": "Fantom: Build",
    "command": "dir=\"$ZED_DIRNAME\"; while [ \"$dir\" != \"/\" ] && [ ! -f \"$dir/build.fan\" ]; do dir=$(dirname \"$dir\"); done; if [ -f \"$dir/build.fan\" ]; then cd \"$dir\" && fan build.fan; else echo 'No build.fan found'; exit 1; fi",
    "allow_concurrent_runs": false,
    "use_new_terminal": false
  }
]
```

To bind it to `Cmd+B`, add the following to your Zed keymap (`~/.config/zed/keymap.json`):

```json
[
  {
    "context": "Workspace",
    "bindings": {
      "cmd-b": ["task::Spawn", { "task_name": "Fantom: Build" }]
    }
  }
]
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (for tree-sitter-cli)

### Setup

```
npm install
```

### Generate Parser

```
npx tree-sitter generate
```

### Run Tests

```
npx tree-sitter test
```

### Test Parsing

```
npx tree-sitter parse path/to/file.fan
```

### Test Highlighting

```
npx tree-sitter highlight path/to/file.fan
```

## Project Structure

```
zed-fantom/
├── extension.toml              # Zed extension manifest
├── grammar.js                  # Tree-sitter grammar definition
├── src/
│   ├── parser.c                # Generated parser
│   └── scanner.c               # External scanner (DSL strings)
├── test/corpus/                # Grammar test cases
├── languages/fantom/
│   ├── config.toml             # Language config (.fan files, comments)
│   ├── highlights.scm          # Syntax highlighting queries
│   ├── brackets.scm            # Bracket matching
│   ├── indents.scm             # Auto-indent rules
│   └── outline.scm             # Symbol outline
└── examples/                   # Sample .fan files
```
