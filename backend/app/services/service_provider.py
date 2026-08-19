from sqlalchemy.ext.asyncio import AsyncSession
from typing import Type, Any, Callable, Dict, Optional
from app.repositories import (
    UserRepository,
    SessionRepository,
    AdminRepository,
    PermissionRepository,
    PostRepository,
)
from app.services.user.user_service import UserService
from app.services.notification.notification_service import NotificationService
from app.services.auth.auth_service import AuthService
from app.services.admin.admin_service import AdminService
from app.services.permission.permission_service import PermissionService
from app.services.post.post_service import PostService

#########################################################################################################
#########################################################################################################
class ServiceProvider:
    #########################################################################################################
    #########################################################################################################
    def __init__(self, session_factory: Callable[[], AsyncSession]):
        self.session_factory = session_factory
        self._session: Optional[AsyncSession] = None
        self._repos: Dict[Type, Any] = {}
        self._services: Dict[Type, Any] = {}

    #########################################################################################################
    #########################################################################################################
    @property
    def session(self) -> AsyncSession:
        """Returns the current session, creating it if it doesn't exist."""
        if self._session is None:
            self._session = self.session_factory()
        return self._session

    #########################################################################################################
    #########################################################################################################
    async def _close_current_session(self) -> None:
        """Closes the session if it was opened."""
        if self._session is not None:
            await self._session.close()
            self._session = None

    #########################################################################################################
    #########################################################################################################
    def _get_repo(self, repo_cls: Type) -> Any:
        if repo_cls not in self._repos:
            self._repos[repo_cls] = repo_cls(session=self.session)
        return self._repos[repo_cls]

    #########################################################################################################
    #########################################################################################################
    def _get_service(self, service_cls: Type) -> Any:
        if service_cls not in self._services:
            self._services[service_cls] = service_cls(provider=self)
        return self._services[service_cls]

    #########################################################################################################
    #########################################################################################################
    def get_by_class(self, dependency_class: Type) -> Any:
        return self._get_service(dependency_class)

    #########################################################################################################
    #########################################################################################################
    @property
    def user_repo(self) -> UserRepository:
        return self._get_repo(UserRepository)

    #########################################################################################################
    #########################################################################################################
    @property
    def session_repo(self) -> SessionRepository:
        return self._get_repo(SessionRepository)

    #########################################################################################################
    #########################################################################################################
    @property
    def admin_repo(self) -> AdminRepository:
        return self._get_repo(AdminRepository)

    #########################################################################################################
    #########################################################################################################
    @property
    def permission_repo(self) -> PermissionRepository:
        return self._get_repo(PermissionRepository)

    #########################################################################################################
    #########################################################################################################
    @property
    def post_repo(self) -> PostRepository:
        return self._get_repo(PostRepository)

    #########################################################################################################
    #########################################################################################################
    @property
    def user_service(self) -> UserService:
        return self._get_service(UserService)

    #########################################################################################################
    #########################################################################################################
    @property
    def notification_service(self) -> NotificationService:
        return self._get_service(NotificationService)

    #########################################################################################################
    #########################################################################################################
    @property
    def auth_service(self) -> AuthService:
        return self._get_service(AuthService)

    #########################################################################################################
    #########################################################################################################
    @property
    def admin_service(self) -> AdminService:
        return self._get_service(AdminService)

    #########################################################################################################
    #########################################################################################################
    @property
    def permission_service(self) -> PermissionService:
        return self._get_service(PermissionService)

    #########################################################################################################
    #########################################################################################################
    @property
    def post_service(self) -> PostService:
        return self._get_service(PostService)
