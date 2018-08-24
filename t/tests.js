/* global describe, it, context, xit */
import 'should';
import parser from './parser';
import * as Famix from '../src/famix';
import { process } from '../src/';
import { declarePackage, toFamix } from '../src/transform';


[
  './transforms.js'
].map(f => {
  var { label, suite } = require(f);
  describe(label, suite);
});
