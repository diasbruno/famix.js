/* global require */

var _ = require('lodash');
var fs = require('fs');
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

let files = [
  './test.js',
  './test2.js',
  './test3.js'
];
let famixes = resolve(files.map(
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
));


console.log(`(${_.reduce(
      famixes,
      (acc, b) => _.reduce(b, str, acc),
      ""
)})`);

/*
  console.log(mse.reduce(
  (acc, b) => acc.concat(
  b.filter(item => item.type == Inheritance).map(
  inh => mse.reduce(
  (acc, table) => {
  const found = table.find(item => inh.superClass.ref == item.id);
  found && acc.push(found);
  return acc;
  },
  []
  )
  )
  ),
  []
  ));
*/
