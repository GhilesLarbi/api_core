import enum

from app.core.language.language import lang

#########################################################################################################
#########################################################################################################
class ErrorCode(enum.Enum):
    DEVELOPMENT_ISSUE = {
        "status_code": 500,
        "message": {
            "ar": "قيد التطوير",
            "en": "In development",
            "fr": "En cours de développement",
        },
    }
    UNKNOWN_ERROR = {
        "status_code": 500,
        "message": {
            "ar": "خطأ غير معروف",
            "en": "Unknown error",
            "fr": "Erreur inconnue",
        },
    }
    ITEM_NOT_FOUND = {
        "status_code": 404,
        "message": {
            "ar": "العنصر الذي تبحث عنه غير موجود",
            "en": "The item you are looking for was not found",
            "fr": "L'élément que vous recherchez est introuvable",
        },
    }
    ALREADY_EXISTS = {
        "status_code": 409,
        "message": {
            "ar": "العنصر الذي تحاول إنشاءه موجود بالفعل",
            "en": "The item you are trying to create already exists",
            "fr": "L'élément que vous essayez de créer existe déjà",
        },
    }
    UNAUTHORIZED_ACCESS = {
        "status_code": 401,
        "message": {
            "ar": "ليس لديك صلاحية الوصول إلى هذا العنصر",
            "en": "You don't have access to this item",
            "fr": "Vous n'avez pas accès à cet élément",
        },
    }
    INVALID_OR_EXPIRED_TOKEN = {
        "status_code": 401,
        "message": {
            "ar": "انتهت صلاحية جلستك أو أن الرمز غير صالح.",
            "en": "Your session has expired or the token is invalid.",
            "fr": "Votre session a expiré ou le jeton est invalide.",
        },
    }
    BAD_REQUEST = {
        "status_code": 400,
        "message": {
            "ar": "الطلب غير صالح أو غير صحيح",
            "en": "The request is invalid or malformed",
            "fr": "La requête est invalide ou mal formée",
        },
    }
    MAINTENANCE = {
        "status_code": 503,
        "message": {
            "ar": "الخدمة قيد الصيانة. يرجى المحاولة لاحقًا.",
            "en": "The service is under maintenance. Please try again later.",
            "fr": "Le service est en maintenance. Veuillez réessayer plus tard.",
        },
    }
    INVALID_PARAMETERS = {
        "status_code": 422,
        "message": {
            "ar": "معاملات الطلب غير صالحة",
            "en": "The request parameters are invalid",
            "fr": "Les paramètres de la requête sont invalides",
        },
    }
    COMPROMISED_PASSWORD = {
        "status_code": 400,
        "message": {
            "ar": "ظهرت كلمة المرور هذه في تسريب بيانات معروف. يرجى اختيار كلمة مرور أخرى.",
            "en": "This password has appeared in a known data breach. Please choose a different one.",
            "fr": "Ce mot de passe est apparu dans une fuite de données connue. Veuillez en choisir un autre.",
        },
    }
    UNSUPPORTED_FILE_TYPE = {
        "status_code": 415,
        "message": {
            "ar": "نوع الملف هذا غير مدعوم.",
            "en": "This file type is not supported.",
            "fr": "Ce type de fichier n'est pas pris en charge.",
        },
    }

    #########################################################################################################
    #########################################################################################################
    @property
    def status_code(self) -> int:
        return self.value["status_code"]

    #########################################################################################################
    #########################################################################################################
    @property
    def message(self) -> str:
        return self.value["message"][lang.get()]

    #########################################################################################################
    #########################################################################################################
    @classmethod
    def __get_pydantic_json_schema__(
        cls,
        core_schema,
        handler,
    ):
        # Serialized as the member name (see ErrorResponse.field_serializer), so the
        # schema must advertise the names, not the internal {status_code, message} values.
        return {
            "type": "string",
            "enum": [member.name for member in cls],
            "title": cls.__name__,
        }
