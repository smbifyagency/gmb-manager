// Authorization Middleware for Multi-Tenant Isolation
// Ensures users can only access data within their team/client scope

import { TeamRole, SystemRole, Permission, ROLE_PERMISSIONS, SYSTEM_ROLE_PERMISSIONS } from './permissions'

// ============= TYPES =============

export interface AuthUser {
    id: string
    email: string
    name: string
    systemRole: SystemRole
    avatarUrl?: string
}

export interface TeamContext {
    teamId: string
    teamName: string
    teamSlug: string
    role: TeamRole
    permissions: Permission[]
}

export interface ClientContext {
    clientId: string
    clientName: string
    role: string // 'assigned' | 'manager' | 'owner'
}

export interface AuthContext {
    user: AuthUser
    currentTeam: TeamContext | null
    assignedClients: ClientContext[]
    isSuperAdmin: boolean
    isClient: boolean
}

// ============= AUTHORIZATION HELPERS =============

/**
 * Check if user has a specific permission in the current team context
 */
export function hasPermission(context: AuthContext, permission: Permission): boolean {
    // Super admin has all permissions
    if (context.isSuperAdmin) {
        return true
    }

    // Client users have limited permissions
    if (context.isClient) {
        return SYSTEM_ROLE_PERMISSIONS.CLIENT?.includes(permission) ?? false
    }

    // Check team-based permissions
    if (context.currentTeam) {
        return context.currentTeam.permissions.includes(permission)
    }

    return false
}

/**
 * Check if user can access a specific team
 */
export function canAccessTeam(context: AuthContext, teamId: string): boolean {
    if (context.isSuperAdmin) return true
    return context.currentTeam?.teamId === teamId
}

/**
 * Check if user can access a specific client
 */
export function canAccessClient(context: AuthContext, clientId: string): boolean {
    if (context.isSuperAdmin) return true

    // OWNER and ADMIN can access all clients in their team
    if (context.currentTeam?.role === 'OWNER' || context.currentTeam?.role === 'ADMIN') {
        return true // Assumes client is in their team (should verify in DB)
    }

    // MEMBER and CLIENT can only access assigned clients
    return context.assignedClients.some(c => c.clientId === clientId)
}

/**
 * Get the appropriate Prisma where clause for filtering by team
 */
export function getTeamFilter(context: AuthContext) {
    if (context.isSuperAdmin) {
        return {} // No filter for super admin
    }

    if (!context.currentTeam) {
        return { id: 'none' } // No access if no team context
    }

    return { teamId: context.currentTeam.teamId }
}

/**
 * Get the appropriate Prisma where clause for filtering clients
 */
export function getClientFilter(context: AuthContext) {
    if (context.isSuperAdmin) {
        return {}
    }

    if (!context.currentTeam) {
        return { id: 'none' }
    }

    // OWNER and ADMIN see all clients in their team
    if (context.currentTeam.role === 'OWNER' || context.currentTeam.role === 'ADMIN') {
        return { teamId: context.currentTeam.teamId }
    }

    // MEMBER only sees assigned clients
    const assignedClientIds = context.assignedClients.map(c => c.clientId)
    return {
        teamId: context.currentTeam.teamId,
        id: { in: assignedClientIds }
    }
}

/**
 * Get the appropriate Prisma where clause for filtering workflows
 * Workflows are tied to Location → Client → Team
 */
export function getWorkflowFilter(context: AuthContext) {
    if (context.isSuperAdmin) {
        return {}
    }

    if (!context.currentTeam) {
        return { id: 'none' }
    }

    // Base filter: must be in current team
    const baseFilter = {
        location: {
            client: {
                teamId: context.currentTeam.teamId
            }
        }
    }

    // OWNER and ADMIN see all workflows in team
    if (context.currentTeam.role === 'OWNER' || context.currentTeam.role === 'ADMIN') {
        return baseFilter
    }

    // MEMBER and CLIENT only see workflows for assigned clients
    const assignedClientIds = context.assignedClients.map(c => c.clientId)
    return {
        location: {
            client: {
                teamId: context.currentTeam.teamId,
                id: { in: assignedClientIds }
            }
        }
    }
}

/**
 * Get the appropriate Prisma where clause for filtering tasks
 */
export function getTaskFilter(context: AuthContext) {
    if (context.isSuperAdmin) {
        return {}
    }

    if (!context.currentTeam) {
        return { id: 'none' }
    }

    const workflowFilter = getWorkflowFilter(context)

    // OWNER and ADMIN see all tasks
    if (context.currentTeam.role === 'OWNER' || context.currentTeam.role === 'ADMIN') {
        return { workflowInstance: workflowFilter }
    }

    // MEMBER sees only assigned tasks or tasks for assigned clients
    return {
        OR: [
            { assignedToId: context.user.id },
            { workflowInstance: workflowFilter }
        ]
    }
}

/**
 * Get the appropriate Prisma where clause for filtering SOPs
 */
export function getSOPFilter(context: AuthContext) {
    if (context.isSuperAdmin) {
        return {}
    }

    if (!context.currentTeam) {
        // Can only see global templates
        return { isGlobal: true }
    }

    // Can see global templates + team's custom templates
    return {
        OR: [
            { isGlobal: true },
            { teamId: context.currentTeam.teamId }
        ]
    }
}

/**
 * Get the appropriate Prisma where clause for filtering notifications
 */
export function getNotificationFilter(context: AuthContext) {
    // Notifications are always user-specific
    return {
        userId: context.user.id,
        isDeleted: false
    }
}

// ============= CONTEXT BUILDERS =============

/**
 * Build permissions array for a team role
 */
export function buildPermissions(role: TeamRole): Permission[] {
    return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Create an AuthContext from user data (typically from session/JWT)
 */
export function createAuthContext(
    user: AuthUser,
    teamContext: TeamContext | null,
    assignedClients: ClientContext[]
): AuthContext {
    return {
        user,
        currentTeam: teamContext,
        assignedClients,
        isSuperAdmin: user.systemRole === 'SUPER_ADMIN',
        isClient: user.systemRole === 'CLIENT'
    }
}
