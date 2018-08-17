import {
  Entity,
  AnnotationInstance,
  AnnotationInstanceAttribute,
  SourceAnchor,
  SourceLanguage,
  SourcedEntity,
  CustomSourceLanguage,
  UnknownSourceLanguage,
  Association,
  Comment,
  NamedEntity,
  Access,
  Inheritance,
  Invocation,
  Reference,
  ContainerEntity,
  BehaviouralEntity,
  ScopingEntity,
  Type,
  StructuralEntity,
  Function,
  FunctionRef,
  Method,
  Namespace,
  Package,
  AnnotationType,
  Class,
  ClassRef,
  PrimitiveType,
  TypeAlias,
  Attribute,
  GlobalVariable,
  ImplicitVariable,
  LocalVariable,
  Variable,
  VariableRef,
  Parameter,
  UnknownVariable,
  AnnotationTypeAttribute,
  FileAnchor,
  SourceTextAnchor,
  // Javascript specific
  UnresolvedImportedSymbol
} from './famix.js';

var SymbolTable = Symbol("symbols");

var uniqueId = (function() {
  var id = 0;
  return function() {
    id += 1;
    return id;
  };
}());

const ImportDeclaration = (acc, n, opts) => {
  const items = n.specifiers.map(item => {
    var obj = {
      id: uniqueId(),
      type: UnresolvedImportedSymbol,
      name: item.local.name,
      source: n.source.value,
      parentScope: opts.parentPackage
    };
    if (item.imported && item.imported.name != item.local.name) {
      obj.aliasOf = item.imported.name;
    }
    acc[SymbolTable][obj.name] = obj;
    return obj;
  });
  acc.unresolved = acc.unresolved.concat(items);
  return acc;
};

const ImportDefaultSpecifier = (acc, n, opts) => {
  var localId = uniqueId();
  var obj = {
    id: localId,
    type: SourceAnchor,
    source: n.source.value
  };
  acc.sources.push(obj);
  return acc;
};

const ExportNamedDeclaration = (acc, n, opts) =>
  render(acc, n.declaration, { exported: true, ...opts });

const VariableDeclaration = (acc, n, opts) =>
  n.expression ? render(n.expression, opts) :
      n.declarations.reduce((acc, b) => render(acc, b, {
        isConstant: n.kind == 'const' || false
      }), acc);

const VariableDeclarator = (acc, n, opts) => {
  var localId = uniqueId();
  var obj = {
    id: localId,
    name: n.id.name,
    type: Variable,
    ...opts
  };
  acc[SymbolTable][obj.name] = obj;
  acc.variables.push(obj);
  return acc;
};

const ExpressionStatement = (acc, n, opts) =>
  render(acc, n.expression, {});

const ClassDeclaration = (acc, n, opts) => {
  var localId = uniqueId();
  var name = (n.id || ({ name: "" })).name || "";
  var obj = {
    id: localId,
    type: Class,
    name: name,
    numberOfConstructorMethods: 0,
    // methods: Method* → parentType
    // weightOfAClass: Number
    // totalNumberOfChildren: Number
    numberOfPublicMethods: 0,
    numberOfAttributes: 0,
    container: null, // ContainerEntity → types
    //attributes: Attribute* → parentType
    //numberOfRevealedAttributes: Number
    //numberOfAnnotationInstances: Number
    //subclassHierarchyDepth: Number
    numberOfPublicAttributes: 0,
    //behavioursWithDeclaredType: BehaviouralEntity* → declaredType
    //numberOfAccessesToForeignData: Number
    //numberOfProtectedAttributes: Number
    numberOfMethodsInherited: 0,
    numberOfMethodsOverriden: 0,
    numberOfMethodsAdded: 0,
    numberOfMethods: 0,
    numberOfAccessorMethods: 0, // get and set
    //numberOfLinesOfCode: Number
    //numberOfDirectSubclasses: Number
    extends: n.superclass || null,
    ...{exported: false, ...opts}
  };

  acc[SymbolTable][obj.name] = obj;

  acc.classes.push(obj);
  if (n.superClass) {
    const found = acc[SymbolTable][n.superClass.name];
    acc.inheritances.push({
      type: Inheritance,
      subClass: { ref: localId },
      superClass: { ref: found.id }
    });
  }

  acc = n.body.body.reduce(
    (acc, b) => render(acc, b, {
      ref: localId
    }),
    acc
  );

  return acc;
};

const FieldDefinition = (acc, n, opts) => {
  // Actually corresponds to `b = 1` on a class.
  var obj = {
    id: uniqueId(),
    type: Attribute,
    parentType: opts.ref,
    name: n.key.name,
    ...{exported: false, ...opts}
  };
  acc.attributes.push(obj);
  return acc;
};

const ClassProperty = (acc, n, opts) => {
  // Static properties of a class.
  var obj = {
    id: uniqueId(),
    type: Attribute,
    parentType: opts.ref,
    name: n.key.name,
    ...{exported: false, static: true, ...opts}
  };
  acc.attributes.push(obj);
  return acc;
};

const MethodDefinition = (acc, n, opts) => {
  var obj = {
    id: uniqueId(),
    type: Method,
    name: n.key.name,

    parentType: opts.ref,
    isConstructor: n.key.name == 'constructor',
    kind: n.kind,
    isSetter: n.kind == 'set',
    isGetter: n.kind == 'get',
    isOverriden: false,
    isOverriding: false,
    isInternalImplementation: false,
    isConstant: false,
    numberOfInvokedMethods: 0,
    hierarchyNestingLevel: 0
  };
  acc.methods.push(obj);
  return acc;
};

export const intercalate = (st, items) => {
  const all = [...items];
  const intercalateFn = (st, a, b) => {
    if (!b) { return a; }
    return `${a}${st}${b}`;
  };

  let res = "";
  while (all.length > 0) {
    const now = all.splice(0, 2);
    if (now.length > 1) {
      res += intercalateFn(st, now[0], now[1]);
    } else {
      res += intercalateFn(st, now[0], null);
    }
  }
  return res;
};

const FunctionDeclaration = (acc, n, opts) => {
  var obj = {
    id: uniqueId(),
    type: Function,
    name: n.id.name,
    signature: intercalate(", ", n.params.map(p => p.name)),
    ...{exported: false, ...opts}
  };
  acc[SymbolTable][obj.name] = obj;
  acc.functions.push(obj);
  return acc;
};

const Literal = (acc, n, opts) =>
  acc;

const model = {
  ImportDeclaration,
  ExportNamedDeclaration,
  VariableDeclaration,
  VariableDeclarator,
  ExpressionStatement,
  ClassDeclaration,
  FieldDefinition,
  ClassProperty,
  MethodDefinition,
  FunctionDeclaration,
  Literal
};

var makeStash = () => ({
  [SymbolTable]: {},
  unresolved: [],
  files: [],
  sources: [],
  namespaces: [],
  packages: [],
  classes: [],
  inheritances: [],
  attributes: [],
  methods: [],
  variables:[],
  functions: []
});

export const toFamixTable = {
  [UnresolvedImportedSymbol]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (parentScope (ref: ${i.parentScope.ref}))${i.aliasOf ? `
   (aliasOf (name ${i.aliasOf}))`: ")"}`,
  [FileAnchor]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}'))`,
  [SourceAnchor]: i => `(${i.type} (id: ${i.id})
   (name '${i.source}'))`,
  [Package]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}'))`,
  [Namespace]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (parentScope (ref: ${i.parentScope.ref}))`,
  [Class]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (parentPackage (ref: ${i.parentPackage.ref}))`,
  [ClassRef]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (aliasOf (ref: ${i.aliasOf.ref}))`,
  [Attribute]: i => `(${i.type}
   (name '${i.name}')
   (parentType (ref: ${i.parentType})))`,
  [Method]: i => `(${i.type}
   (name '${i.name}')
   (parentType (ref: ${i.parentType}))
   (kind ${i.kind})
   (isGetter ${i.isGetter})
   (isSetter ${i.isSetter}))`,
  [Inheritance]: i => `(${i.type}
   (subClass (ref: ${i.subClass.ref})
   (superClass (ref: ${i.superClass.ref}))`,
  [Function]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (signature '${i.name}(${i.signature})')
   (parentPackage (ref: ${i.parentPackage.ref}))`,
  [FunctionRef]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (aliasOf (ref: ${i.aliasOf.ref}))`,
  [Variable]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (isConstant ${i.isConstant}))`,
  [VariableRef]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (aliasOf (ref: ${i.aliasOf.ref}))`
};

export const toFamix = node => toFamixTable[node.type](node);

export const render = (acc, node, opts) => {
  return model[node.type](acc, node, opts);
};

export const declarePackage = packagename => {
  return {
    id: uniqueId(),
    type: Package,
    name: packagename
  };
};

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

  return famixes.map(f => f.famix);
};
