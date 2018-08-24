import {
  FileAnchor, Namespace,
  Class, ClassRef,
  Function, FunctionRef,
  Variable, VariableRef
} from './famix.js';
import {
  SymbolTable,
  uniqueId, finder, makeStash, render
} from './transform.js';

// readFile :: Filename -> IO (Filename, String)
// process :: String -> IO Ast
// generate :: Ast -> Famix
// resolve :: [Famix] -> [Famix]

export const process = (pkg, filename, ast) => {
  const stash = makeStash();
  const nslocalId = uniqueId();

  return ast.body.reduce((acc, b) => render(acc, b, {
    parentPackage: { ref: nslocalId },
    parentNS: { ref: pkg.id }
  }), stash);
};

// famixes :: [(filename, famix)] -> famix
export const resolve = famixes => {
  famixes.map(
    ({ a, b }) => {
      let famix = b;
      let remainUnresolvable = famix.unresolved.reduce(
        (acc, b) => {
          const head = b;
          const resolveWithFamix = famixes.find(
            f => f.filename == head.source
          );

          // this case can be considered an absurd,
          // the only way to reach here
          // is to miss a file to parse.
          if (!resolveWithFamix) {
            acc.push(b);
            return acc;
          }

          const useFamix = resolveWithFamix.famix;
          const has = useFamix[SymbolTable].has(head.name);

          if (!has) {
            acc.push(b);
            return acc;
          }

          const checkNames = item => head.name == item.name;

          const found = finder(useFamix)(checkNames);

          switch (found.type) {
          case Function: {
            famix.functions.push({
              id: head.id,
              type: FunctionRef,
              name: head.name,
              aliasOf: { ref: found.id },
              parentScope: head.parentScope
            });
          } break;
          case Class: {
            famix.classes.push({
              id: head.id,
              type: ClassRef,
              name: head.name,
              aliasOf: { ref: found.id },
              parentScope: head.parentScope
            });
          } break;
          case Variable: {
            famix.variables.push({
              id: head.id,
              type: VariableRef,
              name: head.name,
              aliasOf: { ref: found.id },
              parentScope: head.parentScope
            });
          } break;
          }

          return acc;
        },
        [] // really unresolvable
      );

      famix.unresolved = remainUnresolvable;
    }
  );

  const items = [
    'unresolved',
    'files',
    'sources',
    'namespaces',
    'packages',
    'classes',
    'inheritances',
    'attributes',
    'methods',
    'variables',
    'functions'
  ];

  return famixes.map(
    f => items.reduce(
      (acc, b) => acc.concat(f.b[b]),
      []
    )
  );
};
