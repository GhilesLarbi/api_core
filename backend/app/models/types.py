from sqlalchemy.dialects import postgresql
import sqlalchemy.types as types
from pydantic import TypeAdapter


#########################################################################################################
#########################################################################################################
class PydanticType(types.TypeDecorator):
    impl = postgresql.JSONB(none_as_null=True)
    cache_ok = True
    comparator_factory = postgresql.JSONB.Comparator  # lets queries use column["key"].astext directly

    #########################################################################################################
    #########################################################################################################
    def __init__(self, pydantic_type=None, **kwargs):
        super().__init__(**kwargs)
        self.pydantic_type = pydantic_type

    #########################################################################################################
    #########################################################################################################
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, dict):
            return value
        return value.model_dump(mode="json")

    #########################################################################################################
    #########################################################################################################
    def process_result_value(self, value, dialect):
        if value is None or self.pydantic_type is None:
            return value
        if isinstance(self.pydantic_type, TypeAdapter):
            if isinstance(value, dict) and "type" not in value:
                value = {"type": "url", **value}
            return self.pydantic_type.validate_python(value)
        return self.pydantic_type.model_validate(value)


#########################################################################################################
#########################################################################################################
class CompactPydanticType(PydanticType):
    """PydanticType that leaves unset fields out of the stored JSONB instead of writing them as null.

    Use it when the column takes part in a UNIQUE index. Two values that mean the same thing must
    serialize to the exact same JSONB, and plain PydanticType breaks that the day an optional field
    is added to the model: rows written before carry one key set, rows written after carry another,
    so the index stops seeing them as the same value and lets duplicates through."""
    cache_ok = True

    #########################################################################################################
    #########################################################################################################
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, dict):
            return {key: item for key, item in value.items() if item is not None}
        return value.model_dump(mode="json", exclude_none=True)


#########################################################################################################
#########################################################################################################
class PydanticListType(types.TypeDecorator):
    """Stores a list of Pydantic model instances as a JSONB array."""
    impl = postgresql.JSONB(none_as_null=True)
    cache_ok = True

    #########################################################################################################
    #########################################################################################################
    def __init__(self, pydantic_type=None, **kwargs):
        super().__init__(**kwargs)
        self.pydantic_type = pydantic_type

    #########################################################################################################
    #########################################################################################################
    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return [
            item if isinstance(item, dict) else item.model_dump(mode="json")
            for item in value
        ]

    #########################################################################################################
    #########################################################################################################
    def process_result_value(self, value, dialect):
        if value is None:
            return []
        if self.pydantic_type is None:
            return value
        return [self.pydantic_type.model_validate(item) for item in value]
