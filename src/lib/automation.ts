// Automation System - Workflow Triggers and Report Generation
// Provides functions to trigger reports on workflow completion

import { prisma } from '@/lib/db'

// ============= WORKFLOW COMPLETION TRIGGERS =============

/**
 * Called when a workflow is marked as complete
 * Generates a WORKFLOW_COMPLETION report for the client
 */
export async function onWorkflowComplete(workflowId: string): Promise<{ reportId: string | null, error?: string }> {
    try {
        // Get workflow details
        const workflow = await prisma.workflowInstance.findUnique({
            where: { id: workflowId },
            include: {
                location: {
                    include: { client: true }
                },
                sopTemplate: true,
                taskInstances: {
                    include: { taskTemplate: true }
                }
            }
        })

        if (!workflow) {
            return { reportId: null, error: 'Workflow not found' }
        }

        if (workflow.status !== 'COMPLETED') {
            return { reportId: null, error: 'Workflow is not completed' }
        }

        // Calculate workflow metrics
        const completedTasks = workflow.taskInstances.filter(t => t.status === 'COMPLETED')
        const totalTime = completedTasks.reduce((acc, task) => {
            if (task.startedAt && task.completedAt) {
                return acc + (task.completedAt.getTime() - task.startedAt.getTime())
            }
            return acc
        }, 0)

        // Build report data
        const reportData = {
            workflowId: workflow.id,
            sopName: workflow.sopTemplate.name,
            locationName: workflow.location.name,
            completedAt: workflow.completedAt?.toISOString() || new Date().toISOString(),
            totalTasks: workflow.taskInstances.length,
            completedTasks: completedTasks.length,
            skippedTasks: workflow.taskInstances.filter(t => t.status === 'SKIPPED').length,
            totalTimeMs: totalTime,
            taskBreakdown: workflow.taskInstances.map(t => ({
                title: t.taskTemplate.title,
                category: t.taskTemplate.category,
                status: t.status,
                completedAt: t.completedAt?.toISOString(),
            }))
        }

        // Generate the period string (e.g., "2024-W05")
        const now = new Date()
        const weekNumber = Math.ceil((((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7)
        const period = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`

        // Create report record
        const report = await prisma.report.create({
            data: {
                clientId: workflow.location.client.id,
                locationId: workflow.location.id,
                type: 'WORKFLOW_COMPLETION',
                period,
                status: 'READY',
                dataJson: JSON.stringify(reportData)
            }
        })

        console.log(`[Automation] Generated workflow completion report ${report.id} for workflow ${workflowId}`)
        return { reportId: report.id }
    } catch (error) {
        console.error('[Automation] Failed to generate workflow completion report:', error)
        return { reportId: null, error: 'Failed to generate report' }
    }
}

// ============= MONTHLY REPORT GENERATION =============

/**
 * Generate monthly SEO reports for all active clients in a team
 */
export async function generateMonthlyReports(teamId: string): Promise<{
    generated: number,
    failed: number,
    errors: string[]
}> {
    const errors: string[] = []
    let generated = 0
    let failed = 0

    try {
        // Get all clients for the team
        const clients = await prisma.client.findMany({
            where: { teamId },
            include: {
                locations: true,
                invoices: { where: { status: { in: ['SENT', 'PAID'] } }, take: 1 }
            }
        })

        const now = new Date()
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        for (const client of clients) {
            try {
                // Check if report already exists
                const existing = await prisma.report.findFirst({
                    where: {
                        clientId: client.id,
                        type: 'MONTHLY_SEO',
                        period
                    }
                })

                if (existing) {
                    continue // Skip if already exists
                }

                // Get workflow data for the month
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

                const workflows = await prisma.workflowInstance.findMany({
                    where: {
                        location: { clientId: client.id },
                        completedAt: {
                            gte: startOfMonth,
                            lte: endOfMonth
                        }
                    },
                    include: { taskInstances: true }
                })

                // Compile report metrics
                const reportData = {
                    clientName: client.name,
                    period,
                    generatedAt: now.toISOString(),
                    metrics: {
                        workflowsCompleted: workflows.length,
                        tasksCompleted: workflows.reduce((acc, w) =>
                            acc + w.taskInstances.filter(t => t.status === 'COMPLETED').length, 0
                        ),
                        locationsManaged: client.locations.length,
                    },
                    // Placeholder for GBP metrics (would be fetched from API)
                    gbpStats: {
                        views: 0,
                        clicks: 0,
                        calls: 0,
                        directions: 0,
                    }
                }

                await prisma.report.create({
                    data: {
                        clientId: client.id,
                        type: 'MONTHLY_SEO',
                        period,
                        status: 'READY',
                        dataJson: JSON.stringify(reportData)
                    }
                })

                generated++
            } catch (err) {
                failed++
                errors.push(`Client ${client.id}: ${err instanceof Error ? err.message : 'Unknown error'}`)
            }
        }
    } catch (error) {
        errors.push(`Team ${teamId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    console.log(`[Automation] Monthly reports: ${generated} generated, ${failed} failed`)
    return { generated, failed, errors }
}

// ============= SCHEDULED REPORT CRON =============

/**
 * Run monthly report generation for all teams
 * Should be called by a cron job on the 1st of each month
 */
export async function runMonthlyReportCron(): Promise<void> {
    console.log('[Automation] Starting monthly report generation...')

    const teams = await prisma.team.findMany({
        select: { id: true, name: true }
    })

    for (const team of teams) {
        const result = await generateMonthlyReports(team.id)
        console.log(`[Automation] Team "${team.name}": ${result.generated} reports generated`)
    }

    console.log('[Automation] Monthly report generation complete')
}
