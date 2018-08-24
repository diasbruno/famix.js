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


export const uniqueId = (function() {
  var id = 0;
  return function() {
    id += 1;
    return id;
  };
}());

export const finder = stash => f =>
  stash.classes.find(f)   ||
  stash.functions.find(f) ||
  stash.variables.find(f) ||
  stash.unresolved.find(f);

export const SymbolTable = Symbol("symbols");

const isLocalSourceImport = name =>
  name[0] == '.' || name[0] == '/';

const ImportDeclaration = (acc, n, opts) => {
  var localid = uniqueId();
  const obj = {
    type: Namespace,
    id: localid,
    name: n.source.value,
    parentScope: { ref: opts.parentPackage.ref }
  };

  acc[SymbolTable].add(obj.name);

  const items = n.specifiers.map(item => {
    const obj = {
      id: uniqueId(),
      type: UnresolvedImportedSymbol,
      name: item.local.name,
      source: n.source.value,
      parentScope: opts.parentPackage
    };

    if (item.imported && item.imported.name != item.local.name) {
      obj.aliasOf = item.imported.name;
    }

    acc[SymbolTable].add(obj.name);

    return obj;
  });

  acc.unresolved = acc.unresolved.concat(items);

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
  var obj = {
    id: uniqueId(),
    name: n.id.name,
    type: Variable,
    ...opts
  };
  acc[SymbolTable].add(obj.name);
  acc.variables.push(obj);
  return acc;
};

const ExpressionStatement = (acc, n, opts) =>
  render(acc, n.expression, {});

const ClassDeclaration = (acc, n, opts) => {
  const localId = uniqueId();
  const name = (n.id || ({ name: "" })).name || "";
  var obj = {
    id: localId,
    type: Class,
    name: name,
    numberOfConstructorMethods: 0,
    numberOfPublicMethods: 0,
    numberOfAttributes: 0,
    container: null,
    numberOfPublicAttributes: 0,
    numberOfMethodsInherited: 0,
    numberOfMethodsOverriden: 0,
    numberOfMethodsAdded: 0,
    numberOfMethods: 0,
    numberOfAccessorMethods: 0,
    extends: n.superclass || null,
    ...{exported: false, ...opts}
  };

  acc[SymbolTable].add(obj.name);

  acc.classes.push(obj);
  if (n.superClass) {
    const has = acc[SymbolTable].has(n.superClass.name);

    const checkNames = item => n.superClass.name == item.name;

    if (has) {
      const found = finder(acc)(checkNames);

      acc.inheritances.push({
        type: Inheritance,
        subClass: { ref: localId },
        superClass: { ref: found.id }
      });
    }
  }

  acc = n.body.body.reduce(
    (acc, b) => render(acc, b, { ref: localId }),
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
  acc[SymbolTable].add(obj.name);
  acc.functions.push(obj);
  return acc;
};

const Literal = (acc, n, opts) => acc;

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

export const makeStash = () => ({
  [SymbolTable]: new Set(),
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
   (aliasOf (name ${i.aliasOf}))`: ""})`,
  [FileAnchor]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}'))`,
  [SourceAnchor]: i => `(${i.type} (id: ${i.id})
   (name '${i.source}'))`,
  [Package]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}'))`,
  [Namespace]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (parentScope (ref: ${i.parentScope.ref})))`,
  [Class]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (parentPackage (ref: ${i.parentPackage.ref})))`,
  [ClassRef]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (aliasOf (ref: ${i.aliasOf.ref}))
   (parentScope (ref: ${i.parentScope.ref})))`,
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
   (subClass (ref: ${i.subClass.ref}))
   (superClass (ref: ${i.superClass.ref})))`,
  [Function]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (signature '${i.name}(${i.signature})')
   (parentPackage (ref: ${i.parentPackage.ref})))`,
  [FunctionRef]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (aliasOf (ref: ${i.aliasOf.ref}))
   (parentScope (ref: ${i.parentScope.ref})))`,
  [Variable]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (isConstant ${i.isConstant}))`,
  [VariableRef]: i => `(${i.type} (id: ${i.id})
   (name '${i.name}')
   (aliasOf (ref: ${i.aliasOf.ref}))
   (parentScope (ref: ${i.parentScope.ref}))`
};

export const toFamix = node => toFamixTable[node.type](node);

export const render = (acc, node, opts) =>
  model[node.type](acc, node, opts);

export const declarePackage = packagename => ({
  id: uniqueId(),
  type: Package,
  name: packagename
});
