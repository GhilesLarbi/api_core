from app.api.dependencies.factories import AdminServiceDep
from app.api.dependencies.auth import AuthenticatedAdmin
from app.api.dependencies.language import require_lang
from fastapi import APIRouter, Depends, Request, Form
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas import admin as admin_schemas
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.middlewares.logger_context import StructlogRoute
from typing import Annotated

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.post(
    "/login",
    response_model=admin_schemas.AdminTokenResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def login_for_access_token(
    request: Request,
    admin_service: AdminServiceDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    return await admin_service.authenticate_admin(
        email=form_data.username,
        password=form_data.password,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

#########################################################################################################
#########################################################################################################
@router.post(
    "/refresh",
    response_model=admin_schemas.AdminTokenResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def refresh_access_token(
    request: Request,
    admin_service: AdminServiceDep,
    refresh_token: Annotated[str, Form()],
    grant_type: Annotated[str | None, Form()] = None,
):
    return await admin_service.refresh_access_token(
        refresh_token=refresh_token,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

#########################################################################################################
#########################################################################################################
@router.get(
    "/me",
    response_model=admin_schemas.AdminResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
    ),
)
async def read_current_admin(
    db_admin: AuthenticatedAdmin,
):
    return db_admin

#########################################################################################################
#########################################################################################################
@router.put(
    "",
    response_model=admin_schemas.AdminResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.ALREADY_EXISTS,
        ErrorCode.BAD_REQUEST,
        ErrorCode.COMPROMISED_PASSWORD,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def update_admin(
    admin_update: admin_schemas.AdminUpdate,
    db_admin: AuthenticatedAdmin,
    admin_service: AdminServiceDep,
):
    return await admin_service.update_admin(
        admin_id=db_admin.id,
        admin_update=admin_update,
    )
