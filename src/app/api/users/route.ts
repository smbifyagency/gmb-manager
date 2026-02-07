// User Management API
// GET /api/users - List team users
// POST /api/users - Create new user

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/permissions'
import bcrypt from 'bcryptjs'

// GET /api/users - List users for a team
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const teamId = searchParams.get('teamId')

        if (!teamId) {
            return NextResponse.json(
                { error: 'teamId is required' },
                { status: 400 }
            )
        }

        // Get team members with user details
        const teamMembers = await prisma.teamMember.findMany({
            where: { teamId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        systemRole: true,
                        customPermissions: true,
                        useCustomPermissions: true,
                        avatarUrl: true,
                        createdAt: true,
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        // Transform response with computed permissions
        const users = teamMembers.map(member => {
            let permissions: string[] = []

            if (member.user.useCustomPermissions) {
                try {
                    permissions = JSON.parse(member.user.customPermissions || '[]')
                } catch {
                    permissions = []
                }
            } else {
                permissions = ROLE_PERMISSIONS[member.role as keyof typeof ROLE_PERMISSIONS] || []
            }

            return {
                id: member.user.id,
                email: member.user.email,
                name: member.user.name,
                systemRole: member.user.systemRole,
                teamRole: member.role,
                avatarUrl: member.user.avatarUrl,
                createdAt: member.user.createdAt,
                memberSince: member.createdAt,
                useCustomPermissions: member.user.useCustomPermissions,
                permissions,
                permissionCount: permissions.length,
            }
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Failed to fetch users:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            email,
            password,
            name,
            teamId,
            teamRole = 'MEMBER',
            systemRole = 'USER',
            customPermissions = [],
            useCustomPermissions = false,
        } = body

        // Validation
        if (!email || !password || !name || !teamId) {
            return NextResponse.json(
                { error: 'email, password, name, and teamId are required' },
                { status: 400 }
            )
        }

        // Check if email already exists
        const existing = await prisma.user.findUnique({
            where: { email }
        })
        if (existing) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 409 }
            )
        }

        // Verify team exists
        const team = await prisma.team.findUnique({
            where: { id: teamId }
        })
        if (!team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            )
        }

        // Validate teamRole
        const validRoles = ['OWNER', 'ADMIN', 'MEMBER']
        if (!validRoles.includes(teamRole)) {
            return NextResponse.json(
                { error: 'Invalid team role' },
                { status: 400 }
            )
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12)

        // Create user and team membership in transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    systemRole,
                    customPermissions: JSON.stringify(customPermissions),
                    useCustomPermissions,
                }
            })

            const membership = await tx.teamMember.create({
                data: {
                    userId: user.id,
                    teamId,
                    role: teamRole,
                }
            })

            return { user, membership }
        })

        // Compute effective permissions
        let permissions: string[] = []
        if (useCustomPermissions) {
            permissions = customPermissions
        } else {
            permissions = ROLE_PERMISSIONS[teamRole as keyof typeof ROLE_PERMISSIONS] || []
        }

        return NextResponse.json({
            user: {
                id: result.user.id,
                email: result.user.email,
                name: result.user.name,
                systemRole: result.user.systemRole,
                teamRole,
                teamId,
                useCustomPermissions,
                permissions,
            }
        }, { status: 201 })
    } catch (error) {
        console.error('Failed to create user:', error)
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        )
    }
}
