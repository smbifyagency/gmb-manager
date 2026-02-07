'use client'

import { use, useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'

interface InvoiceLineItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    total: number
}

interface Payment {
    id: string
    amount: number
    method: string
    paidAt: string
    status: string
}

interface Invoice {
    id: string
    invoiceNumber: string
    status: string
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
    currency: string
    issueDate: string
    dueDate: string
    notes?: string
    client: {
        id: string
        name: string
        businessType: string
    }
    lineItems: InvoiceLineItem[]
    payments: Payment[]
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'DRAFT': return <span className="badge">Draft</span>
        case 'SENT': return <span className="badge badge-primary">Sent</span>
        case 'VIEWED': return <span className="badge badge-info">Viewed</span>
        case 'PAID': return <span className="badge badge-success">Paid</span>
        case 'PARTIAL': return <span className="badge badge-warning">Partial</span>
        case 'OVERDUE': return <span className="badge badge-error">Overdue</span>
        default: return <span className="badge">{status}</span>
    }
}

function formatCurrency(amount: number, currency: string = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { hasPermission } = useAuth()
    const [invoice, setInvoice] = useState<Invoice | null>(null)
    const [loading, setLoading] = useState(true)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentAmount, setPaymentAmount] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('STRIPE')

    const canRecordPayment = hasPermission(PERMISSIONS.PAYMENT_RECORD)
    const canSendInvoice = hasPermission(PERMISSIONS.INVOICE_SEND)
    const [downloading, setDownloading] = useState(false)

    const handleDownloadPDF = async () => {
        if (!invoice) return
        setDownloading(true)
        try {
            const response = await fetch(`/api/invoices/${invoice.id}/pdf`)
            if (!response.ok) throw new Error('Failed to download PDF')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Invoice-${invoice.invoiceNumber}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()
        } catch (error) {
            console.error('Error downloading PDF:', error)
            alert('Failed to download PDF. Please try again.')
        } finally {
            setDownloading(false)
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setInvoice({
                id,
                invoiceNumber: 'INV-2024-001',
                status: 'SENT',
                subtotal: 1400,
                taxRate: 7.5,
                taxAmount: 105,
                total: 1505,
                currency: 'USD',
                issueDate: '2024-03-01',
                dueDate: '2024-03-15',
                notes: 'Thank you for your business!',
                client: {
                    id: '1',
                    name: 'Rank & Rent Portfolio',
                    businessType: 'RANK_RENT'
                },
                lineItems: [
                    { id: '1', description: 'Monthly SEO Services - March 2024', quantity: 1, unitPrice: 1000, total: 1000 },
                    { id: '2', description: 'GBP Optimization - 2 Locations', quantity: 2, unitPrice: 150, total: 300 },
                    { id: '3', description: 'Citation Building Package', quantity: 1, unitPrice: 100, total: 100 }
                ],
                payments: []
            })
            setLoading(false)
        }, 500)
    }, [id])

    const handleRecordPayment = () => {
        if (!paymentAmount) return
        // TODO: API call
        setShowPaymentModal(false)
    }

    if (loading) {
        return (
            <>
                <Header title="Loading..." subtitle="" />
                <div className="page-content" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                    <div style={{ fontSize: '32px' }}>⏳</div>
                </div>
            </>
        )
    }

    if (!invoice) {
        return (
            <>
                <Header title="Invoice Not Found" subtitle="" />
                <div className="page-content">
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-4)' }}>📄</div>
                        <h2>Invoice not found</h2>
                        <Link href="/invoices" className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }}>
                            Back to Invoices
                        </Link>
                    </div>
                </div>
            </>
        )
    }

    const paidAmount = invoice.payments.reduce((sum, p) => p.status === 'COMPLETED' ? sum + p.amount : sum, 0)
    const remaining = invoice.total - paidAmount

    return (
        <>
            <Header
                title={`Invoice ${invoice.invoiceNumber}`}
                subtitle={`${invoice.client.name}`}
                actions={
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                        >
                            {downloading ? '⏳ Generating...' : '📥 Download PDF'}
                        </button>
                        {invoice.status === 'DRAFT' && canSendInvoice && (
                            <button className="btn btn-primary">📤 Send Invoice</button>
                        )}
                        {['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'].includes(invoice.status) && canRecordPayment && (
                            <button
                                className="btn btn-success"
                                onClick={() => setShowPaymentModal(true)}
                            >
                                💳 Record Payment
                            </button>
                        )}
                    </div>
                }
            />

            <div className="page-content">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-6)' }}>
                    {/* Invoice Details */}
                    <div>
                        <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-6)' }}>
                                <div>
                                    <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-2)' }}>
                                        {invoice.invoiceNumber}
                                    </h2>
                                    {getStatusBadge(invoice.status)}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                        {formatCurrency(invoice.total, invoice.currency)}
                                    </div>
                                    {remaining > 0 && remaining < invoice.total && (
                                        <div style={{ color: 'var(--color-warning)', marginTop: 'var(--spacing-1)' }}>
                                            {formatCurrency(remaining)} remaining
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th style={{ textAlign: 'right' }}>Qty</th>
                                            <th style={{ textAlign: 'right' }}>Unit Price</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.lineItems.map(item => (
                                            <tr key={item.id}>
                                                <td>{item.description}</td>
                                                <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: 'right' }}>Subtotal</td>
                                            <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.subtotal)}</td>
                                        </tr>
                                        {invoice.taxRate > 0 && (
                                            <tr>
                                                <td colSpan={3} style={{ textAlign: 'right' }}>Tax ({invoice.taxRate}%)</td>
                                                <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.taxAmount)}</td>
                                            </tr>
                                        )}
                                        <tr style={{ fontWeight: 'var(--font-weight-bold)' }}>
                                            <td colSpan={3} style={{ textAlign: 'right' }}>Total</td>
                                            <td style={{ textAlign: 'right' }}>{formatCurrency(invoice.total)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                            {invoice.notes && (
                                <div style={{
                                    marginTop: 'var(--spacing-6)',
                                    padding: 'var(--spacing-4)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)'
                                }}>
                                    <strong>Notes:</strong> {invoice.notes}
                                </div>
                            )}
                        </div>

                        {/* Payment History */}
                        {invoice.payments.length > 0 && (
                            <div className="card">
                                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>💳 Payment History</h3>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Method</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoice.payments.map(payment => (
                                                <tr key={payment.id}>
                                                    <td>{new Date(payment.paidAt).toLocaleDateString()}</td>
                                                    <td>{payment.method}</td>
                                                    <td>{formatCurrency(payment.amount)}</td>
                                                    <td>
                                                        <span className={`badge ${payment.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="card" style={{ marginBottom: 'var(--spacing-4)' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-3)' }}>📅 Dates</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Issue Date</span>
                                    <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Due Date</span>
                                    <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h4 style={{ marginBottom: 'var(--spacing-3)' }}>🏢 Client</h4>
                            <Link href={`/clients/${invoice.client.id}`} style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                {invoice.client.name}
                            </Link>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-1)' }}>
                                {invoice.client.businessType.replace('_', ' ')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Record Payment Modal */}
            {showPaymentModal && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Record Payment</h3>
                            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Amount</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    placeholder={remaining.toString()}
                                />
                                <small style={{ color: 'var(--color-text-muted)' }}>
                                    Remaining: {formatCurrency(remaining)}
                                </small>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Payment Method</label>
                                <select
                                    className="form-select"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                >
                                    <option value="STRIPE">Stripe</option>
                                    <option value="PAYPAL">PayPal</option>
                                    <option value="BANK_TRANSFER">Bank Transfer</option>
                                    <option value="CHECK">Check</option>
                                    <option value="CASH">Cash</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                            <button className="btn btn-success" onClick={handleRecordPayment}>
                                💳 Record Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
