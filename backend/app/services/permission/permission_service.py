from typing import TYPE_CHECKING, Dict, List
from app.services.base_service import BaseService
from app.schemas import permission as permission_schemas

if TYPE_CHECKING:
    from app.services.service_provider import ServiceProvider
    from app.repositories import PermissionRepository

#########################################################################################################
#########################################################################################################
class PermissionService(BaseService):
    #########################################################################################################
    #########################################################################################################
    def __init__(self, provider: "ServiceProvider"):
        super().__init__(provider)

    #########################################################################################################
    #########################################################################################################
    @property
    def permission_repo(self) -> "PermissionRepository":
        return self.provider.permission_repo

    #########################################################################################################
    #########################################################################################################
    async def get_tree(self) -> List[permission_schemas.PermissionResponse]:
        """The permission tree, nested.

        A row's parent is its path minus the last segment, so the shape is rebuilt from the paths
        themselves rather than from a stored parent column that could disagree with them. The rows
        arrive parent first, so each node finds its parent already placed."""
        by_path: Dict[str, permission_schemas.PermissionResponse] = {}
        roots: List[permission_schemas.PermissionResponse] = []

        for permission in await self.permission_repo.list_all():
            node = permission_schemas.PermissionResponse.model_validate(permission)
            by_path[node.path] = node

            parent_path, separator, _ = node.path.rpartition(".")
            if separator and parent_path in by_path:
                by_path[parent_path].children.append(node)
            else:
                roots.append(node)

        return roots
