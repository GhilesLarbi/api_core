from pydantic import BaseModel, ConfigDict, Field, field_validator, computed_field, field_serializer, AfterValidator
from typing import Annotated, Any, Generic, List, TypeVar

from app.core.messages.enums import SuccessCode
from app.core.language.enums import Lang
from app.core.language.language import lang

T = TypeVar("T")

PhoneNumber = Annotated[str, Field(pattern=r"^[0-9\s\-\+\(\)]{10,20}$", examples=["0555123456"])]
Name = Annotated[str, Field(min_length=2, max_length=255)]
ShortStr = Annotated[str, Field(min_length=1, max_length=255)]

#########################################################################################################
#########################################################################################################
def _validate_password(value: str) -> str:
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not any(char.islower() for char in value):
        raise ValueError("Password must contain a lowercase letter.")
    if not any(char.isupper() for char in value):
        raise ValueError("Password must contain an uppercase letter.")
    if not any(char.isdigit() for char in value):
        raise ValueError("Password must contain a digit.")
    if not any(not char.isalnum() for char in value):
        raise ValueError("Password must contain a special character.")
    return value


Password = Annotated[str, AfterValidator(_validate_password), Field(min_length=8, examples=["Str0ng!Pass"])]

#########################################################################################################
#########################################################################################################
class MultilingualBase(BaseModel):
    def resolve(self, language: Any) -> Any:
        code = language.value if hasattr(language, "value") else str(language)
        for candidate in (code, "fr", "en", "ar"):
            value = getattr(self, candidate, None)
            if value:
                return value
        return None

#########################################################################################################
#########################################################################################################
class LocalizedResponse(BaseModel):
    """A response whose multilingual columns come out as the reading language's string.

    A row stores every language in one column; a response shows one. Doing that per field meant the
    same five-line validator copied into every schema that had such a column, and it had to be
    remembered again for each new field, which is how a field ends up returning the raw object.

    Here it is one wildcard before-validator: anything arriving as a MultilingualBase resolves
    itself, everything else passes through untouched. Declare the field as `str` and inherit this.

    The dict branch is for a value that arrived as raw json rather than through the typed column. It
    only fires when every key is a language code, so an ordinary dict field is never touched."""

    #########################################################################################################
    #########################################################################################################
    @field_validator("*", mode="before")
    @classmethod
    def _resolve_multilingual(cls, value: Any) -> Any:
        if isinstance(value, MultilingualBase):
            return value.resolve(lang.get())
        if isinstance(value, dict) and value and set(value) <= {code.value for code in Lang}:
            for candidate in (lang.get().value, *(code.value for code in Lang)):
                if value.get(candidate):
                    return value[candidate]
            return None
        return value

#########################################################################################################
#########################################################################################################
class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    success: bool
    code: SuccessCode

    # Derived, never passed in: the wording always matches the code, in the language the
    # LanguageMiddleware put on the ContextVar. Callers only ever choose a SuccessCode.
    @computed_field
    @property
    def message(self) -> str:
        return self.code.message

    @field_serializer("code")
    def serialize_code(
        self,
        code: SuccessCode,
        _info,
    ):
        return code.name

    @classmethod
    def of(cls, code: SuccessCode) -> "MessageResponse":
        return cls(success=True, code=code)

#########################################################################################################
#########################################################################################################
class Paginated(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
