/**
 * Check if a user has privileged roles (any role other than 'user')
 * @param {Array} roles - Array of role names
 * @returns {boolean} - True if user has any privileged role
 */
export const isPrivilegedRole = (roles = []) => {
    return roles.some((role) => role !== 'user');
};

/**
 * Check if a user has a specific role
 * @param {Array} roles - Array of role names
 * @param {string} roleName - Role name to check for
 * @returns {boolean} - True if user has the specified role
 */
export const hasRole = (roles = [], roleName) => {
    return roles.includes(roleName);
};

/**
 * Check if a user has admin role
 * @param {Array} roles - Array of role names
 * @returns {boolean} - True if user has admin role
 */
export const isAdmin = (roles = []) => {
    return hasRole(roles, 'admin');
};

/**
 * Check if a user has a specific permission
 * @param {Array} permissions - Array of permission names
 * @param {string} permissionName - Permission name to check for
 * @returns {boolean} - True if user has the specified permission
 */
export const hasPermission = (permissions = [], permissionName) => {
    return permissions.includes(permissionName);
};

/**
 * Check if a user has any of the given permissions
 * @param {Array} permissions - Array of permission names
 * @param {Array} permissionNames - Array of permission names to check for
 * @returns {boolean} - True if user has any of the specified permissions
 */
export const hasAnyPermission = (permissions = [], permissionNames = []) => {
    return permissionNames.some((p) => hasPermission(permissions, p));
};

/**
 * Check if a user has all of the given permissions
 * @param {Array} permissions - Array of permission names
 * @param {Array} permissionNames - Array of permission names to check for
 * @returns {boolean} - True if user has all of the specified permissions
 */
export const hasAllPermissions = (permissions = [], permissionNames = []) => {
    return permissionNames.every((p) => hasPermission(permissions, p));
};
