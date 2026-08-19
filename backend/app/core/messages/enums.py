import enum

from app.core.language.language import lang

#########################################################################################################
#########################################################################################################
class SuccessCode(enum.Enum):
    PASSWORD_RESET_LINK_SENT = {
        "ar": "تم إرسال رابط إعادة تعيين كلمة المرور.",
        "en": "A password reset link has been sent.",
        "fr": "Un lien de réinitialisation du mot de passe a été envoyé.",
    }
    EMAIL_CHANGE_LINK_SENT = {
        "ar": "تم إرسال رابط التأكيد إلى عنوان البريد الإلكتروني الجديد.",
        "en": "A confirmation link has been sent to the new email address.",
        "fr": "Un lien de confirmation a été envoyé à la nouvelle adresse e-mail.",
    }
    VERIFICATION_LINK_SENT = {
        "ar": "تم إرسال رابط التحقق.",
        "en": "A verification link has been sent.",
        "fr": "Un lien de vérification a été envoyé.",
    }
    ACCOUNT_DELETED = {
        "ar": "تم حذف حسابك.",
        "en": "Your account has been deleted.",
        "fr": "Votre compte a été supprimé.",
    }
    ADMIN_ACCOUNT_DELETED = {
        "ar": "تم حذف حساب المسؤول.",
        "en": "The admin account has been deleted.",
        "fr": "Le compte administrateur a été supprimé.",
    }
    USER_ACCOUNT_DELETED = {
        "ar": "تم حذف حساب المستخدم.",
        "en": "The user account has been deleted.",
        "fr": "Le compte utilisateur a été supprimé.",
    }
    POST_SAVED = {
        "ar": "تم حفظ المنشور.",
        "en": "The post has been saved.",
        "fr": "La publication a été enregistrée.",
    }
    POST_UNSAVED = {
        "ar": "تمت إزالة المنشور من محفوظاتك.",
        "en": "The post has been removed from your saved posts.",
        "fr": "La publication a été retirée de vos enregistrements.",
    }
    POST_DELETED = {
        "ar": "تم حذف المنشور.",
        "en": "The post has been deleted.",
        "fr": "La publication a été supprimée.",
    }

    #########################################################################################################
    #########################################################################################################
    @property
    def message(self) -> str:
        return self.value[lang.get()]

    #########################################################################################################
    #########################################################################################################
    @classmethod
    def __get_pydantic_json_schema__(
        cls,
        core_schema,
        handler,
    ):
        # Serialized as the member name (see MessageResponse.serialize_code), so the
        # schema must advertise the names, not the internal per-language message dict.
        return {
            "type": "string",
            "enum": [member.name for member in cls],
            "title": cls.__name__,
        }
