from app.api.dependencies.factories import AdminServiceDep
from app.api.dependencies.auth import AuthenticatedAdmin
from app.api.dependencies.language import require_lang
from fastapi import APIRouter, Depends
from app.schemas import session as session_schemas
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.middlewares.logger_context import StructlogRoute

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.get(
    "",
    response_model=session_schemas.SessionListResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
    ),
)
async def list_sessions(
    db_admin: AuthenticatedAdmin,
    admin_service: AdminServiceDep,
    page: int = 1,
    size: int = 20,
):
    return await admin_service.list_sessions(
        admin_id=db_admin.id,
        page=page,
        size=size,
    )

#########################################################################################################
#########################################################################################################
@router.post(
    "/logout",
    response_model=session_schemas.SessionsLogoutResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def logout_sessions(
    payload: session_schemas.SessionsLogoutRequest,
    db_admin: AuthenticatedAdmin,
    admin_service: AdminServiceDep,
):
    revoked = await admin_service.revoke_sessions(
        admin_id=db_admin.id,
        session_ids=payload.session_ids,
    )
    return session_schemas.SessionsLogoutResponse(revoked=revoked)
