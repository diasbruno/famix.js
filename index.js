/* global require */

var _ = require('lodash');
var fs = require('fs');
var Tuple, { tuple } = require('./lib/tuple.js');
var { Inheritance, Class } = require('./lib/famix.js');
var { declarePackage, toFamix } = require('./lib/transform');
var { process, resolve } = require('./lib/index');
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

let famixes = [
  './test.js',
  './test2.js',
  // './test3.js'
].map(
  filename => tuple(
    filename,
    acorn.parse(
      fs.readFileSync(filename, 'utf8'),
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
    )
  ).map(
    ast => process(pkg, filename, ast)
  )
);

console.log(
  `(${_.reduce(
      resolve(famixes),
      (acc, b) => _.reduce(b, str, acc),
      ""
)})`);
