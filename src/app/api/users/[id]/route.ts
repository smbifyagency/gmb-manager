// User Detail API
// GET /api/users/[id] - Get user details
// PATCH /api/users/[id] - Update user (role changes require Admin)
// DELETE /api/users/[id] - Delete user (Admin only)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ROLE_PERMISSIONS } from '@/lib/permissions'

// GET /api/users/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                systemRole: true,
                customPermissions: true,
                useCustomPermissions: true,
                avatarUrl: true,
                createdAt: true,
                updatedAt: true,
                teamMemberships: {
                    include: {
                        team: {
                            select: { id: true, name: true, slug: true }
                        }
                    }
                },
                clientAssignments: {
                    include: {
                        client: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Parse custom permissions
        let customPermissions: string[] = []
        try {
            customPermissions = JSON.parse(user.customPermissions || '[]')
        } catch {
            customPermissions = []
        }

        // Get effective permissions from highest role
        let effectivePermissions: string[] = []
        if (user.useCustomPermissions) {
            effectivePermissions = customPermissions
        } else {
            const roleHierarchy = ['SUPER_ADMIN', 'ADMIN', 'TEAM']
            for (const role of roleHierarchy) {
                if (user.teamMemberships.some(m => m.role === role)) {
                    effectivePermissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || []
                    break
                }
            }
        }

        return NextResponse.json({
            user: {
                ...user,
                customPermissions,
                effectivePermissions,
            }
        })
    } catch (error) {
        console.error('Failed to fetch user:', error)
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        )
    }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const {
            name,
            teamRole,
            teamId,
            customPermissions,
            useCustomPermissions,
        } = body

        // TODO: Add permission check - only Admin can change roles
        // const actorId = getSessionUserId(request)
        // const actor = await getUserContext(actorId)
        // if (!canChangeUserRole(actor, id, teamId)) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        // }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id }
        })
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Update user basic info
        const updates: Record<string, unknown> = {}
        if (name !== undefined) updates.name = name
        if (customPermissions !== undefined) {
            updates.customPermissions = JSON.stringify(customPermissions)
        }
        if (useCustomPermissions !== undefined) {
            updates.useCustomPermissions = useCustomPermissions
        }

        // Update user if there are changes
        let updatedUser = user
        if (Object.keys(updates).length > 0) {
            updatedUser = await prisma.user.update({
                where: { id },
                data: updates
            })
        }

        // Update team role if provided
        if (teamRole && teamId) {
            await prisma.teamMember.updateMany({
                where: { userId: id, teamId },
                data: { role: teamRole }
            })
        }

        return NextResponse.json({
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                message: 'User updated successfully'
            }
        })
    } catch (error) {
        console.error('Failed to update user:', error)
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        )
    }
}

// DELETE /api/users/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // TODO: Add permission check - only Admin can delete users
        // const actorId = getSessionUserId(request)
        // const actor = await getUserContext(actorId)
        // if (!isTeamAdmin(actor)) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        // }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id }
        })
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            )
        }

        // Delete user (cascades to team memberships, client assignments)
        await prisma.user.delete({
            where: { id }
        })

        return NextResponse.json({
            message: 'User deleted successfully'
        })
    } catch (error) {
        console.error('Failed to delete user:', error)
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}
