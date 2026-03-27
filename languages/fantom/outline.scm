(class_declaration
  name: (identifier) @name) @item

(enum_declaration
  "enum" @context
  name: (identifier) @name) @item

(mixin_declaration
  "mixin" @context
  name: (identifier) @name) @item

(facet_declaration
  "facet" @context
  name: (identifier) @name) @item

(method_declaration
  name: (identifier) @name) @item

(constructor_declaration
  "new" @context
  name: (identifier) @name) @item

(field_declaration
  name: (identifier) @name) @item
