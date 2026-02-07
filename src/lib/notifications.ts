// Notification System - Email and in-app notifications

import { prisma } from '@/lib/db'

// ============= TYPES =============

export interface NotificationPayload {
    userId: string
    type: 'TASK_ASSIGNED' | 'TASK_DUE_SOON' | 'TASK_OVERDUE' | 'TASK_BLOCKED' |
    'APPROVAL_REQUIRED' | 'WORKFLOW_COMPLETED' | 'ESCALATION' | 'SYSTEM'
    title: string
    message: string
    actionUrl?: string
    taskInstanceId?: string
}

// ============= IN-APP NOTIFICATIONS =============

/**
 * Create an in-app notification for a user
 */
export async function createNotification(payload: NotificationPayload): Promise<{ id: string }> {
    const notification = await prisma.notification.create({
        data: {
            userId: payload.userId,
            taskInstanceId: payload.taskInstanceId || null,
            type: payload.type,
            channel: 'IN_APP',
            title: payload.title,
            message: payload.message,
            actionUrl: payload.actionUrl || null,
        }
    })

    return { id: notification.id }
}

/**
 * Send multiple notifications at once
 */
export async function createBulkNotifications(payloads: NotificationPayload[]): Promise<{ count: number }> {
    const result = await prisma.notification.createMany({
        data: payloads.map(p => ({
            userId: p.userId,
            taskInstanceId: p.taskInstanceId || null,
            type: p.type,
            channel: 'IN_APP',
            title: p.title,
            message: p.message,
            actionUrl: p.actionUrl || null,
        }))
    })

    return { count: result.count }
}

// ============= INVOICE NOTIFICATIONS =============

/**
 * Send invoice reminder notification
 */
export async function sendInvoiceReminder(invoiceId: string): Promise<{ sent: boolean, error?: string }> {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                client: {
                    include: {
                        assignedUsers: {
                            include: { user: true }
                        }
                    }
                }
            }
        })

        if (!invoice) {
            return { sent: false, error: 'Invoice not found' }
        }

        const daysUntilDue = Math.ceil(
            (invoice.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )

        const title = daysUntilDue >= 0
            ? `Invoice ${invoice.invoiceNumber} due in ${daysUntilDue} days`
            : `Invoice ${invoice.invoiceNumber} is ${Math.abs(daysUntilDue)} days overdue`

        const message = `Amount due: $${invoice.total.toFixed(2)}`

        // Notify all users assigned to this client
        for (const assignment of invoice.client.assignedUsers) {
            await createNotification({
                userId: assignment.user.id,
                type: daysUntilDue >= 0 ? 'SYSTEM' : 'ESCALATION',
                title,
                message,
                actionUrl: `/invoices/${invoice.id}`,
            })
        }

        // TODO: Send email notification
        // await sendEmail({ ... })

        return { sent: true }
    } catch (error) {
        console.error('[Notifications] Failed to send invoice reminder:', error)
        return { sent: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Send overdue invoice notice
 */
export async function sendOverdueNotice(invoiceId: string): Promise<{ sent: boolean }> {
    return sendInvoiceReminder(invoiceId) // Same logic, different context
}

// ============= TASK NOTIFICATIONS =============

/**
 * Notify user of task assignment
 */
export async function notifyTaskAssigned(taskInstanceId: string, assignedToId: string): Promise<void> {
    const task = await prisma.taskInstance.findUnique({
        where: { id: taskInstanceId },
        include: {
            taskTemplate: true,
            workflowInstance: {
                include: { location: true }
            }
        }
    })

    if (!task) return

    await createNotification({
        userId: assignedToId,
        type: 'TASK_ASSIGNED',
        title: `New task assigned: ${task.taskTemplate.title}`,
        message: `For ${task.workflowInstance.location.name}`,
        actionUrl: `/tasks/${taskInstanceId}`,
        taskInstanceId,
    })
}

/**
 * Notify relevant users of task completion requiring approval
 */
export async function notifyApprovalRequired(taskInstanceId: string): Promise<void> {
    const task = await prisma.taskInstance.findUnique({
        where: { id: taskInstanceId },
        include: {
            taskTemplate: true,
            workflowInstance: {
                include: {
                    location: {
                        include: {
                            client: {
                                include: {
                                    team: {
                                        include: {
                                            members: {
                                                where: { role: { in: ['OWNER', 'ADMIN'] } },
                                                include: { user: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!task) return

    // Notify team owners and admins
    const admins = task.workflowInstance.location.client.team.members
    for (const member of admins) {
        await createNotification({
            userId: member.user.id,
            type: 'APPROVAL_REQUIRED',
            title: `Approval needed: ${task.taskTemplate.title}`,
            message: `Task awaiting your approval`,
            actionUrl: `/tasks/${taskInstanceId}`,
            taskInstanceId,
        })
    }
}

// ============= WORKFLOW NOTIFICATIONS =============

/**
 * Notify client when workflow is complete
 */
export async function notifyWorkflowComplete(workflowId: string): Promise<void> {
    const workflow = await prisma.workflowInstance.findUnique({
        where: { id: workflowId },
        include: {
            sopTemplate: true,
            location: {
                include: {
                    client: {
                        include: {
                            assignedUsers: {
                                include: { user: true }
                            }
                        }
                    }
                }
            }
        }
    })

    if (!workflow) return

    // Notify all client users
    for (const assignment of workflow.location.client.assignedUsers) {
        await createNotification({
            userId: assignment.user.id,
            type: 'WORKFLOW_COMPLETED',
            title: `Workflow completed: ${workflow.sopTemplate.name}`,
            message: `For ${workflow.location.name}`,
            actionUrl: `/workflows/${workflowId}`,
        })
    }
}

// ============= DUE DATE CHECK CRON =============

/**
 * Check for tasks due soon and send reminders
 * Should run daily
 */
export async function checkDueDates(): Promise<{ reminders: number }> {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find tasks due within 24 hours
    const dueSoonTasks = await prisma.taskInstance.findMany({
        where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            dueDate: {
                gte: today,
                lte: tomorrow
            },
            assignedToId: { not: null }
        },
        include: { taskTemplate: true }
    })

    let reminders = 0
    for (const task of dueSoonTasks) {
        if (task.assignedToId) {
            await createNotification({
                userId: task.assignedToId,
                type: 'TASK_DUE_SOON',
                title: `Task due soon: ${task.taskTemplate.title}`,
                message: `Due: ${task.dueDate?.toLocaleDateString()}`,
                actionUrl: `/tasks/${task.id}`,
                taskInstanceId: task.id,
            })
            reminders++
        }
    }

    // Find overdue tasks
    const overdueTasks = await prisma.taskInstance.findMany({
        where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            dueDate: { lt: today },
            assignedToId: { not: null }
        },
        include: { taskTemplate: true }
    })

    for (const task of overdueTasks) {
        if (task.assignedToId) {
            await createNotification({
                userId: task.assignedToId,
                type: 'TASK_OVERDUE',
                title: `Task overdue: ${task.taskTemplate.title}`,
                message: `Was due: ${task.dueDate?.toLocaleDateString()}`,
                actionUrl: `/tasks/${task.id}`,
                taskInstanceId: task.id,
            })
            reminders++
        }
    }

    console.log(`[Notifications] Sent ${reminders} due date reminders`)
    return { reminders }
}
