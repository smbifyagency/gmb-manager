// Permission System for Multi-Role & Multi-Tenant Isolation
// Defines granular permissions and role-to-permission mappings

// ============= PERMISSION DEFINITIONS =============

export const PERMISSIONS = {
    // Team Management
    TEAM_VIEW: 'team:view',
    TEAM_MANAGE: 'team:manage',
    TEAM_DELETE: 'team:delete',
    TEAM_INVITE: 'team:invite',

    // Client Management
    CLIENT_VIEW: 'client:view',
    CLIENT_CREATE: 'client:create',
    CLIENT_UPDATE: 'client:update',
    CLIENT_DELETE: 'client:delete',

    // Location Management
    LOCATION_VIEW: 'location:view',
    LOCATION_CREATE: 'location:create',
    LOCATION_UPDATE: 'location:update',
    LOCATION_DELETE: 'location:delete',

    // SOP Management
    SOP_VIEW: 'sop:view',
    SOP_CREATE: 'sop:create',
    SOP_UPDATE: 'sop:update',
    SOP_DELETE: 'sop:delete',

    // Workflow Management
    WORKFLOW_VIEW: 'workflow:view',
    WORKFLOW_START: 'workflow:start',
    WORKFLOW_MANAGE: 'workflow:manage',
    WORKFLOW_DELETE: 'workflow:delete',

    // Task Management
    TASK_VIEW: 'task:view',
    TASK_VIEW_ALL: 'task:view_all',  // View all tasks vs only assigned
    TASK_COMPLETE: 'task:complete',
    TASK_ASSIGN: 'task:assign',
    TASK_APPROVE: 'task:approve',

    // Notifications
    NOTIFICATION_VIEW: 'notification:view',
    NOTIFICATION_MANAGE: 'notification:manage',

    // Settings
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_MANAGE: 'settings:manage',

    // Reports
    REPORT_VIEW: 'report:view',
    REPORT_CREATE: 'report:create',
    REPORT_DOWNLOAD: 'report:download',

    // Invoices & Billing
    INVOICE_VIEW: 'invoice:view',
    INVOICE_CREATE: 'invoice:create',
    INVOICE_UPDATE: 'invoice:update',
    INVOICE_DELETE: 'invoice:delete',
    INVOICE_SEND: 'invoice:send',
    PAYMENT_VIEW: 'payment:view',
    PAYMENT_RECORD: 'payment:record',

    // Service Types
    SERVICE_VIEW: 'service:view',
    SERVICE_MANAGE: 'service:manage',

    // Analytics
    ANALYTICS_VIEW: 'analytics:view',
    ANALYTICS_EXPORT: 'analytics:export',

    // User Management (Admin-only operations)
    USER_VIEW: 'user:view',
    USER_CREATE: 'user:create',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',
    USER_ROLE_CHANGE: 'user:role_change',         // Change user roles
    USER_PERMISSION_EDIT: 'user:permission_edit', // Edit user permissions
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// ============= ROLE TYPES =============

export type TeamRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEAM'
export type SystemRole = 'SUPER_ADMIN' | 'USER' | 'CLIENT'

// ============= ROLE-TO-PERMISSION MAPPING =============

// Super Admin: Full access to everything within their team - Agency Owner
const SUPER_ADMIN_PERMISSIONS: Permission[] = Object.values(PERMISSIONS)

// Team Admin: Can manage members, clients, SOPs - cannot delete team
const ADMIN_PERMISSIONS: Permission[] = [
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_INVITE,
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.CLIENT_CREATE,
    PERMISSIONS.CLIENT_UPDATE,
    PERMISSIONS.LOCATION_VIEW,
    PERMISSIONS.LOCATION_CREATE,
    PERMISSIONS.LOCATION_UPDATE,
    PERMISSIONS.SOP_VIEW,
    PERMISSIONS.SOP_CREATE,
    PERMISSIONS.SOP_UPDATE,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.WORKFLOW_START,
    PERMISSIONS.WORKFLOW_MANAGE,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_VIEW_ALL,
    PERMISSIONS.TASK_COMPLETE,
    PERMISSIONS.TASK_ASSIGN,
    PERMISSIONS.TASK_APPROVE,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.NOTIFICATION_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.REPORT_DOWNLOAD,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_SEND,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_RECORD,
    PERMISSIONS.SERVICE_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
]

// Team Member: Can view and complete tasks, start workflows
const TEAM_PERMISSIONS: Permission[] = [
    PERMISSIONS.CLIENT_VIEW,
    PERMISSIONS.LOCATION_VIEW,
    PERMISSIONS.SOP_VIEW,
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.WORKFLOW_START,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.TASK_COMPLETE,
    PERMISSIONS.NOTIFICATION_VIEW,
]

// Client: Read-only access to their own projects
const CLIENT_PERMISSIONS: Permission[] = [
    PERMISSIONS.WORKFLOW_VIEW,
    PERMISSIONS.TASK_VIEW,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_DOWNLOAD,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
]

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
    SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
    ADMIN: ADMIN_PERMISSIONS,
    TEAM: TEAM_PERMISSIONS,
}

// System role permissions for CLIENT users
export const SYSTEM_ROLE_PERMISSIONS: Partial<Record<SystemRole, Permission[]>> = {
    CLIENT: CLIENT_PERMISSIONS,
}

// ============= PERMISSION CHECK HELPERS =============

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: TeamRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: TeamRole): Permission[] {
    return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Check if user can access a specific client based on their role and assignments
 */
export function canAccessClient(
    userRole: TeamRole,
    userAssignedClientIds: string[],
    targetClientId: string
): boolean {
    // SUPER_ADMIN and ADMIN can access all clients in their team
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
        return true
    }

    // TEAM members can only access assigned clients
    return userAssignedClientIds.includes(targetClientId)
}

/**
 * Check if user can perform action requiring owner approval
 */
export function canApprove(role: TeamRole): boolean {
    return role === 'SUPER_ADMIN' || role === 'ADMIN'
}

// ============= PERMISSION CONSTANTS FOR UI =============

export const PERMISSION_LABELS: Record<Permission, string> = {
    [PERMISSIONS.TEAM_VIEW]: 'View Team',
    [PERMISSIONS.TEAM_MANAGE]: 'Manage Team',
    [PERMISSIONS.TEAM_DELETE]: 'Delete Team',
    [PERMISSIONS.TEAM_INVITE]: 'Invite Members',
    [PERMISSIONS.CLIENT_VIEW]: 'View Clients',
    [PERMISSIONS.CLIENT_CREATE]: 'Create Clients',
    [PERMISSIONS.CLIENT_UPDATE]: 'Update Clients',
    [PERMISSIONS.CLIENT_DELETE]: 'Delete Clients',
    [PERMISSIONS.LOCATION_VIEW]: 'View Locations',
    [PERMISSIONS.LOCATION_CREATE]: 'Create Locations',
    [PERMISSIONS.LOCATION_UPDATE]: 'Update Locations',
    [PERMISSIONS.LOCATION_DELETE]: 'Delete Locations',
    [PERMISSIONS.SOP_VIEW]: 'View SOPs',
    [PERMISSIONS.SOP_CREATE]: 'Create SOPs',
    [PERMISSIONS.SOP_UPDATE]: 'Update SOPs',
    [PERMISSIONS.SOP_DELETE]: 'Delete SOPs',
    [PERMISSIONS.WORKFLOW_VIEW]: 'View Workflows',
    [PERMISSIONS.WORKFLOW_START]: 'Start Workflows',
    [PERMISSIONS.WORKFLOW_MANAGE]: 'Manage Workflows',
    [PERMISSIONS.WORKFLOW_DELETE]: 'Delete Workflows',
    [PERMISSIONS.TASK_VIEW]: 'View Tasks',
    [PERMISSIONS.TASK_VIEW_ALL]: 'View All Tasks',
    [PERMISSIONS.TASK_COMPLETE]: 'Complete Tasks',
    [PERMISSIONS.TASK_ASSIGN]: 'Assign Tasks',
    [PERMISSIONS.TASK_APPROVE]: 'Approve Tasks',
    [PERMISSIONS.NOTIFICATION_VIEW]: 'View Notifications',
    [PERMISSIONS.NOTIFICATION_MANAGE]: 'Manage Notifications',
    [PERMISSIONS.SETTINGS_VIEW]: 'View Settings',
    [PERMISSIONS.SETTINGS_MANAGE]: 'Manage Settings',
    [PERMISSIONS.REPORT_VIEW]: 'View Reports',
    [PERMISSIONS.REPORT_CREATE]: 'Create Reports',
    [PERMISSIONS.REPORT_DOWNLOAD]: 'Download Reports',
    [PERMISSIONS.INVOICE_VIEW]: 'View Invoices',
    [PERMISSIONS.INVOICE_CREATE]: 'Create Invoices',
    [PERMISSIONS.INVOICE_UPDATE]: 'Update Invoices',
    [PERMISSIONS.INVOICE_DELETE]: 'Delete Invoices',
    [PERMISSIONS.INVOICE_SEND]: 'Send Invoices',
    [PERMISSIONS.PAYMENT_VIEW]: 'View Payments',
    [PERMISSIONS.PAYMENT_RECORD]: 'Record Payments',
    [PERMISSIONS.SERVICE_VIEW]: 'View Services',
    [PERMISSIONS.SERVICE_MANAGE]: 'Manage Services',
    [PERMISSIONS.ANALYTICS_VIEW]: 'View Analytics',
    [PERMISSIONS.ANALYTICS_EXPORT]: 'Export Analytics',
    [PERMISSIONS.USER_VIEW]: 'View Users',
    [PERMISSIONS.USER_CREATE]: 'Create Users',
    [PERMISSIONS.USER_UPDATE]: 'Update Users',
    [PERMISSIONS.USER_DELETE]: 'Delete Users',
    [PERMISSIONS.USER_ROLE_CHANGE]: 'Change User Roles',
    [PERMISSIONS.USER_PERMISSION_EDIT]: 'Edit User Permissions',
}

export const ROLE_LABELS: Record<TeamRole, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    TEAM: 'Team Member',
}

export const ROLE_DESCRIPTIONS: Record<TeamRole, string> = {
    SUPER_ADMIN: 'Full control over team settings, members, clients, and all data',
    ADMIN: 'Can manage clients, SOPs, workflows, and assign tasks to members',
    TEAM: 'Can view assigned clients and complete assigned tasks',
}
