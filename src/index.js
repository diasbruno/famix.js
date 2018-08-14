/* global require */

import _ from 'lodash';
import fs from 'fs';
import { process, toFamix } from './transform';
import acorn from 'acorn';
['acorn-stage3/inject',
 'acorn-static-class-property-initializer/inject',
 'acorn-class-fields/inject',
 'acorn-jsx/inject'
].reduce((acc, b) => require(b)(acc), acorn);

var f = fs.readFileSync('./test.js', 'utf8');
var p = acorn.parse(f, {
  ecmaVersion: 8,
  sourceType: "module",
  plugins: { staticClassPropertyInitializer: true,
             classFields: true,
             jsx: true,
             stage3: true
           }
});


console.log(
  `(${_.reduce(process(p), (acc, b) =>
 _.reduce(b, (acc, b) => `${acc}${toFamix[b.type](b)
}\n`, acc), "")})`
);
