# Famix-Core

Famix core is the general meta-model independent of any programming language.
It should not contain language-specific features such as class extensions (Smalltalk),
partial classes (C#), etc. Its root entity is Famix.Entity.

## FAMIX.Entity extends Moose.Entity

FAMIXEntity is the abstract root class of the FAMIX meta-model entities.
Fields.

```
/annotationInstances: AnnotationInstance* → annotatedEntity
```

## FAMIX.AnnotationInstance extends FAMIX.Entity

AnnotationInstance is an instance of an AnnotationType. It links an AnnotationType
to an actual entity.

For example, the following is an annotation instance in Smalltalk. $<$primitive:
’primAnyBitFromTo’ module:’LargeIntegers’>.
And the following is an AnnotationInstance in Java: @Test(timeout = 500)
Fields.

```
annotationType: AnnotationType → instances
annotatedEntity: Entity → annotationInstances
/attributes: AnnotationInstanceAttribute* → parentAnnotationInstance
```

## FAMIX.AnnotationInstanceAttribute extends FAMIX.Entity

This models the actual value of an attribute in an AnnotationInstance.
In the following AnnotationInstance of Java, timeout is an annotation instance
attribute : @Test(timeout = 500)

```
parentAnnotationInstance: AnnotationInstance → attributes
annotationTypeAttribute: AnnotationTypeAttribute → annotationAttributeInstances
value: String
```

## FAMIX.SourceAnchor extends FAMIX.Entity

FAMIXSourceAnchor is an abstract class representing a pointer to a source.

The source can be identified in multiple ways as specified by the subclasses.
The famix entity that this class is a source pointer for, is accessible
via element property


```
element: SourcedEntity → sourceAnchor
```


## FAMIX.SourceLanguage extends FAMIX.Entity

FAMIXSourceLanguage represents the programming language in which
an entity is written. It is used for dispatching entity actions for specific
languages. For example, formatting a source text will be performed according
to the language. A project may have multiple languages.

A source language has a name and entities that are written in this language.
One can create a default source language for a project by not associating
any entities to it. In this case, all entities that do not have specific source
langauge, belong to the default source language. One can attach entities to
a sourceLanguage using addSourceEntity:.

```
/name: String
/sourcedEntities: SourcedEntity* → declaredSourceLanguage
```

## FAMIX.SourcedEntity extends FAMIX.Entity

FAMIXSourcedEntity models any fact in a program source and it is the
superclass (root class) of all source code entities and their relationships. It
is a FAMIXEntity and it can hold comments, a source anchor and a source
language.

```
sourceAnchor: SourceAnchor → element
declaredSourceLanguage: SourceLanguage → sourcedEntities
/comments: Comment* → container
```

## FAMIX.CustomSourceLanguage extends FAMIX.SourceLanguage

FAMIXCustomSourceLanguage represents any source language that is not
supported by default in moose. So, the CustomSourceLanguage is simply
a possibility to specify some language from an outside parser without for
which there are no specific tools defined. Actually, it just represents the
name of the language with a string.

```
name: String
```


## FAMIX.UnknownSourceLanguage extends FAMIX.SourceLanguage

FAMIXUnknownSourceLanguage represents source language that has not
been specified by the user.

The difference with CustomSourceLanguage is that people can export from
outside a CustomSourceLanguage with a string representing the language,
while the UnknownSourceLanguage is provided by default (null object
pattern).

## FAMIX.Association extends FAMIX.SourcedEntity

FAMIXAssociation is an abstract superclass for relationships between Famix
named entities. It defines a polymorphic API refined by subclasses: essentially
from, to, next and previous.

From and To properties are abstract at this level, but specific implementations
can have multiple ends and properties. For example, FAMIXInheritance
has: (i) From mapped to the subclass; (ii) To mapped to the
superclass.

Next and Previous properties provide an order of the appearence of these
associations in code. The order is calculated within a particular relationship
for example, method invocation order within a calling method (from).
For example in java, the following code method a() b(); c(); will produce
two invocation associations first from method a to method b, and second
from method a to method c. These associations are bound together and
can be navigated with previous and next.

```
previous: Association → next
/from: NamedEntity
/to: NamedEntity
/next: Association → previous
```

## FAMIX.Comment extends FAMIX.SourcedEntity

FAMIXComment represents one instance of a comment (in the sense of
programming language comments) for any Famix sourced entity. The
commented sourced entity is called the container in the FAMIX model.

```
content: String
container: SourcedEntity → comments
```


## FAMIX.NamedEntity extends FAMIX.SourcedEntity

FAMIXNamedEntity is an abstract class, root of the hierarchy modeling
source code entities. FAMIXNamedEntity has a name and it is physically
present in source code. For example, methods, variables, types, namespaces.
The name of the entity only contains the basic name and not the
"fully qualified name". Apart from the name, it also has modifiers (e.g.
public, protected, final, etc.) and it can be marked as a stub. A stub is a
FAMIXNamedEntity that is used in the source code but its source is not
available.

When applicable, a FAMIXNamedEntity also points to its containing package
accessible via parentPackage.

Any of its subclasses must define the meaning of the belongsTo property,
an abstract property that provides polymorphic traversal. For example,
FAMIXClass defines belongsTo as being the container, while the
FAMIXMethod defines belongsTo to point to the parentType. belongsTo
can be used to calculate the "full qualified name" of a named entity. belongsTo
is a derived property, which means that it is always computed
from the information of other properties.
It can also return the list of invocations performed on this entity (considered
as the receiver) (receivingInvocations).

```
/isPublic: Boolean
/receivingInvocations: Invocation* → receiver
/isPrivate: Boolean
/isPackage: Boolean
/belongsTo: ContainerEntity
/isFinal: Boolean
/isProtected: Boolean
/nameLength: Number
name: String
/isAbstract: Boolean
modifiers: String*
parentPackage: Package → childNamedEntities
isStub: Boolean
```

## FAMIX.Access extends FAMIX.Association

FAMIXAccess represents an access to a variable by a behavioural entity
(for example, a function or a method).

For example if the method foo accesses the instance variable x, there is an
access with the following information: (i) From: aFAMIXMethod (foo)
(ii) To: aFAMIXAttribute (x)
aFAMIXMethod (foo) can be accessed using the message accessor (and
from) aFAMIXAttribute (x) can be accessed using the message variable
(and to).

Furthermore it can be tagged as read or write using isWrite: aBoolean.
For each access in the source code, there is one famix access created even
if it is from the same behavioral entity towards the same variable.

```
accessor: BehaviouralEntity → accesses
variable: StructuralEntity → incomingAccesses
/isRead: Boolean
isWrite: Boolean
```

## FAMIX.Inheritance extends FAMIX.Association

FAMIXInheritance represents an inheritance relationship between one subtype
(e.g. a subclass) and one supertype (e.g. a superclass).

To represent multiple inheritance, multiple instances of FAMIXInheritance
should be created. FAMIXInheritance puts in relation two types,
this way inheritance, for example, between classes and between interfaces
can be modelled.

```
subclass: Type → superInheritances
superclass: Type → subInheritances
```

## FAMIX.Invocation extends FAMIX.Association

FAMIXInvocation represents the invocation of a message (signature) on
a receiver by a behavioural entity. FAMIXInvocation has: (i) sender: the
behavioral entity that sends the message; (ii) receiver: the structural entity
(variable) that receives the message; (iii) candidates: the list of potential
behavioral entities that are actually being invoked. This is particularly
useful for dynamic languages.

In an invocation, From is the sender of the message and To is the list of
candidates. For each invocation in the source code, there is one famix invocation
created even if it is from the same behavioral entity towards the
same variable and the same message. For example in smalltalk, the following
code anObject aSelector. will produce one invocation association from
current method to a variable anObject with candidate aSelector. The list
of candidates will also contain all the methods defining a similar signature
as aSelector.

```
candidates: BehaviouralEntity* → incomingInvocations
sender: BehaviouralEntity → outgoingInvocations
receiver: NamedEntity → receivingInvocations
signature: String
receiverSourceCode: String
```

## FAMIX.Reference extends FAMIX.Association

A FAMIXReference entity is created whenever one manipulates a class
name as a variable. For example: (i) if the class is passed as a parameter
to a method, or (ii) if a static method is invoked on a class.

For example, in the following Java code method a() B bObject = new B();
B.aStaticMethod(); There is only one reference which is created when
the static method aStaticMethod is invoked on class variable B. In the
declaration of B objects, the class B is the type of variable b but not a
FAMIXReference. And instantiation new B() is an invocation of the default
constructor, and not a FAMIXReference.

Note that FAMIXReference are defined between two FAMIXContainerEntity
entities. So, it can also be used to represent dependencies between
container entities that are computed from the dependencies of contained
entities. For example, references between two packages can be computed
from dependencies between classes of the packages.

```
target: ContainerEntity → incomingReferences
source: ContainerEntity → outgoingReferences
```

## FAMIX.ContainerEntity extends FAMIX.NamedEntity

FAMIXContainerEntity is the abstract superclass for source code entities
containing other entities. Types, methods, and packages are examples of
FAMIXContainerEntity.

```
/incomingReferences: Reference* → target
(Java)/definedAnnotationTypes: AnnotationType* → container
/types: Type* → container
/outgoingReferences: Reference* → source
```


# FAMIX.LeafEntity extends FAMIX.NamedEntity

FAMIXLeafEntity is the abstract superclass for source code entities that
do not have children in Abstract syntax tree. For example, it represents
variables of programming languages.

## FAMIX.BehaviouralEntity extends FAMIX.ContainerEntity

FAMIXBehaviouralEntity is an abstract superclass for any kind of behavior.
For example, functions and methods. It has a name because
it is a named entity but it also has a signature in the format: methodName(paramType1,
paramType2). The signature property is necessary for
a behavioral entity. An external parser should provide a few metrics that
cannot be derived from the model such as cyclomatic complexity, numberOfStatements
and numberOfConditionals. Other metrics can be computed
from the model if enough information is provided such as numberOfLinesOfCode
(from source anchor) and numberOfComments (from
FAMIXComment).

It provides properties to manage: (i) parameters (ii) local variables (iii)
accesses to variables, and (iv) invocations to and from other behavioural
entities.

Optionally, it can also specify a declaredType (e.g. return types for functions).
This is useful for modeling behaviours from statically typed languages.

```
/numberOfMessageSends: Number
numberOfStatements: Number
/numberOfAccesses: Number
/incomingInvocations: Invocation* → candidates
/localVariables: LocalVariable* → parentBehaviouralEntity
/accesses: Access* → accessor
cyclomaticComplexity: Number
numberOfLinesOfCode: Number
numberOfComments: Number
/outgoingInvocations: Invocation* → sender
numberOfConditionals: Number
/numberOfOutgoingInvocations: Number
numberOfParameters: Number
declaredType: Type → behavioursWithDeclaredType
signature: String
/parameters: Parameter* → parentBehaviouralEntity
```


## FAMIX.ScopingEntity extends FAMIX.ContainerEntity

FAMIXScopingEntity represents an entity defining a scope at a global
level.

Packages and Namespaces are two different concept in terms of scoping
entity. Namespaces have semantic meaning in the language so they influence
the unique name of the entity, while Packages are physical entities
for packaging. In Smalltalk the two are explicitly different. In C++ we
have explicit Namespaces, but not so explicit Packages. In Java, we have
both Namespace (what you define in your Java source), and Package (the
folder structure), but they happen to overlap in naming (although one is
with . and the other one is with /) so people tend to see them as packages
only.

```
/childScopes: ScopingEntity* → parentScope
/functions: Function* → parentScope
/globalVariables: GlobalVariable* → parentModule
parentScope: ScopingEntity → childScopes
```

## FAMIX.Type extends FAMIX.ContainerEntity

FAMIXType is a generic class representing a type. It has several specializations
for specific kinds of types, the typical one being FAMIXClass. A
type is defined in a container (instance of FAMIXContainer). The container
is typically a namespace (instance of FAMIXNamespace), but may
also be a class (in the case of nested classes), or a method (in the case of
anonymous classes).

A type can have multiple subtypes or supertypes. These are modelled by
means of FAMIXInheritance instances.

```
/numberOfConstructorMethods: Number
/numberOfAttributesInherited: Number
/numberOfMethodProtocols: Number
/numberOfStatements: Number
/superInheritances: Inheritance* → subclass
/fanOut: Number
/methods: Method* → parentType
/weightOfAClass: Number
/totalNumberOfChildren: Number
/numberOfPublicMethods: Number
/typeAliases: TypeAlias* → aliasedType
/weightedMethodCount: Number
/hierarchyNestingLevel: Number
/numberOfComments: Number
/numberOfMethodsInHierarchy: Number
/numberOfAttributes: Number
container: ContainerEntity → types
/attributes: Attribute* → parentType
/numberOfRevealedAttributes: Number
/numberOfAnnotationInstances: Number
/subclassHierarchyDepth: Number
/numberOfPublicAttributes: Number
/behavioursWithDeclaredType: BehaviouralEntity* → declaredType
/numberOfAccessesToForeignData: Number
/fanIn: Number
/subInheritances: Inheritance* → superclass
/numberOfAbstractMethods: Number
/numberOfProtectedAttributes: Number
/numberOfMethodsInherited: Number
/numberOfMethodsOverriden: Number
/numberOfMethodsAdded: Number
/numberOfMethods: Number
/numberOfAccessorMethods: Number
/numberOfPrivateAttributes: Number
/numberOfProtectedMethods: Number
/numberOfMessageSends: Number
/structuresWithDeclaredType: StructuralEntity* → declaredType
/numberOfChildren: Number
/numberOfParents: Number
/numberOfPrivateMethods: Number
/tightClassCohesion: Number
/isAbstract: Boolean
/numberOfDuplicatedLinesOfCodeInternally: Number
/numberOfLinesOfCode: Number
/numberOfDirectSubclasses: Number
```

## FAMIX.StructuralEntity extends FAMIX.LeafEntity

FAMIXStructuralEntity is the abstract superclass for basic data structure
in the source code. A structural entity has a declaredType that points to
the type of the variable.

```
declaredType: Type → structuresWithDeclaredType
/incomingAccesses: Access* → variable
```

## FAMIX.Function extends FAMIX.BehaviouralEntity

FAMIXFunction represents a behavioural entity in a procedural language.

```
parentScope: ScopingEntity → functions
parentModule: Module
```

## FAMIX.Method extends FAMIX.BehaviouralEntity

FAMIXMethod represents a behaviour in an object-oriented language.

A FAMIXMethod is always contained in a parentType.

```
/isSetter: Boolean
(Java)/caughtExceptions: CaughtException* → definingMethod
/isConstructor: Boolean
(Java)/thrownExceptions: ThrownException* → definingMethod
/numberOfInvokedMethods: Number
hasClassScope: Boolean
/numberOfAnnotationInstances: Number
/isGetter: Boolean
/hierarchyNestingLevel: Number
timeStamp: String
/isConstant: Boolean
(Java)/declaredExceptions: DeclaredException* → definingMethod
parentType: Type → methods
kind: String
/isOverriden: Boolean
/isOverriding: Boolean
/isInternalImplementation: Boolean
```

## FAMIX.Namespace extends FAMIX.ScopingEntity

FAMIXNamespace represents a namespace from the source language. Namespaces
have semantic meaning in the language so they influence the unique
name of the entity.

A namespace denotes an entity that has meaning from a language point
of view. For example, in C++, there exist a concept with the same name
that has no other responsibility beside providing a lexical scope for the
contained classes and funcions.

When an entity is placed inside a namespace, the fully qualified name
(mooseName) is affected.

```
numberOfAttributes: Number
/numberOfClasses: Number
/instability: Number
/numberOfNonInterfacesClasses: Number
/numberOfMethods: Number
/distance: Number
/bunchCohesion: Number
/afferentCoupling: Number
/efferentCoupling: Number
/numberOfLinesOfCode: Number
/abstractness: Number
```


## FAMIX.Package extends FAMIX.ScopingEntity

FAMIXPackage represents a package in the source language, meaning that
it provides a means to group entities without any baring on lexical scoping.

Java extractors map Java packages to FAMIXNamespaces. They can also
mirror the same information in terms of FAMIXPackage instances.

```
/numberOfProviderPackages: Number
/weightedMethodCount: Number
/bunchCohesion: Number
/numberOfClasses: Number
/distance: Number
numberOfClientPackages: Number
/numberOfOutportClasses: Number
/instability: Number
numberOfMethods: Number
/afferentCoupling: Number
/childNamedEntities: NamedEntity* → parentPackage
/relativeImportanceForSystem: Number
/efferentCoupling: Number
/totalNumberOfLinesOfCode: Number
/numberOfHiddenClasses: Number
/abstractness: Number
```

## FAMIX.AnnotationType extends FAMIX.Type

FAMIXAnnotationType represents the type of an annotation. In some languages,
Java and C#, an annotation as an explicit type. An AnnotationType
can have a container in which it resides.

```
container: ContainerEntity → definedAnnotationTypes
/instances: AnnotationInstance* → annotationType
```


## FAMIX.Class extends FAMIX.Type

FAMIXClass represents an entity which can build new instances. A FAMIXClass
is a FAMIXType, therefore it is involved in super/sub types relationships
(depending on the language) and it holds attributes, methods.

FAMIX does not model explicitly interfaces, but a FAMIXClass can represent
a Java interface by setting the isInterface property.

A class is typically scoped in a namespace. To model nested or anonymous
classes, extractors can set the container of classes to classes or methods,
respectively.

```
/numberOfInternalDuplications: Number
isInterface: Boolean
/numberOfExternalDuplications: Number
```

## FAMIX.PrimitiveType extends FAMIX.Type

It represents a primitive type. For example, int or char are modeled using
PrimitiveType entities. Void is also considered a primitive type.

## FAMIX.TypeAlias extends FAMIX.Type

This entity models a typedef in C.

```
aliasedType: Type → typeAliases
```

## FAMIX.Attribute extends FAMIX.StructuralEntity

FAMIXAttribute represents a field of a class. It is an attribute of the parent
type.

```
/numberOfGlobalAccesses: Number
parentType: Type → attributes
/numberOfAccessingClasses: Number
hasClassScope: Boolean
/numberOfAccesses: Number
/hierarchyNestingLevel: Number
/numberOfAccessingMethods: Number
/numberOfLocalAccesses: Number
```

## FAMIX.GlobalVariable extends FAMIX.StructuralEntity

FAMIXGlobalVariable represents a global variable in the source code.

```
parentScope: ScopingEntity
parentModule: Module → globalVariables
```


## FAMIX.ImplicitVariable extends FAMIX.StructuralEntity

FAMIXImplicitVariable represents a variable defined by the compiler in a
context, such as self, super, thisContext.
Fields.

```
parentBehaviouralEntity: BehaviouralEntity
```

## FAMIX.LocalVariable extends FAMIX.StructuralEntity

FAMIXLocalVariable represents a local variable in the scope of a behavioural
entity.

```
parentBehaviouralEntity: BehaviouralEntity → localVariables
```

## FAMIX.Parameter extends FAMIX.StructuralEntity

FAMIXParameter represents one parameter in a method declaration.

```
parentBehaviouralEntity: BehaviouralEntity → parameters
```

## FAMIX.UnknownVariable extends FAMIX.StructuralEntity

FAMIXUnknownVariable represents some unknown entity encountered
while importing the project, possibly due to a syntax error in the source
code.

## FAMIX.AnnotationTypeAttribute extends FAMIX.Attribute

This models the attribute defined in a Java AnnotationType. In Java, annotation
type attributes have specific syntax and use.
For example, in Java the following AnnotationType has four AnnotationTypeAttributes
(id, synopsis, engineer and date are attributes).
public @interface MyAnno int id(); String synopsis(); String engineer()
default "[unassigned]"; String date() default "[unimplemented]";
When using an annotation, an annotation instance is created that points
back to the annotation type. The annotation instance has attributes that
are annontation instance attributes and point back to their annotation type
attributes.

```
/annotationAttributeInstances: AnnotationInstanceAttribute* → annotationTypeAttribute
/parentAnnotationType: AnnotationType
```


## FAMIX.FileAnchor extends FAMIX.SourceAnchor

This offers a source anchor that connects a sourced entity to a file through
a relative path stored in the fileName. In addition, the source can be further
specified with a startLine and an endLine number in the file.

```
endLine: Number
startLine: Number
startColumn: Number
fileName: String
endColumn: Number
```


## FAMIX.SourceTextAnchor extends FAMIX.SourceAnchor

This stores the source as an actual string variable. It is to be used when it
is not possible to link to the actual source.
