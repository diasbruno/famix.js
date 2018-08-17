import {
  FileAnchor, Namespace,
  Class, ClassRef,
  Function, FunctionRef,
  Variable, VariableRef
} from './famix.js';
import {
  SymbolTable,
  uniqueId, makeStash, render
} from './transform.js';


export const process = (pkg, filename, ast) => {
  const stash = makeStash();

  const nslocalId = uniqueId();
  stash.packages.push(pkg);
  stash.files.push({
    id: uniqueId(),
    type: FileAnchor,
    name: pkg.name
  });

  stash.namespaces.push({
    id: nslocalId,
    type: Namespace,
    name: filename,
    parentScope: { ref: pkg.id }
  });

  return ast.body.reduce((acc, b) => render(acc, b, {
    parentPackage: { ref: nslocalId },
    parentNS: { ref: pkg.id }
  }), stash);
};

// famixes :: [{ filename, famix }]
export const resolve = famixes => {
  famixes.map(
    ({ filename, famix }) => {
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

          const useFamix = resolveWithFamix.famix[SymbolTable];
          const found = useFamix.hasOwnProperty(head.name) ?
                useFamix[head.name] : null;

          if (!found) {
            acc.push(b);
            return acc;
          }

          switch (found.type) {
          case Function: {
            famix.functions.push({
              id: head.id,
              type: FunctionRef,
              name: head.name,
              aliasOf: { ref: found.id }
            });
          } break;
          case Class: {
            famix.classes.push({
              id: head.id,
              type: ClassRef,
              name: head.name,
              aliasOf: { ref: found.id }
            });
          } break;
          case Variable: {
            famix.variables.push({
              id: head.id,
              type: VariableRef,
              name: head.name,
              aliasOf: { ref: found.id }
            });
          } break;
          }
          famix.unresolved.shift();

          return acc;
        },
        [] // really unresolvable
      );

      famix.unresolved = remainUnresolvable;
    }
  );

  return famixes.map(
    f => Object.values(f.famix[SymbolTable]).concat(
      f.famix.inheritances
    )
  );
};
