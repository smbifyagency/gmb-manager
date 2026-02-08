// Workflow Detail & Status Update API
// GET /api/workflows/[id] - Get workflow details
// PATCH /api/workflows/[id] - Update workflow status

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Valid workflow status transitions (matches Prisma WorkflowStatus enum)
// WorkflowStatus: NOT_STARTED, IN_PROGRESS, BLOCKED, COMPLETED, CANCELLED
const VALID_TRANSITIONS: Record<string, string[]> = {
    'NOT_STARTED': ['IN_PROGRESS', 'CANCELLED'],
    'IN_PROGRESS': ['COMPLETED', 'BLOCKED', 'CANCELLED'],
    'BLOCKED': ['IN_PROGRESS', 'CANCELLED'],
    'COMPLETED': ['IN_PROGRESS'], // Allow reopening
    'CANCELLED': ['IN_PROGRESS'], // Allow restarting cancelled workflows
}

// GET /api/workflows/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const workflow = await prisma.workflowInstance.findUnique({
            where: { id },
            include: {
                location: {
                    include: {
                        client: true
                    }
                },
                sopTemplate: true,
                taskInstances: {
                    orderBy: { taskTemplate: { order: 'asc' } },
                    include: {
                        taskTemplate: true,
                        assignedTo: {
                            select: { id: true, name: true, email: true }
                        }
                    }
                }
            }
        })

        if (!workflow) {
            return NextResponse.json(
                { error: 'Workflow not found' },
                { status: 404 }
            )
        }

        // Calculate progress
        const completedTasks = workflow.taskInstances.filter(t => t.status === 'COMPLETED').length
        const totalTasks = workflow.taskInstances.length
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        return NextResponse.json({
            workflow: {
                ...workflow,
                progress,
                completedTasks,
                totalTasks
            }
        })
    } catch (error) {
        console.error('Failed to fetch workflow:', error)
        return NextResponse.json(
            { error: 'Failed to fetch workflow' },
            { status: 500 }
        )
    }
}

// PATCH /api/workflows/[id] - Update workflow
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { action, status, priority } = body

        // Fetch current workflow
        const workflow = await prisma.workflowInstance.findUnique({
            where: { id },
            include: { taskInstances: true }
        })

        if (!workflow) {
            return NextResponse.json(
                { error: 'Workflow not found' },
                { status: 404 }
            )
        }

        const currentStatus = workflow.status
        let newStatus = status
        const updateData: Record<string, unknown> = {}

        // Handle action-based status changes
        if (action) {
            switch (action) {
                case 'start':
                    if (currentStatus !== 'NOT_STARTED' && currentStatus !== 'BLOCKED' && currentStatus !== 'CANCELLED') {
                        return NextResponse.json(
                            { error: `Cannot start workflow in ${currentStatus} status` },
                            { status: 400 }
                        )
                    }
                    newStatus = 'IN_PROGRESS'
                    if (!workflow.startedAt) {
                        updateData.startedAt = new Date()
                    }
                    break

                case 'complete':
                    if (currentStatus !== 'IN_PROGRESS') {
                        return NextResponse.json(
                            { error: `Cannot complete workflow in ${currentStatus} status. Must be IN_PROGRESS.` },
                            { status: 400 }
                        )
                    }
                    // Check if all required tasks are completed
                    const incompleteTasks = workflow.taskInstances.filter(
                        t => t.status !== 'COMPLETED' && t.status !== 'SKIPPED'
                    )
                    if (incompleteTasks.length > 0) {
                        return NextResponse.json(
                            {
                                error: `Cannot complete workflow. ${incompleteTasks.length} task(s) still pending.`,
                                incompleteTasks: incompleteTasks.length
                            },
                            { status: 400 }
                        )
                    }
                    newStatus = 'COMPLETED'
                    updateData.completedAt = new Date()
                    break

                case 'reopen':
                    if (currentStatus !== 'COMPLETED') {
                        return NextResponse.json(
                            { error: `Cannot reopen workflow in ${currentStatus} status. Must be COMPLETED.` },
                            { status: 400 }
                        )
                    }
                    newStatus = 'IN_PROGRESS'
                    updateData.completedAt = null
                    break

                case 'block':
                    if (currentStatus !== 'IN_PROGRESS') {
                        return NextResponse.json(
                            { error: `Cannot block workflow in ${currentStatus} status` },
                            { status: 400 }
                        )
                    }
                    newStatus = 'BLOCKED'
                    break

                case 'cancel':
                    newStatus = 'CANCELLED'
                    break

                default:
                    return NextResponse.json(
                        { error: `Unknown action: ${action}` },
                        { status: 400 }
                    )
            }
        }

        // Validate status transition if direct status update
        if (status && !action) {
            const validTransitions = VALID_TRANSITIONS[currentStatus] || []
            if (!validTransitions.includes(status)) {
                return NextResponse.json(
                    { error: `Invalid status transition from ${currentStatus} to ${status}` },
                    { status: 400 }
                )
            }
            newStatus = status
        }

        // Apply updates
        if (newStatus) updateData.status = newStatus
        if (priority) updateData.priority = priority

        const updatedWorkflow = await prisma.workflowInstance.update({
            where: { id },
            data: updateData,
            include: {
                location: { include: { client: true } },
                sopTemplate: true,
                taskInstances: {
                    orderBy: { taskTemplate: { order: 'asc' } },
                    include: { taskTemplate: true }
                }
            }
        })

        // Calculate progress
        const completedTasks = updatedWorkflow.taskInstances.filter(t => t.status === 'COMPLETED').length
        const totalTasks = updatedWorkflow.taskInstances.length
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

        return NextResponse.json({
            workflow: {
                ...updatedWorkflow,
                progress,
                completedTasks,
                totalTasks
            },
            message: `Workflow ${action || 'updated'} successfully`
        })
    } catch (error) {
        console.error('Failed to update workflow:', error)
        return NextResponse.json(
            { error: 'Failed to update workflow' },
            { status: 500 }
        )
    }
}

// DELETE /api/workflows/[id] - Delete workflow (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // TODO: Add permission check for Admin role

        const workflow = await prisma.workflowInstance.findUnique({
            where: { id }
        })

        if (!workflow) {
            return NextResponse.json(
                { error: 'Workflow not found' },
                { status: 404 }
            )
        }

        // Delete workflow and all associated tasks (cascade)
        await prisma.workflowInstance.delete({
            where: { id }
        })

        return NextResponse.json({
            message: 'Workflow deleted successfully'
        })
    } catch (error) {
        console.error('Failed to delete workflow:', error)
        return NextResponse.json(
            { error: 'Failed to delete workflow' },
            { status: 500 }
        )
    }
}
