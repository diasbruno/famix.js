class Entity {}
class SourceAnchor   extends Entity {}
class SourceLanguage extends Entity {}
class SourcedEntity  extends Entity {}

class Association    extends SourcedEntity {}
class Comment        extends SourcedEntity {}
class NamedEntity    extends SourcedEntity {}
class Namespace      extends SourcedEntity {}
class Package        extends SourcedEntity {}

class Access         extends Association {}
class Inheritance    extends Association {}
class Invocation     extends Association {}
class Reference      extends Association {}

class ContainerEntity extends NamedEntity {}
class LeafEntity      extends NamedEntity {}

class BehaviouralEntity extends ContainerEntity {}
class ScopingEntity     extends ContainerEntity {}
class Type              extends ContainerEntity {}

class AnnotationType extends Type {}
class Class          extends Type {}
class PrimitiveType  extends Type {}
class TypeAlias      extends Type {}

class StructuralEntity extends LeafEntity {}

class GlobalVariable   extends StructuralEntity {}
class ImplicitVariable extends StructuralEntity {}
class LocalVariable    extends StructuralEntity {}
class UnknownVariable  extends StructuralEntity {}
class Parameter        extends StructuralEntity {}

class Attribute extends StructuralEntity {}
class AnnotationTypeAttribute extends Attribute {}

class Function extends BehaviouralEntity {}
class Method   extends BehaviouralEntity {}

class FileAnchor extends SourceAnchor {}
