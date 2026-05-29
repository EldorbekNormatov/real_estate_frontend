export const ROLES = {
  admin: 'admin',
  manager: 'manager',
  sales_operator: 'sales_operator',
}

export const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Menejer',
  sales_operator: 'Sotuv operatori',
}

/** Sozlamalarda foydalanuvchi boshqaruvi */
export function canManageUsers(role) {
  return role === ROLES.admin || role === ROLES.manager
}

/** Yaratishda tanlanadigan rollar */
export function getAssignableRoles(currentRole) {
  if (currentRole === ROLES.admin) {
    return [ROLES.admin, ROLES.manager, ROLES.sales_operator]
  }
  if (currentRole === ROLES.manager) {
    return [ROLES.manager, ROLES.sales_operator]
  }
  return []
}
