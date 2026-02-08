import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { prisma } from '@/lib/db'
import { InvoicePDF, type InvoiceData, type InvoiceLineItemData } from '@/lib/pdf'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderPDF = renderToBuffer as (element: React.ReactElement) => Promise<Buffer>

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Fetch invoice with line items and client
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                lineItems: true,
                client: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                payments: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
        }

        // TODO: Add team-based access control from auth context
        // For now, any authenticated user can download invoices they can access

        // Calculate paid amount from completed payments
        const paidAmount = invoice.payments
            .filter((p: { status: string }) => p.status === 'COMPLETED')
            .reduce((sum: number, p: { amount: number }) => sum + p.amount, 0)

        // Transform to InvoiceData format
        const invoiceData: InvoiceData = {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            status: invoice.status,
            issueDate: invoice.issueDate,
            dueDate: invoice.dueDate,
            subtotal: invoice.subtotal,
            taxRate: invoice.taxRate,
            taxAmount: invoice.taxAmount,
            total: invoice.total,
            currency: invoice.currency,
            notes: invoice.notes || undefined,
            paidAmount: paidAmount > 0 ? paidAmount : undefined,
            client: {
                name: invoice.client.name
            },
            lineItems: invoice.lineItems.map((item: { description: string; quantity: number; unitPrice: number; total: number }): InvoiceLineItemData => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.total
            }))
        }

        // Generate PDF using react-pdf
        const pdfElement = React.createElement(InvoicePDF, { invoice: invoiceData })
        const pdfBuffer = await renderPDF(pdfElement)

        // Generate filename
        const filename = `Invoice-${invoice.invoiceNumber}.pdf`

        // Return PDF as downloadable file
        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdfBuffer.length.toString(),
            }
        })

    } catch (error) {
        console.error('Error generating invoice PDF:', error)
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        )
    }
}
