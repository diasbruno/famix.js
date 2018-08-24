/* global describe, it, context, xit */
import 'should';
import parser from './parser';
import * as Famix from '../src/famix';
import { process } from '../src/';
import { declarePackage, toFamix } from '../src/transform';

export default {
  label: "transforms",
  suite: () => {
    const filename = './test.js';
    const pkgName = 'test';
    const pkg = declarePackage(pkgName);

    const processDef = str =>
      process(pkg, filename, parser(str));

    it("declare a package.", () => {
      pkg.should.containEql({ type: Famix.Package, name: 'test' });
    });

    context("variables", () => {
      it("simple variable.", () => {
        const str = "var a = 1;";
        const { variables: [v] } = processDef(str);
        v.should.containEql({
          name: 'a',
          type: Famix.Variable,
          isConstant: false
        });
      });

      it("constant variable.", () => {
        const str = "const a = 1;";
        const { variables: [v] } = processDef(str);
        v.should.containEql({
          name: 'a',
          type: Famix.Variable,
          isConstant: true
        });
      });

      it("let variable.", () => {
        const str = "let a = 1;";
        const { variables: [v] } = processDef(str);
        v.should.containEql({
          name: 'a',
          type: Famix.Variable,
          isConstant: false
        });
      });
    });

    context("functions", () => {
      it("simple function.", () => {
        const str = "function a() {}";
        const { functions: [f] } = processDef(str);
        f.should.containEql({
          name: 'a',
          type: Famix.Function
        });
      });

      it("exported function.", () => {
        const str = "export function a() {}";
        const { functions: [f] } = processDef(str);
        f.should.containEql({
          name: 'a',
          type: Famix.Function,
          exported: true
        });
      });
    });

    context("classes", () => {
      it("class.", () => {
        const str = "class a {}";
        const { classes: [c] } = processDef(str);
        c.should.containEql({
          name: 'a',
          type: Famix.Class
        });
      });

      it("class method.", () => {
        const str = "class a { b() {} }";
        const { methods: [m] } = processDef(str);
        m.should.containEql({
          name: 'b',
          type: Famix.Method
        });
      });

      it("class getter method.", () => {
        const str = "class a { get b() {} }";
        const { methods: [m] } = processDef(str);
        m.should.containEql({
          name: 'b',
          type: Famix.Method,
          isGetter: true
        });
      });

      it("class setter method.", () => {
        const str = "class a { set b(a) {} }";
        const { methods: [m] } = processDef(str);
        m.should.containEql({
          name: 'b',
          type: Famix.Method,
          isSetter: true
        });
      });

      xit("class static method.", () => {
        const str = "class a { static b() {} }";
        const { methods: [m] } = processDef(str);
        m.should.containEql({
          name: 'b',
          type: Famix.Method,
          isStatic: true
        });
      });

      xit("extended class.", () => {
        const str = "class a extends b {}";
        const { classes: [c], inheritances } = processDef(str);
        c.should.containEql({
          name: 'a',
          type: Famix.Class
        });
        inheritances[0].should.containEql({
          type: Famix.Inheritance
        });
      });
    });

    context("imports", () => {
      it("import default specifier.", () => {
        const str = "import a from 'x'";
        const { unresolved } = processDef(str);
        unresolved[0].should.containEql({
          name: 'a',
          type: Famix.UnresolvedImportedSymbol
        });
      });

      it("import specifier.", () => {
        const str = "import { a } from 'x'";
        const { unresolved } = processDef(str);
        unresolved[0].should.containEql({
          name: 'a',
          type: Famix.UnresolvedImportedSymbol
        });
      });

      it("import namespace specifier.", () => {
        const str = "import * as a from 'x'";
        const { unresolved } = processDef(str);
        unresolved[0].should.containEql({
          name: 'a',
          type: Famix.UnresolvedImportedSymbol
        });
      });
    });
  }
};
