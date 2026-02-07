import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { allSOPTemplates, filterTasksForBusinessType } from '@/lib/sop-templates'

// Define SOP types as string literals (matches Prisma enum)
type SOPType = 'NEW_LOCATION' | 'SUSPENSION_RECOVERY' | 'REBRAND' | 'MAINTENANCE'
type BusinessType = 'TRADITIONAL' | 'RANK_RENT' | 'GMB_ONLY'

// POST /api/workflows - Create a new workflow instance
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { sopTemplateId, locationId, priority = 'MEDIUM' } = body

        // Validate required fields
        if (!sopTemplateId || !locationId) {
            return NextResponse.json(
                { error: 'Missing required fields: sopTemplateId and locationId are required' },
                { status: 400 }
            )
        }

        // Get the location to determine business type
        const location = await prisma.location.findUnique({
            where: { id: locationId },
            include: { client: true }
        })

        if (!location) {
            return NextResponse.json(
                { error: 'Location not found' },
                { status: 404 }
            )
        }

        // Map template ID to SOP type
        const sopTypeMap: Record<string, SOPType> = {
            'new-location': 'NEW_LOCATION',
            'suspension': 'SUSPENSION_RECOVERY',
            'rebrand': 'REBRAND',
            'maintenance': 'MAINTENANCE'
        }

        const sopType = sopTypeMap[sopTemplateId]
        if (!sopType) {
            return NextResponse.json(
                { error: 'Invalid SOP template ID' },
                { status: 400 }
            )
        }

        // Find or create the SOP template in database
        let sopTemplate = await prisma.sOPTemplate.findFirst({
            where: { type: sopType },
            include: { taskTemplates: { orderBy: { order: 'asc' } } }
        })

        // If SOP template doesn't exist in DB, create it from our definitions
        if (!sopTemplate) {
            const templateData = allSOPTemplates.find(t => t.type === sopType)
            if (!templateData) {
                return NextResponse.json(
                    { error: 'SOP template definition not found' },
                    { status: 500 }
                )
            }

            // Create SOP template
            sopTemplate = await prisma.sOPTemplate.create({
                data: {
                    name: templateData.name,
                    description: templateData.description,
                    type: templateData.type as SOPType,
                    applicableBusinessTypes: JSON.stringify(templateData.applicableBusinessTypes),
                    isActive: true,
                    taskTemplates: {
                        create: templateData.tasks.map((task, index) => ({
                            title: task.title,
                            instructions: task.instructions,
                            category: task.category,
                            evidenceType: task.evidenceType,
                            estimatedMinutes: task.estimatedMinutes,
                            isRequired: task.isRequired,
                            requiresOwnerApproval: task.requiresOwnerApproval,
                            applicableBusinessTypes: JSON.stringify(task.applicableBusinessTypes),
                            order: task.order || index + 1,
                            dependsOnTaskIds: JSON.stringify(task.dependsOnTaskIds || [])
                        }))
                    }
                },
                include: { taskTemplates: { orderBy: { order: 'asc' } } }
            })
        }

        // Get business type from client
        const businessType = location.client.businessType as BusinessType

        // Filter tasks based on business type
        const applicableTasks = sopTemplate.taskTemplates.filter(task => {
            const applicable = JSON.parse(task.applicableBusinessTypes) as string[]

            // Check if task is applicable for this business type
            if (!applicable.includes(businessType)) {
                return false
            }

            // For GMB-only, exclude website tasks
            if (businessType === 'GMB_ONLY' && task.category === 'WEBSITE') {
                return false
            }

            // For Rank & Rent, exclude tasks requiring owner approval
            if (businessType === 'RANK_RENT' && task.requiresOwnerApproval) {
                return false
            }

            return true
        })

        // Error if no tasks after filtering
        if (applicableTasks.length === 0) {
            return NextResponse.json(
                { error: 'No applicable tasks for this business type' },
                { status: 400 }
            )
        }

        // Calculate due date (7 days from now for most, 3 days for suspension recovery)
        const daysToAdd = sopType === 'SUSPENSION_RECOVERY' ? 3 : 7
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + daysToAdd)

        // Create workflow instance with tasks
        const workflowInstance = await prisma.workflowInstance.create({
            data: {
                locationId,
                sopTemplateId: sopTemplate.id,
                status: 'IN_PROGRESS',
                priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
                dueDate,
                taskInstances: {
                    create: applicableTasks.map((task, index) => {
                        // Determine if task is blocked based on dependencies
                        const dependencies = JSON.parse(task.dependsOnTaskIds) as number[]
                        const isBlocked = dependencies.length > 0

                        // Calculate individual task due date
                        const taskDueDate = new Date()
                        taskDueDate.setDate(taskDueDate.getDate() + Math.min(index + 1, daysToAdd))

                        return {
                            taskTemplateId: task.id,
                            status: isBlocked ? 'BLOCKED' : 'PENDING',
                            dueDate: taskDueDate
                        }
                    })
                }
            },
            include: {
                location: {
                    include: { client: true }
                },
                sopTemplate: true,
                taskInstances: {
                    include: { taskTemplate: true },
                    orderBy: { taskTemplate: { order: 'asc' } }
                }
            }
        })

        return NextResponse.json({
            success: true,
            workflow: {
                id: workflowInstance.id,
                name: workflowInstance.sopTemplate.name,
                type: workflowInstance.sopTemplate.type,
                location: workflowInstance.location.name,
                client: workflowInstance.location.client.name,
                businessType: workflowInstance.location.client.businessType,
                status: workflowInstance.status,
                priority: workflowInstance.priority,
                totalTasks: workflowInstance.taskInstances.length,
                completedTasks: 0,
                progress: 0,
                startedAt: workflowInstance.startedAt,
                dueDate: workflowInstance.dueDate
            }
        })

    } catch (error) {
        console.error('Error creating workflow:', error)
        return NextResponse.json(
            { error: 'Failed to create workflow' },
            { status: 500 }
        )
    }
}

// GET /api/workflows - Get all workflows
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const locationId = searchParams.get('locationId')

        const where: Record<string, unknown> = {}
        if (status && status !== 'all') {
            where.status = status.toUpperCase()
        }
        if (locationId) {
            where.locationId = locationId
        }

        const workflows = await prisma.workflowInstance.findMany({
            where,
            include: {
                location: {
                    include: { client: true }
                },
                sopTemplate: true,
                taskInstances: true
            },
            orderBy: { startedAt: 'desc' }
        })

        const formattedWorkflows = workflows.map(workflow => {
            const completedTasks = workflow.taskInstances.filter(
                t => t.status === 'COMPLETED'
            ).length
            const progress = workflow.taskInstances.length > 0
                ? Math.round((completedTasks / workflow.taskInstances.length) * 100)
                : 0

            return {
                id: workflow.id,
                name: workflow.sopTemplate.name,
                type: workflow.sopTemplate.type,
                location: workflow.location.name,
                client: workflow.location.client.name,
                businessType: workflow.location.client.businessType,
                status: workflow.status.toLowerCase(),
                priority: workflow.priority,
                totalTasks: workflow.taskInstances.length,
                completedTasks,
                progress,
                startedAt: workflow.startedAt,
                dueDate: workflow.dueDate
            }
        })

        return NextResponse.json({ workflows: formattedWorkflows })

    } catch (error) {
        console.error('Error fetching workflows:', error)
        return NextResponse.json(
            { error: 'Failed to fetch workflows' },
            { status: 500 }
        )
    }
}
