/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export function pruneToHeld(
  node: PermissionNode,
  held: Set<string>
): PermissionNode | null {
  if (node.grantable) {
    return held.has(node.path) ? node : null
  }
  const children = node.children
    .map((child) => pruneToHeld(child, held))
    .filter((child): child is PermissionNode => child !== null)
  return children.length > 0 ? { ...node, children } : null
}
