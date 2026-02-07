'use client'

import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import {
    Permission,
    ROLE_PERMISSIONS,
    SYSTEM_ROLE_PERMISSIONS,
    TeamRole
} from '@/lib/permissions'

// ============= TYPES =============

export type SystemRole = 'SUPER_ADMIN' | 'USER' | 'CLIENT'

export interface User {
    id: string
    email: string
    name: string
    systemRole: SystemRole
    avatarUrl?: string
}

export interface Team {
    id: string
    name: string
    slug: string
}

export interface TeamMembership {
    team: Team
    role: TeamRole
}

export interface ClientAssignment {
    clientId: string
    clientName: string
    role: string
}

export interface AuthState {
    user: User | null
    teams: TeamMembership[]
    currentTeam: TeamMembership | null
    assignedClients: ClientAssignment[]
    isLoading: boolean
    isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
    // Team switching
    switchTeam: (teamId: string) => void

    // Permission checks
    hasPermission: (permission: Permission) => boolean
    hasAnyPermission: (permissions: Permission[]) => boolean
    hasAllPermissions: (permissions: Permission[]) => boolean

    // Role checks
    isSuperAdmin: boolean
    isTeamOwner: boolean
    isTeamAdmin: boolean
    isTeamMember: boolean
    isClient: boolean

    // Current context
    currentTeamId: string | null
    currentTeamRole: TeamRole | null
    permissions: Permission[]

    // Auth actions (placeholders for real auth)
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    refreshAuth: () => Promise<void>
}

// ============= DEFAULT STATE =============

const defaultAuthState: AuthState = {
    user: null,
    teams: [],
    currentTeam: null,
    assignedClients: [],
    isLoading: false,
    isAuthenticated: false,
}

// ============= MOCK DATA (for development) =============

const mockUser: User = {
    id: 'user-1',
    email: 'admin@agency.com',
    name: 'Agency Owner',
    systemRole: 'USER',
    avatarUrl: undefined,
}

const mockTeams: TeamMembership[] = [
    {
        team: { id: 'team-1', name: 'My SEO Agency', slug: 'my-seo-agency' },
        role: 'OWNER'
    },
    {
        team: { id: 'team-2', name: 'Partner Agency', slug: 'partner-agency' },
        role: 'ADMIN'
    }
]

const mockClients: ClientAssignment[] = [
    { clientId: 'client-1', clientName: 'Miami Plumbers', role: 'manager' },
    { clientId: 'client-2', clientName: 'Downtown Auto', role: 'assigned' },
    { clientId: 'client-3', clientName: "Joe's Pizza", role: 'assigned' },
]

// ============= CONTEXT =============

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============= PROVIDER =============

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    // State
    const [user, setUser] = useState<User | null>(mockUser)
    const [teams, setTeams] = useState<TeamMembership[]>(mockTeams)
    const [currentTeam, setCurrentTeam] = useState<TeamMembership | null>(mockTeams[0] || null)
    const [assignedClients, setAssignedClients] = useState<ClientAssignment[]>(mockClients)
    const [isLoading, setIsLoading] = useState(false)

    // Computed values
    const isAuthenticated = user !== null
    const isSuperAdmin = user?.systemRole === 'SUPER_ADMIN'
    const isClient = user?.systemRole === 'CLIENT'
    const currentTeamId = currentTeam?.team.id || null
    const currentTeamRole = currentTeam?.role || null

    const isTeamOwner = currentTeamRole === 'OWNER'
    const isTeamAdmin = currentTeamRole === 'ADMIN'
    const isTeamMember = currentTeamRole === 'MEMBER'

    // Get permissions based on current context
    const permissions = useMemo<Permission[]>(() => {
        if (isSuperAdmin) {
            // Super admin has all permissions
            return Object.values(ROLE_PERMISSIONS).flat()
        }

        if (isClient) {
            return SYSTEM_ROLE_PERMISSIONS.CLIENT || []
        }

        if (currentTeamRole) {
            return ROLE_PERMISSIONS[currentTeamRole] || []
        }

        return []
    }, [isSuperAdmin, isClient, currentTeamRole])

    // Permission check functions
    const hasPermission = useCallback((permission: Permission): boolean => {
        if (isSuperAdmin) return true
        return permissions.includes(permission)
    }, [isSuperAdmin, permissions])

    const hasAnyPermission = useCallback((perms: Permission[]): boolean => {
        if (isSuperAdmin) return true
        return perms.some(p => permissions.includes(p))
    }, [isSuperAdmin, permissions])

    const hasAllPermissions = useCallback((perms: Permission[]): boolean => {
        if (isSuperAdmin) return true
        return perms.every(p => permissions.includes(p))
    }, [isSuperAdmin, permissions])

    // Team switching
    const switchTeam = useCallback((teamId: string) => {
        const team = teams.find(t => t.team.id === teamId)
        if (team) {
            setCurrentTeam(team)
            // In real app, would also fetch clients for this team
            console.log(`Switched to team: ${team.team.name}`)
        }
    }, [teams])

    // Auth actions (mock implementations)
    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true)
        try {
            // Mock login - replace with real API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            setUser(mockUser)
            setTeams(mockTeams)
            setCurrentTeam(mockTeams[0] || null)
            setAssignedClients(mockClients)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const logout = useCallback(() => {
        setUser(null)
        setTeams([])
        setCurrentTeam(null)
        setAssignedClients([])
    }, [])

    const refreshAuth = useCallback(async () => {
        setIsLoading(true)
        try {
            // Mock refresh - replace with real API call
            await new Promise(resolve => setTimeout(resolve, 500))
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Context value
    const value: AuthContextType = {
        // State
        user,
        teams,
        currentTeam,
        assignedClients,
        isLoading,
        isAuthenticated,

        // Team switching
        switchTeam,

        // Permission checks
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,

        // Role checks
        isSuperAdmin,
        isTeamOwner,
        isTeamAdmin,
        isTeamMember,
        isClient,

        // Current context
        currentTeamId,
        currentTeamRole,
        permissions,

        // Auth actions
        login,
        logout,
        refreshAuth,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// ============= HOOK =============

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// ============= UTILITY HOOKS =============

/**
 * Hook to check a single permission
 */
export function usePermission(permission: Permission): boolean {
    const { hasPermission } = useAuth()
    return hasPermission(permission)
}

/**
 * Hook to get current team context
 */
export function useCurrentTeam() {
    const { currentTeam, currentTeamId, currentTeamRole } = useAuth()
    return { currentTeam, currentTeamId, currentTeamRole }
}

/**
 * Hook to check if user can access a specific client
 */
export function useCanAccessClient(clientId: string): boolean {
    const { assignedClients, isTeamOwner, isTeamAdmin, isSuperAdmin } = useAuth()

    if (isSuperAdmin || isTeamOwner || isTeamAdmin) {
        return true
    }

    return assignedClients.some(c => c.clientId === clientId)
}
