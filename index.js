/* global require */

var _ = require('lodash');
var fs = require('fs');
var { declarePackage, process, resolve, toFamix } = require('./lib/transform');
var acorn = require('acorn');
['acorn-stage3/inject',
 'acorn-static-class-property-initializer/inject',
 'acorn-class-fields/inject',
 'acorn-jsx/inject'
].reduce((acc, b) => require(b)(acc), acorn);

var filename = './test.js';

const pkg = declarePackage('test');

const str = (acc, b) =>
  `${acc}${acc.length ? " ": ""}${toFamix(b)}\n`;

console.log(`(${resolve(
  ['./test.js',
   './test2.js'
  ].map(
    // build the ast of each source
    filename => {
      var f = fs.readFileSync(filename, 'utf8');
      return {
        filename: filename,
        ast: acorn.parse(f, {
          ecmaVersion: 8,
          sourceType: "module",
          plugins: {
            staticClassPropertyInitializer: true,
            classFields: true,
            jsx: true,
            stage3: true
          }
        })
      };
    }
  ).map(
    ({ filename, ast }) => {
      return {
       filename: filename,
       famix: process(pkg, filename, ast)
      };
    }
  )
).map(
  // process each ast
  famix => {
    return _.reduce(
      famix,
      (acc, b) => _.reduce(b, str, acc),
      ""
    );
  }
).reduce(
  // reconciliate n-trees.
  (acc, p) => `${acc} ${p}`,
  ""
)})`);
