/* global require */

const acorn = require('acorn');
['acorn-stage3/inject',
 'acorn-static-class-property-initializer/inject',
 'acorn-class-fields/inject',
 'acorn-jsx/inject'
].reduce((acc, b) => require(b)(acc), acorn);

export default s => acorn.parse(
  s,
  {
    ecmaVersion: 8,
    sourceType: "module",
    plugins: {
      staticClassPropertyInitializer: true,
      classFields: true,
      jsx: true,
      stage3: true
    }
  }
);
