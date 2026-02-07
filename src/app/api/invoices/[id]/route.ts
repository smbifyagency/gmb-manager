import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/invoices/[id] - Get invoice details
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params

        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        businessType: true
                    }
                },
                lineItems: true,
                payments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ invoice })
    } catch (error) {
        console.error('Failed to fetch invoice:', error)
        return NextResponse.json(
            { error: 'Failed to fetch invoice' },
            { status: 500 }
        )
    }
}

// PATCH /api/invoices/[id] - Update invoice
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, notes, dueDate, lineItems } = body

        // Check if invoice exists
        const existing = await prisma.invoice.findUnique({
            where: { id }
        })

        if (!existing) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            )
        }

        // Cannot edit paid or cancelled invoices
        if (existing.status === 'PAID' || existing.status === 'CANCELLED') {
            return NextResponse.json(
                { error: 'Cannot modify a paid or cancelled invoice' },
                { status: 400 }
            )
        }

        // Build update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {}

        if (status) updateData.status = status
        if (notes !== undefined) updateData.notes = notes
        if (dueDate) updateData.dueDate = new Date(dueDate)

        // If updating line items, recalculate totals
        if (lineItems && Array.isArray(lineItems)) {
            // Delete existing line items
            await prisma.invoiceLineItem.deleteMany({
                where: { invoiceId: id }
            })

            // Calculate new totals
            const subtotal = lineItems.reduce((sum: number, item: { quantity?: number, unitPrice: number }) => {
                return sum + ((item.quantity || 1) * item.unitPrice)
            }, 0)
            const taxAmount = subtotal * (existing.taxRate / 100)
            const total = subtotal + taxAmount

            updateData.subtotal = subtotal
            updateData.taxAmount = taxAmount
            updateData.total = total

            // Create new line items
            await prisma.invoiceLineItem.createMany({
                data: lineItems.map((item: { description: string, quantity?: number, unitPrice: number, serviceId?: string }) => ({
                    invoiceId: id,
                    description: item.description,
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice,
                    total: (item.quantity || 1) * item.unitPrice,
                    serviceId: item.serviceId || null
                }))
            })
        }

        const invoice = await prisma.invoice.update({
            where: { id },
            data: updateData,
            include: {
                client: { select: { id: true, name: true } },
                lineItems: true,
                payments: true
            }
        })

        return NextResponse.json({ invoice })
    } catch (error) {
        console.error('Failed to update invoice:', error)
        return NextResponse.json(
            { error: 'Failed to update invoice' },
            { status: 500 }
        )
    }
}

// DELETE /api/invoices/[id] - Delete invoice
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params

        // Check if invoice exists and is deletable
        const existing = await prisma.invoice.findUnique({
            where: { id },
            include: { payments: true }
        })

        if (!existing) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            )
        }

        // Cannot delete invoices with payments
        if (existing.payments.length > 0) {
            return NextResponse.json(
                { error: 'Cannot delete an invoice with recorded payments' },
                { status: 400 }
            )
        }

        await prisma.invoice.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete invoice:', error)
        return NextResponse.json(
            { error: 'Failed to delete invoice' },
            { status: 500 }
        )
    }
}
