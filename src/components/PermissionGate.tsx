'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Permission } from '@/lib/permissions'

// ============= PERMISSION GATE COMPONENT =============

interface PermissionGateProps {
    /** Required permission to show children */
    permission?: Permission
    /** Alternative: require any of these permissions */
    anyOf?: Permission[]
    /** Alternative: require all of these permissions */
    allOf?: Permission[]
    /** What to show when permission denied (optional) */
    fallback?: ReactNode
    /** Children to render when permission granted */
    children: ReactNode
}

/**
 * Conditionally render children based on user permissions.
 * Use this to gate UI elements like buttons, sections, or entire pages.
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="sop:create">
 *   <button>Create SOP</button>
 * </PermissionGate>
 * 
 * @example
 * // Any of multiple permissions
 * <PermissionGate anyOf={["invoice:create", "invoice:update"]}>
 *   <InvoiceForm />
 * </PermissionGate>
 * 
 * @example
 * // With fallback
 * <PermissionGate permission="user:delete" fallback={<p>Access denied</p>}>
 *   <DeleteButton />
 * </PermissionGate>
 */
export function PermissionGate({
    permission,
    anyOf,
    allOf,
    fallback = null,
    children
}: PermissionGateProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions, isSuperAdmin } = useAuth()

    // Super admin bypasses all permission checks
    if (isSuperAdmin) {
        return <>{children}</>
    }

    // Check single permission
    if (permission) {
        if (!hasPermission(permission)) {
            return <>{fallback}</>
        }
    }

    // Check any of permissions
    if (anyOf && anyOf.length > 0) {
        if (!hasAnyPermission(anyOf)) {
            return <>{fallback}</>
        }
    }

    // Check all permissions
    if (allOf && allOf.length > 0) {
        if (!hasAllPermissions(allOf)) {
            return <>{fallback}</>
        }
    }

    return <>{children}</>
}

// ============= ADMIN-ONLY GATE =============

interface AdminGateProps {
    /** What to show when not admin */
    fallback?: ReactNode
    children: ReactNode
}

/**
 * Only render children if user is team admin/owner or super admin.
 */
export function AdminGate({ fallback = null, children }: AdminGateProps) {
    const { isTeamOwner, isTeamAdmin, isSuperAdmin } = useAuth()

    if (isSuperAdmin || isTeamOwner || isTeamAdmin) {
        return <>{children}</>
    }

    return <>{fallback}</>
}

// ============= OWNER-ONLY GATE =============

interface OwnerGateProps {
    fallback?: ReactNode
    children: ReactNode
}

/**
 * Only render children if user is team owner or super admin.
 */
export function OwnerGate({ fallback = null, children }: OwnerGateProps) {
    const { isTeamOwner, isSuperAdmin } = useAuth()

    if (isSuperAdmin || isTeamOwner) {
        return <>{children}</>
    }

    return <>{fallback}</>
}

// ============= HOOKS FOR CONDITIONAL RENDERING =============

/**
 * Hook to check if current user is admin
 */
export function useIsAdmin(): boolean {
    const { isTeamOwner, isTeamAdmin, isSuperAdmin } = useAuth()
    return isSuperAdmin || isTeamOwner || isTeamAdmin
}

/**
 * Hook to check if current user can manage users
 */
export function useCanManageUsers(): boolean {
    const { hasPermission, isSuperAdmin } = useAuth()
    return isSuperAdmin || hasPermission('user:role_change')
}

/**
 * Hook to check if current user can edit permissions
 */
export function useCanEditPermissions(): boolean {
    const { hasPermission, isSuperAdmin } = useAuth()
    return isSuperAdmin || hasPermission('user:permission_edit')
}
