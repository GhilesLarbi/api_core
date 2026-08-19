from enum import StrEnum
from typing import Iterator, List, Optional, Type

from app.schemas.permission import PermissionLang

#########################################################################################################
#########################################################################################################
class Node:
    label: PermissionLang
    description: PermissionLang

    @classmethod
    def path(cls) -> str:
        return cls.__qualname__

    @classmethod
    def children(cls) -> List[Type["Node"]]:
        return [value for value in vars(cls).values() if isinstance(value, type) and issubclass(value, Node)]

    @classmethod
    def grantable(cls) -> bool:
        return not cls.children()


#########################################################################################################
#########################################################################################################
class admins(Node):
    label = PermissionLang(
        en="Admins",
        fr="Administrateurs",
        ar="المشرفون",
    )
    description = PermissionLang(
        en="Managing admin accounts and what they are allowed to do.",
        fr="Gestion des comptes administrateurs et de leurs autorisations.",
        ar="إدارة حسابات المشرفين وصلاحياتهم.",
    )

    #########################################################################################################
    #########################################################################################################
    class read(Node):
        label = PermissionLang(
            en="View admins",
            fr="Consulter les administrateurs",
            ar="عرض المشرفين",
        )
        description = PermissionLang(
            en="See the list of admin accounts and their details.",
            fr="Voir la liste des comptes administrateurs et leurs détails.",
            ar="الاطلاع على قائمة حسابات المشرفين وتفاصيلها.",
        )

    #########################################################################################################
    #########################################################################################################
    class create(Node):
        label = PermissionLang(
            en="Create admins",
            fr="Créer des administrateurs",
            ar="إنشاء المشرفين",
        )
        description = PermissionLang(
            en="Add a new admin account.",
            fr="Ajouter un nouveau compte administrateur.",
            ar="إضافة حساب مشرف جديد.",
        )

    #########################################################################################################
    #########################################################################################################
    class update(Node):
        label = PermissionLang(
            en="Update admins",
            fr="Modifier les administrateurs",
            ar="تعديل المشرفين",
        )
        description = PermissionLang(
            en="Change another admin's details.",
            fr="Modifier les informations d'un autre administrateur.",
            ar="تغيير بيانات مشرف آخر.",
        )

    #########################################################################################################
    #########################################################################################################
    class delete(Node):
        label = PermissionLang(
            en="Delete admins",
            fr="Supprimer des administrateurs",
            ar="حذف المشرفين",
        )
        description = PermissionLang(
            en="Remove an admin account.",
            fr="Supprimer un compte administrateur.",
            ar="إزالة حساب مشرف.",
        )

    #########################################################################################################
    #########################################################################################################
    class grant(Node):
        label = PermissionLang(
            en="Grant permissions",
            fr="Attribuer des permissions",
            ar="منح الصلاحيات",
        )
        description = PermissionLang(
            en="Give or take away another admin's permissions.",
            fr="Accorder ou retirer les permissions d'un autre administrateur.",
            ar="منح صلاحيات مشرف آخر أو سحبها.",
        )

    #########################################################################################################
    #########################################################################################################
    class reset_password(Node):
        label = PermissionLang(
            en="Reset passwords",
            fr="Réinitialiser les mots de passe",
            ar="إعادة تعيين كلمات المرور",
        )
        description = PermissionLang(
            en="Set another admin's password.",
            fr="Définir le mot de passe d'un autre administrateur.",
            ar="تعيين كلمة مرور مشرف آخر.",
        )



#########################################################################################################
#########################################################################################################
class users(Node):
    label = PermissionLang(
        en="Users",
        fr="Utilisateurs",
        ar="المستخدمون",
    )
    description = PermissionLang(
        en="Managing user accounts.",
        fr="Gestion des comptes utilisateurs.",
        ar="إدارة حسابات المستخدمين.",
    )

    #########################################################################################################
    #########################################################################################################
    class read(Node):
        label = PermissionLang(
            en="View users",
            fr="Consulter les utilisateurs",
            ar="عرض المستخدمين",
        )
        description = PermissionLang(
            en="See the list of user accounts and their details.",
            fr="Voir la liste des comptes utilisateurs et leurs détails.",
            ar="الاطلاع على قائمة حسابات المستخدمين وتفاصيلها.",
        )

    #########################################################################################################
    #########################################################################################################
    class create(Node):
        label = PermissionLang(
            en="Create users",
            fr="Créer des utilisateurs",
            ar="إنشاء المستخدمين",
        )
        description = PermissionLang(
            en="Add a new user account.",
            fr="Ajouter un nouveau compte utilisateur.",
            ar="إضافة حساب مستخدم جديد.",
        )

    #########################################################################################################
    #########################################################################################################
    class update(Node):
        label = PermissionLang(
            en="Update users",
            fr="Modifier les utilisateurs",
            ar="تعديل المستخدمين",
        )
        description = PermissionLang(
            en="Change a user's details.",
            fr="Modifier les informations d'un utilisateur.",
            ar="تغيير بيانات المستخدم.",
        )

    #########################################################################################################
    #########################################################################################################
    class delete(Node):
        label = PermissionLang(
            en="Delete users",
            fr="Supprimer des utilisateurs",
            ar="حذف المستخدمين",
        )
        description = PermissionLang(
            en="Remove a user account.",
            fr="Supprimer un compte utilisateur.",
            ar="إزالة حساب مستخدم.",
        )


#########################################################################################################
#########################################################################################################
class posts(Node):
    label = PermissionLang(
        en="Posts",
        fr="Publications",
        ar="المنشورات",
    )
    description = PermissionLang(
        en="Managing the posts users publish.",
        fr="Gestion des publications des utilisateurs.",
        ar="إدارة منشورات المستخدمين.",
    )

    #########################################################################################################
    #########################################################################################################
    class read(Node):
        label = PermissionLang(
            en="View posts",
            fr="Consulter les publications",
            ar="عرض المنشورات",
        )
        description = PermissionLang(
            en="See the list of posts and their details.",
            fr="Voir la liste des publications et leurs détails.",
            ar="الاطلاع على قائمة المنشورات وتفاصيلها.",
        )

    #########################################################################################################
    #########################################################################################################
    class update(Node):
        label = PermissionLang(
            en="Update posts",
            fr="Modifier les publications",
            ar="تعديل المنشورات",
        )
        description = PermissionLang(
            en="Edit a post or hide it.",
            fr="Modifier une publication ou la masquer.",
            ar="تعديل منشور أو إخفاؤه.",
        )

    #########################################################################################################
    #########################################################################################################
    class delete(Node):
        label = PermissionLang(
            en="Delete posts",
            fr="Supprimer les publications",
            ar="حذف المنشورات",
        )
        description = PermissionLang(
            en="Remove a post.",
            fr="Supprimer une publication.",
            ar="إزالة منشور.",
        )


#########################################################################################################
#########################################################################################################
class app_config(Node):
    label = PermissionLang(
        en="App configuration",
        fr="Configuration de l'application",
        ar="إعدادات التطبيق",
    )
    description = PermissionLang(
        en="Managing the application-wide configuration.",
        fr="Gestion de la configuration globale de l'application.",
        ar="إدارة الإعدادات العامة للتطبيق.",
    )

    #########################################################################################################
    #########################################################################################################
    class read(Node):
        label = PermissionLang(
            en="View app configuration",
            fr="Consulter la configuration",
            ar="عرض إعدادات التطبيق",
        )
        description = PermissionLang(
            en="See the application configuration.",
            fr="Voir la configuration de l'application.",
            ar="الاطلاع على إعدادات التطبيق.",
        )

    #########################################################################################################
    #########################################################################################################
    class update(Node):
        label = PermissionLang(
            en="Update app configuration",
            fr="Modifier la configuration",
            ar="تعديل إعدادات التطبيق",
        )
        description = PermissionLang(
            en="Change the application configuration.",
            fr="Modifier la configuration de l'application.",
            ar="تغيير إعدادات التطبيق.",
        )


#########################################################################################################
#########################################################################################################
def permission_roots() -> List[Type[Node]]:
    return [
        value
        for value in globals().values()
        if isinstance(value, type) and issubclass(value, Node) and value is not Node and "." not in value.__qualname__
    ]


#########################################################################################################
#########################################################################################################
def walk_permissions(nodes: Optional[List[Type[Node]]] = None) -> Iterator[Type[Node]]:
    for node in (permission_roots() if nodes is None else nodes):
        yield node
        yield from walk_permissions(nodes=node.children())


PermissionPath = StrEnum(
    "PermissionPath",
    {node.path().replace(".", "_").upper(): node.path() for node in walk_permissions() if node.grantable()},
)
