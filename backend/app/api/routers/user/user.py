from app.api.dependencies.factories import PostServiceDep, UserServiceDep
from app.api.dependencies.auth import AuthenticatedUser, VisitorSavedPostIdsDep
from app.api.dependencies.background_tasks import ServicesBackgroundTasks
from app.api.dependencies.language import require_lang
from fastapi import APIRouter, Depends, Request, Form
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas import user as user_schemas, common as common_schemas
from app.core.settings import settings
from app.core.exceptions.enums import ErrorCode
from app.core.exceptions.responses import error_responses
from app.core.messages.enums import SuccessCode
from app.core.middlewares.logger_context import StructlogRoute
from typing import Annotated

router = APIRouter(route_class=StructlogRoute, dependencies=[Depends(require_lang)])

#########################################################################################################
#########################################################################################################
@router.post(
    "",
    response_model=user_schemas.UserTokenResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.ALREADY_EXISTS,
        ErrorCode.COMPROMISED_PASSWORD,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def register_new_user(
    request: Request,
    user_create: user_schemas.UserCreate,
    saved_post_ids: VisitorSavedPostIdsDep,
    user_service: UserServiceDep,
    post_service: PostServiceDep,
    background: ServicesBackgroundTasks,
):
    db_user = await user_service.register_new_user(
        user_create=user_create,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

    if saved_post_ids:
        await post_service.merge_saved(user_id=db_user.user.id, post_ids=saved_post_ids)

    background.add_task(user_service.send_verification_email, user_id=db_user.user.id)
    return db_user

#########################################################################################################
#########################################################################################################
@router.post(
    "/login",
    response_model=user_schemas.UserTokenResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.UNAUTHORIZED_ACCESS,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def login_for_access_token(
    request: Request,
    saved_post_ids: VisitorSavedPostIdsDep,
    user_service: UserServiceDep,
    post_service: PostServiceDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
):
    token = await user_service.authenticate_user(
        email=form_data.username,
        password=form_data.password,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

    if saved_post_ids:
        await post_service.merge_saved(user_id=token.user.id, post_ids=saved_post_ids)

    return token

#########################################################################################################
#########################################################################################################
@router.post(
    "/refresh",
    response_model=user_schemas.UserTokenResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def refresh_access_token(
    request: Request,
    user_service: UserServiceDep,
    refresh_token: Annotated[str, Form()],
    grant_type: Annotated[str | None, Form()] = None,
):
    return await user_service.refresh_access_token(
        refresh_token=refresh_token,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

#########################################################################################################
#########################################################################################################
@router.post(
    "/forgot-password",
    response_model=common_schemas.MessageResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def forgot_password(
    payload: user_schemas.PasswordForgot,
    user_service: UserServiceDep,
    background: ServicesBackgroundTasks,
):
    background.add_task(user_service.send_password_reset_email, email=payload.email)
    return common_schemas.MessageResponse.of(code=SuccessCode.PASSWORD_RESET_LINK_SENT)

#########################################################################################################
#########################################################################################################
@router.post(
    "/email-change",
    response_model=common_schemas.MessageResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.ALREADY_EXISTS,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def request_email_change(
    payload: user_schemas.EmailChange,
    db_user: AuthenticatedUser,
    user_service: UserServiceDep,
    background: ServicesBackgroundTasks,
):
    await user_service.check_email_available(new_email=payload.new_email)
    background.add_task(
        user_service.send_email_change_email,
        user_id=db_user.id,
        new_email=payload.new_email,
    )
    return common_schemas.MessageResponse.of(code=SuccessCode.EMAIL_CHANGE_LINK_SENT)

#########################################################################################################
#########################################################################################################
@router.get(
    "/email-change/confirm",
    response_class=RedirectResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def confirm_email_change(
    token: str,
    user_service: UserServiceDep,
):
    changed = await user_service.confirm_email_change(token=token)
    base = str(settings.USER_WEB_HOST).rstrip("/")
    return RedirectResponse(url=f"{base}/email-changed?success={'true' if changed else 'false'}")

#########################################################################################################
#########################################################################################################
@router.post(
    "/resend-verification",
    response_model=common_schemas.MessageResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
    ),
)
async def resend_verification(
    db_user: AuthenticatedUser,
    user_service: UserServiceDep,
    background: ServicesBackgroundTasks,
):
    background.add_task(user_service.send_verification_email, user_id=db_user.id)
    return common_schemas.MessageResponse.of(code=SuccessCode.VERIFICATION_LINK_SENT)

#########################################################################################################
#########################################################################################################
@router.get(
    "/verify-email",
    response_class=RedirectResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def verify_email(
    token: str,
    user_service: UserServiceDep,
):
    verified = await user_service.verify_email(token=token)
    base = str(settings.USER_WEB_HOST).rstrip("/")
    return RedirectResponse(url=f"{base}/email-verified?success={'true' if verified else 'false'}")

#########################################################################################################
#########################################################################################################
@router.post(
    "/reset-password",
    response_model=user_schemas.UserTokenResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.COMPROMISED_PASSWORD,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def reset_password(
    request: Request,
    payload: user_schemas.PasswordReset,
    user_service: UserServiceDep,
):
    return await user_service.reset_password(
        token=payload.token,
        new_password=payload.new_password,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

#########################################################################################################
#########################################################################################################
@router.get(
    "/me",
    response_model=user_schemas.UserResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
    ),
)
async def read_current_user(
    db_user: AuthenticatedUser,
):
    return db_user

#########################################################################################################
#########################################################################################################
@router.delete(
    "",
    response_model=common_schemas.MessageResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
    ),
)
async def delete_own_user_account(
    db_user: AuthenticatedUser,
    user_service: UserServiceDep,
):
    await user_service.delete_user(user_id=db_user.id)
    return common_schemas.MessageResponse.of(code=SuccessCode.ACCOUNT_DELETED)

#########################################################################################################
#########################################################################################################
@router.put(
    "",
    response_model=user_schemas.UserResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.BAD_REQUEST,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def update_user(
    user_update: user_schemas.UserUpdate,
    db_user: AuthenticatedUser,
    user_service: UserServiceDep,
):
    return await user_service.update_user(
        user_id=db_user.id,
        user_update=user_update,
    )

#########################################################################################################
#########################################################################################################
@router.put(
    "/password",
    response_model=user_schemas.UserTokenResponse,
    response_model_exclude_none=True,
    responses=error_responses(
        ErrorCode.INVALID_OR_EXPIRED_TOKEN,
        ErrorCode.ITEM_NOT_FOUND,
        ErrorCode.BAD_REQUEST,
        ErrorCode.COMPROMISED_PASSWORD,
        ErrorCode.INVALID_PARAMETERS,
    ),
)
async def change_password(
    request: Request,
    payload: user_schemas.PasswordChange,
    db_user: AuthenticatedUser,
    user_service: UserServiceDep,
):
    return await user_service.change_password(
        user_id=db_user.id,
        old_password=payload.old_password,
        new_password=payload.new_password,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )

