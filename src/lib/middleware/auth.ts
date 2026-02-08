// Permission Middleware for API Routes
// Enforces role-based and user-level permission checks

import { prisma } from '@/lib/db'
import { PERMISSIONS, Permission, ROLE_PERMISSIONS, TeamRole } from '@/lib/permissions'

// ============= USER PERMISSION RESOLUTION =============

export interface UserContext {
    id: string
    email: string
    name: string
    systemRole: 'SUPER_ADMIN' | 'USER' | 'CLIENT'
    teamMemberships: Array<{
        teamId: string
        role: TeamRole
    }>
    customPermissions: string[]
    useCustomPermissions: boolean
}

/**
 * Get effective permissions for a user
 * Priority: customPermissions (if enabled) > role defaults
 */
export function getEffectivePermissions(
    user: UserContext,
    teamId?: string
): Permission[] {
    // SUPER_ADMIN always has all permissions
    if (user.systemRole === 'SUPER_ADMIN') {
        return Object.values(PERMISSIONS)
    }

    // If using custom permissions, return those
    if (user.useCustomPermissions && user.customPermissions.length > 0) {
        return user.customPermissions as Permission[]
    }

    // CLIENT users have fixed limited permissions
    if (user.systemRole === 'CLIENT') {
        return [
            PERMISSIONS.WORKFLOW_VIEW,
            PERMISSIONS.TASK_VIEW,
            PERMISSIONS.NOTIFICATION_VIEW,
            PERMISSIONS.REPORT_VIEW,
            PERMISSIONS.REPORT_DOWNLOAD,
            PERMISSIONS.INVOICE_VIEW,
            PERMISSIONS.ANALYTICS_VIEW,
        ]
    }

    // Get role from team membership
    if (teamId) {
        const membership = user.teamMemberships.find(m => m.teamId === teamId)
        if (membership) {
            return ROLE_PERMISSIONS[membership.role] || []
        }
    }

    // If user has any team membership, use highest role
    if (user.teamMemberships.length > 0) {
        const roleHierarchy: TeamRole[] = ['SUPER_ADMIN', 'ADMIN', 'TEAM']
        for (const role of roleHierarchy) {
            if (user.teamMemberships.some(m => m.role === role)) {
                return ROLE_PERMISSIONS[role]
            }
        }
    }

    return []
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
    user: UserContext,
    permission: Permission,
    teamId?: string
): boolean {
    const permissions = getEffectivePermissions(user, teamId)
    return permissions.includes(permission)
}

// ============= ROLE CHANGE ENFORCEMENT =============

/**
 * Check if actor can change target user's role
 * Only OWNER/ADMIN (or SUPER_ADMIN) can change roles
 */
export function canChangeUserRole(
    actor: UserContext,
    targetUserId: string,
    teamId: string
): boolean {
    // Cannot change own role (prevents privilege escalation)
    if (actor.id === targetUserId) {
        return false
    }

    // SUPER_ADMIN can change any role
    if (actor.systemRole === 'SUPER_ADMIN') {
        return true
    }

    // Check if actor is OWNER or ADMIN of the team
    const membership = actor.teamMemberships.find(m => m.teamId === teamId)
    if (!membership) {
        return false
    }

    return membership.role === 'SUPER_ADMIN' || membership.role === 'ADMIN'
}

/**
 * Check if actor can edit target user's permissions
 */
export function canEditUserPermissions(
    actor: UserContext,
    targetUserId: string,
    teamId: string
): boolean {
    // SUPER_ADMIN can edit anyone
    if (actor.systemRole === 'SUPER_ADMIN') {
        return true
    }

    // Only OWNER/ADMIN can edit permissions
    const membership = actor.teamMemberships.find(m => m.teamId === teamId)
    if (!membership) {
        return false
    }

    return membership.role === 'SUPER_ADMIN' || membership.role === 'ADMIN'
}

/**
 * Validate role change is allowed (prevent privilege escalation)
 * Member cannot promote to Admin/Owner
 */
export function isValidRoleChange(
    actorRole: TeamRole,
    newRole: TeamRole
): boolean {
    const roleHierarchy: Record<TeamRole, number> = {
        SUPER_ADMIN: 3,
        ADMIN: 2,
        TEAM: 1,
    }

    // Actor can only assign roles equal or below their level
    return roleHierarchy[newRole] <= roleHierarchy[actorRole]
}

// ============= FETCH USER CONTEXT =============

/**
 * Fetch full user context from database
 */
export async function getUserContext(userId: string): Promise<UserContext | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            name: true,
            systemRole: true,
            customPermissions: true,
            useCustomPermissions: true,
            teamMemberships: {
                select: {
                    teamId: true,
                    role: true,
                }
            }
        }
    })

    if (!user) return null

    // Parse custom permissions from JSON string
    let customPermissions: string[] = []
    try {
        customPermissions = JSON.parse(user.customPermissions || '[]')
    } catch {
        customPermissions = []
    }

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        systemRole: user.systemRole as UserContext['systemRole'],
        teamMemberships: user.teamMemberships.map(m => ({
            teamId: m.teamId,
            role: m.role as TeamRole,
        })),
        customPermissions,
        useCustomPermissions: user.useCustomPermissions,
    }
}

// ============= API HELPERS =============

/**
 * Check if user is admin of any team
 */
export function isTeamAdmin(user: UserContext): boolean {
    if (user.systemRole === 'SUPER_ADMIN') return true
    return user.teamMemberships.some(m =>
        m.role === 'SUPER_ADMIN' || m.role === 'ADMIN'
    )
}

/**
 * Check if user is admin of specific team
 */
export function isAdminOfTeam(user: UserContext, teamId: string): boolean {
    if (user.systemRole === 'SUPER_ADMIN') return true
    const membership = user.teamMemberships.find(m => m.teamId === teamId)
    return membership?.role === 'SUPER_ADMIN' || membership?.role === 'ADMIN'
}

/**
 * Get user's highest role across all teams
 */
export function getHighestRole(user: UserContext): TeamRole | null {
    if (user.systemRole === 'SUPER_ADMIN') return 'SUPER_ADMIN'

    const roleHierarchy: TeamRole[] = ['SUPER_ADMIN', 'ADMIN', 'TEAM']
    for (const role of roleHierarchy) {
        if (user.teamMemberships.some(m => m.role === role)) {
            return role
        }
    }
    return null
}
