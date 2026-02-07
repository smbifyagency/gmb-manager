'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'

interface Invoice {
    id: string
    invoiceNumber: string
    status: string
    total: number
    currency: string
    issueDate: string
    dueDate: string
    client: {
        id: string
        name: string
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'DRAFT':
            return <span className="badge" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>Draft</span>
        case 'SENT':
            return <span className="badge badge-primary">Sent</span>
        case 'VIEWED':
            return <span className="badge badge-info">Viewed</span>
        case 'PAID':
            return <span className="badge badge-success">Paid</span>
        case 'PARTIAL':
            return <span className="badge badge-warning">Partial</span>
        case 'OVERDUE':
            return <span className="badge badge-error">Overdue</span>
        case 'CANCELLED':
            return <span className="badge" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>Cancelled</span>
        default:
            return <span className="badge">{status}</span>
    }
}

function formatCurrency(amount: number, currency: string = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount)
}

export default function InvoicesPage() {
    const { hasPermission } = useAuth()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState('all')

    const canCreate = hasPermission(PERMISSIONS.INVOICE_CREATE)

    // Mock data
    useEffect(() => {
        setLoading(true)
        setTimeout(() => {
            const mockInvoices: Invoice[] = [
                {
                    id: '1',
                    invoiceNumber: 'INV-2024-001',
                    status: 'PAID',
                    total: 1500,
                    currency: 'USD',
                    issueDate: '2024-03-01',
                    dueDate: '2024-03-15',
                    client: { id: '1', name: 'Rank & Rent Portfolio' }
                },
                {
                    id: '2',
                    invoiceNumber: 'INV-2024-002',
                    status: 'SENT',
                    total: 800,
                    currency: 'USD',
                    issueDate: '2024-03-10',
                    dueDate: '2024-03-24',
                    client: { id: '2', name: "Joe's Restaurants" }
                },
                {
                    id: '3',
                    invoiceNumber: 'INV-2024-003',
                    status: 'OVERDUE',
                    total: 1200,
                    currency: 'USD',
                    issueDate: '2024-02-15',
                    dueDate: '2024-03-01',
                    client: { id: '4', name: 'Sunrise Dental LLC' }
                },
                {
                    id: '4',
                    invoiceNumber: 'INV-2024-004',
                    status: 'DRAFT',
                    total: 2500,
                    currency: 'USD',
                    issueDate: '2024-03-18',
                    dueDate: '2024-04-01',
                    client: { id: '5', name: 'Miami Services Group' }
                },
                {
                    id: '5',
                    invoiceNumber: 'INV-2024-005',
                    status: 'PARTIAL',
                    total: 3000,
                    currency: 'USD',
                    issueDate: '2024-03-05',
                    dueDate: '2024-03-19',
                    client: { id: '1', name: 'Rank & Rent Portfolio' }
                }
            ]
            setInvoices(mockInvoices)
            setLoading(false)
        }, 500)
    }, [])

    const filteredInvoices = invoices.filter(inv =>
        statusFilter === 'all' || inv.status === statusFilter
    )

    // Calculate stats
    const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0)
    const outstanding = invoices.filter(i => ['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'].includes(i.status)).reduce((sum, i) => sum + i.total, 0)
    const overdue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + i.total, 0)

    return (
        <>
            <Header
                title="Invoices"
                subtitle="Manage client invoices and payments"
                actions={
                    canCreate && (
                        <Link href="/invoices/new" className="btn btn-primary">
                            + Create Invoice
                        </Link>
                    )
                }
            />

            <div className="page-content">
                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon success">💰</div>
                        <div className="stat-value">{formatCurrency(totalRevenue)}</div>
                        <div className="stat-label">Paid Revenue</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon warning">📤</div>
                        <div className="stat-value">{formatCurrency(outstanding)}</div>
                        <div className="stat-label">Outstanding</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon error">⚠️</div>
                        <div className="stat-value">{formatCurrency(overdue)}</div>
                        <div className="stat-label">Overdue</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon primary">📄</div>
                        <div className="stat-value">{invoices.length}</div>
                        <div className="stat-label">Total Invoices</div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-3)',
                    marginBottom: 'var(--spacing-6)',
                    flexWrap: 'wrap'
                }}>
                    {['all', 'DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE'].map(status => (
                        <button
                            key={status}
                            className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                            {status !== 'all' && (
                                <span style={{ marginLeft: 'var(--spacing-2)', opacity: 0.7 }}>
                                    ({invoices.filter(i => i.status === status).length})
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Invoice List */}
                {loading ? (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-4)' }}>⏳</div>
                        <p style={{ color: 'var(--color-text-muted)' }}>Loading invoices...</p>
                    </div>
                ) : filteredInvoices.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-4)' }}>📄</div>
                        <h3 style={{ marginBottom: 'var(--spacing-2)' }}>No Invoices Found</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Create your first invoice to start tracking revenue
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Client</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Issue Date</th>
                                    <th>Due Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map(invoice => {
                                    const isOverdue = new Date(invoice.dueDate) < new Date() &&
                                        !['PAID', 'CANCELLED'].includes(invoice.status)

                                    return (
                                        <tr key={invoice.id}>
                                            <td>
                                                <code style={{
                                                    background: 'var(--color-bg-tertiary)',
                                                    padding: '2px 6px',
                                                    borderRadius: 'var(--radius-sm)'
                                                }}>
                                                    {invoice.invoiceNumber}
                                                </code>
                                            </td>
                                            <td>{invoice.client.name}</td>
                                            <td>
                                                <strong>{formatCurrency(invoice.total, invoice.currency)}</strong>
                                            </td>
                                            <td>{getStatusBadge(invoice.status)}</td>
                                            <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                                            <td style={{ color: isOverdue ? 'var(--color-error)' : 'inherit' }}>
                                                {new Date(invoice.dueDate).toLocaleDateString()}
                                                {isOverdue && ' ⚠️'}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                                    <Link
                                                        href={`/invoices/${invoice.id}`}
                                                        className="btn btn-ghost btn-sm"
                                                    >
                                                        View
                                                    </Link>
                                                    {invoice.status === 'DRAFT' && (
                                                        <button className="btn btn-primary btn-sm">
                                                            Send
                                                        </button>
                                                    )}
                                                    {['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'].includes(invoice.status) && (
                                                        <button className="btn btn-success btn-sm">
                                                            Record Payment
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    )
}
