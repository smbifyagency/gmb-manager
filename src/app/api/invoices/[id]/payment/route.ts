import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

// Type-safe invoice with payments using Prisma's built-in payload typing
type InvoiceWithPayments = Prisma.InvoiceGetPayload<{
    include: { payments: true }
}>

interface RouteParams {
    params: Promise<{ id: string }>
}

// POST /api/invoices/[id]/payment - Record a payment
export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { amount, method, transactionId, notes } = body

        // Validate amount
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Valid payment amount is required' },
                { status: 400 }
            )
        }
        if (!method) {
            return NextResponse.json(
                { error: 'Payment method is required' },
                { status: 400 }
            )
        }

        // Get invoice with payments
        const invoice: InvoiceWithPayments | null = await prisma.invoice.findUnique({
            where: { id },
            include: { payments: true }
        })

        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            )
        }

        // Check if already fully paid
        if (invoice.status === 'PAID') {
            return NextResponse.json(
                { error: 'Invoice is already fully paid' },
                { status: 400 }
            )
        }

        // Calculate total paid so far (fully typed via InvoiceWithPayments)
        const totalPaid = invoice.payments.reduce((sum, p) => {
            return p.status === 'COMPLETED' ? sum + p.amount : sum
        }, 0)

        const newTotalPaid = totalPaid + amount
        const remaining = invoice.total - newTotalPaid

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                invoiceId: id,
                amount,
                method,
                transactionId: transactionId || null,
                status: 'COMPLETED',
                paidAt: new Date(),
                notes: notes || null
            }
        })

        // Update invoice status
        let newStatus: 'PAID' | 'PARTIAL' = 'PARTIAL'
        if (remaining <= 0) {
            newStatus = 'PAID'
        }

        await prisma.invoice.update({
            where: { id },
            data: {
                status: newStatus,
                paidAmount: newTotalPaid,
                paidAt: newStatus === 'PAID' ? new Date() : null,
                paymentMethod: method
            }
        })

        return NextResponse.json({
            payment,
            invoiceStatus: newStatus,
            totalPaid: newTotalPaid,
            remaining: Math.max(0, remaining)
        }, { status: 201 })
    } catch (error) {
        console.error('Failed to record payment:', error)
        return NextResponse.json(
            { error: 'Failed to record payment' },
            { status: 500 }
        )
    }
}

// GET /api/invoices/[id]/payment - Get payment history
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params

        const payments = await prisma.payment.findMany({
            where: { invoiceId: id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ payments })
    } catch (error) {
        console.error('Failed to fetch payments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        )
    }
}
