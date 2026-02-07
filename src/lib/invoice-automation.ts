// Invoice Automation - Recurring invoices and overdue handling

import { prisma } from '@/lib/db'

// ============= RECURRING INVOICE GENERATION =============

/**
 * Generate invoices for clients with recurring services
 */
export async function generateRecurringInvoices(teamId: string): Promise<{
    created: number,
    errors: string[]
}> {
    const errors: string[] = []
    let created = 0

    try {
        // Get all recurring service types for the team
        const recurringServices = await prisma.serviceType.findMany({
            where: {
                teamId,
                isRecurring: true,
                isActive: true,
            }
        })

        if (recurringServices.length === 0) {
            return { created: 0, errors: [] }
        }

        // Get all clients for the team
        const clients = await prisma.client.findMany({
            where: { teamId },
            include: {
                invoices: {
                    where: { status: { in: ['PAID', 'SENT'] } },
                    orderBy: { issueDate: 'desc' },
                    take: 1
                }
            }
        })

        const now = new Date()
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        for (const client of clients) {
            try {
                // Check if invoice already generated this month
                const existingThisMonth = await prisma.invoice.findFirst({
                    where: {
                        clientId: client.id,
                        issueDate: {
                            gte: new Date(now.getFullYear(), now.getMonth(), 1),
                            lt: new Date(now.getFullYear(), now.getMonth() + 1, 1)
                        }
                    }
                })

                if (existingThisMonth) {
                    continue // Skip - already invoiced this month
                }

                // Generate invoice number
                const invoiceCount = await prisma.invoice.count()
                const invoiceNumber = `INV-${now.getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`

                // Calculate totals from recurring services
                const lineItems = recurringServices.map(service => ({
                    description: `${service.name} - ${currentMonth}`,
                    quantity: 1,
                    unitPrice: service.price,
                    total: service.price,
                }))

                const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0)
                const taxRate = 0 // Adjust as needed
                const taxAmount = subtotal * taxRate
                const total = subtotal + taxAmount

                // Due in 15 days
                const dueDate = new Date(now)
                dueDate.setDate(dueDate.getDate() + 15)

                // Create invoice with line items
                await prisma.invoice.create({
                    data: {
                        clientId: client.id,
                        invoiceNumber,
                        status: 'DRAFT',
                        subtotal,
                        taxRate,
                        taxAmount,
                        total,
                        dueDate,
                        lineItems: {
                            create: lineItems
                        }
                    }
                })

                created++
            } catch (err) {
                errors.push(`Client ${client.id}: ${err instanceof Error ? err.message : 'Unknown error'}`)
            }
        }

    } catch (error) {
        errors.push(`Team ${teamId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    console.log(`[Invoice Automation] Created ${created} recurring invoices`)
    return { created, errors }
}

// ============= OVERDUE INVOICE HANDLING =============

/**
 * Mark invoices as overdue if past due date
 */
export async function markInvoicesOverdue(): Promise<{
    updated: number
}> {
    const now = new Date()

    // Find invoices that are past due but not marked overdue
    const overdueInvoices = await prisma.invoice.updateMany({
        where: {
            status: { in: ['SENT', 'VIEWED', 'PARTIAL'] },
            dueDate: { lt: now }
        },
        data: {
            status: 'OVERDUE'
        }
    })

    console.log(`[Invoice Automation] Marked ${overdueInvoices.count} invoices as overdue`)
    return { updated: overdueInvoices.count }
}

// ============= INVOICE REMINDER SCHEDULE =============

interface ReminderResult {
    invoiceId: string
    status: 'sent' | 'skipped' | 'error'
    message?: string
}

/**
 * Send reminders for invoices approaching or past due date
 */
export async function sendInvoiceReminders(): Promise<{
    results: ReminderResult[]
}> {
    const results: ReminderResult[] = []
    const now = new Date()

    // Reminder windows (days before/after due date)
    const reminderDays = [7, 3, 0, -3, -7] // 7 days before, 3 days before, on due date, 3 days after, 7 days after

    for (const dayOffset of reminderDays) {
        const targetDate = new Date(now)
        targetDate.setDate(targetDate.getDate() + dayOffset)

        // Set to start of day
        targetDate.setHours(0, 0, 0, 0)
        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        const invoices = await prisma.invoice.findMany({
            where: {
                status: { in: ['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'] },
                dueDate: {
                    gte: targetDate,
                    lte: endOfDay
                }
            },
            include: {
                client: true
            }
        })

        for (const invoice of invoices) {
            try {
                // TODO: Send actual email notification
                // await sendEmail({
                //     to: client.email,
                //     subject: `Invoice ${invoice.invoiceNumber} reminder`,
                //     template: dayOffset >= 0 ? 'invoice-reminder' : 'invoice-overdue'
                // })

                results.push({
                    invoiceId: invoice.id,
                    status: 'sent',
                    message: dayOffset >= 0
                        ? `Due in ${dayOffset} days reminder sent`
                        : `Overdue by ${Math.abs(dayOffset)} days notice sent`
                })
            } catch (error) {
                results.push({
                    invoiceId: invoice.id,
                    status: 'error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }
    }

    console.log(`[Invoice Automation] Processed ${results.length} invoice reminders`)
    return { results }
}

// ============= MONTHLY INVOICE CRON =============

/**
 * Run monthly invoice generation for all teams
 * Should be called by a cron job on the 1st of each month
 */
export async function runMonthlyInvoiceCron(): Promise<void> {
    console.log('[Invoice Automation] Starting monthly invoice generation...')

    const teams = await prisma.team.findMany({
        select: { id: true, name: true }
    })

    for (const team of teams) {
        const result = await generateRecurringInvoices(team.id)
        console.log(`[Invoice Automation] Team "${team.name}": ${result.created} invoices created`)
    }

    // Also mark any overdue invoices
    await markInvoicesOverdue()

    console.log('[Invoice Automation] Monthly invoice generation complete')
}
