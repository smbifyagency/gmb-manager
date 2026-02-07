import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Generate unique invoice number
function generateInvoiceNumber(): string {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `INV-${year}-${random}`
}

// GET /api/invoices - List invoices with filtering
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const clientId = searchParams.get('clientId')
        const status = searchParams.get('status')
        const overdueOnly = searchParams.get('overdue') === 'true'
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {}

        if (clientId) where.clientId = clientId
        if (status) where.status = status
        if (overdueOnly) {
            where.dueDate = { lt: new Date() }
            where.status = { notIn: ['PAID', 'CANCELLED'] }
        }

        // TODO: Add team-based filtering from auth context
        // where.client = { teamId: currentTeam.id }

        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                include: {
                    client: {
                        select: { id: true, name: true }
                    },
                    lineItems: true,
                    payments: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                },
                orderBy: { issueDate: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.invoice.count({ where })
        ])

        // Calculate summary stats
        const stats = await prisma.invoice.groupBy({
            by: ['status'],
            _sum: { total: true },
            _count: true
        })

        return NextResponse.json({
            invoices,
            stats,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + invoices.length < total
            }
        })
    } catch (error) {
        console.error('Failed to fetch invoices:', error)
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        )
    }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            clientId,
            lineItems,
            dueDate,
            notes,
            taxRate = 0,
            currency = 'USD'
        } = body

        // Validate required fields
        if (!clientId) {
            return NextResponse.json(
                { error: 'clientId is required' },
                { status: 400 }
            )
        }
        if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
            return NextResponse.json(
                { error: 'At least one line item is required' },
                { status: 400 }
            )
        }
        if (!dueDate) {
            return NextResponse.json(
                { error: 'dueDate is required' },
                { status: 400 }
            )
        }

        // Verify client exists
        const client = await prisma.client.findUnique({
            where: { id: clientId }
        })

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            )
        }

        // Calculate totals
        const subtotal = lineItems.reduce((sum: number, item: { quantity?: number, unitPrice: number }) => {
            return sum + ((item.quantity || 1) * item.unitPrice)
        }, 0)
        const taxAmount = subtotal * (taxRate / 100)
        const total = subtotal + taxAmount

        // Generate unique invoice number
        let invoiceNumber = generateInvoiceNumber()

        // Ensure uniqueness (retry if collision)
        let attempts = 0
        while (attempts < 5) {
            const existing = await prisma.invoice.findUnique({
                where: { invoiceNumber }
            })
            if (!existing) break
            invoiceNumber = generateInvoiceNumber()
            attempts++
        }

        // Create the invoice with line items
        const invoice = await prisma.invoice.create({
            data: {
                clientId,
                invoiceNumber,
                status: 'DRAFT',
                subtotal,
                taxRate,
                taxAmount,
                total,
                currency,
                dueDate: new Date(dueDate),
                notes: notes || null,
                lineItems: {
                    create: lineItems.map((item: { description: string, quantity?: number, unitPrice: number, serviceId?: string }) => ({
                        description: item.description,
                        quantity: item.quantity || 1,
                        unitPrice: item.unitPrice,
                        total: (item.quantity || 1) * item.unitPrice,
                        serviceId: item.serviceId || null
                    }))
                }
            },
            include: {
                client: { select: { id: true, name: true } },
                lineItems: true
            }
        })

        return NextResponse.json({ invoice }, { status: 201 })
    } catch (error) {
        console.error('Failed to create invoice:', error)
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        )
    }
}
