'use client'

import { use, useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'

// Types
interface Location {
    id: string
    name: string
    address: string
    gbpStatus: string
}

interface Report {
    id: string
    type: string
    period: string
    status: string
    createdAt: string
}

interface Invoice {
    id: string
    invoiceNumber: string
    status: string
    total: number
    currency: string
    dueDate: string
    issueDate: string
}

interface Client {
    id: string
    name: string
    businessType: string
    notes: string
    locationsCount: number
    activeWorkflows: number
    completionRate: number
    createdAt: string
    locations: Location[]
    reports: Report[]
    invoices: Invoice[]
}

// Mock client data - would come from API
const mockClients: Record<string, Client> = {
    '1': {
        id: '1',
        name: 'Rank & Rent Portfolio',
        businessType: 'RANK_RENT',
        notes: 'Main portfolio of lead generation sites',
        locationsCount: 12,
        activeWorkflows: 5,
        completionRate: 78,
        createdAt: '2024-01-15',
        locations: [
            { id: '1', name: 'Tampa Bay Plumbers', address: 'Tampa, FL', gbpStatus: 'VERIFIED' },
            { id: '2', name: 'Miami Roofing Masters', address: 'Miami, FL', gbpStatus: 'SUSPENDED' },
            { id: '5', name: 'Orlando Electricians', address: 'Orlando, FL', gbpStatus: 'VERIFIED' },
        ],
        reports: [
            { id: 'r1', type: 'MONTHLY_SEO', period: '2024-03', status: 'READY', createdAt: '2024-03-01' },
            { id: 'r2', type: 'MONTHLY_SEO', period: '2024-02', status: 'READY', createdAt: '2024-02-01' },
            { id: 'r3', type: 'GBP_PERFORMANCE', period: '2024-03', status: 'READY', createdAt: '2024-03-15' },
        ],
        invoices: [
            { id: 'inv1', invoiceNumber: 'INV-2024-001', status: 'PAID', total: 1505, currency: 'USD', dueDate: '2024-03-15', issueDate: '2024-03-01' },
            { id: 'inv2', invoiceNumber: 'INV-2024-002', status: 'SENT', total: 1505, currency: 'USD', dueDate: '2024-04-15', issueDate: '2024-04-01' },
        ]
    },
    '2': {
        id: '2',
        name: "Joe's Restaurants",
        businessType: 'TRADITIONAL',
        notes: 'Local restaurant chain',
        locationsCount: 4,
        activeWorkflows: 2,
        completionRate: 92,
        createdAt: '2024-02-01',
        locations: [
            { id: '3', name: "Joe's Pizza Downtown", address: 'Orlando, FL', gbpStatus: 'VERIFIED' },
        ],
        reports: [
            { id: 'r4', type: 'MONTHLY_SEO', period: '2024-03', status: 'READY', createdAt: '2024-03-01' },
        ],
        invoices: [
            { id: 'inv3', invoiceNumber: 'INV-2024-003', status: 'OVERDUE', total: 800, currency: 'USD', dueDate: '2024-02-15', issueDate: '2024-02-01' },
        ]
    }
}

const REPORT_TYPE_LABELS: Record<string, string> = {
    'MONTHLY_SEO': 'Monthly SEO',
    'WEEKLY_SUMMARY': 'Weekly Summary',
    'GBP_PERFORMANCE': 'GBP Performance',
    'CITATION_AUDIT': 'Citation Audit',
    'RANKING_SNAPSHOT': 'Ranking Snapshot',
    'WORKFLOW_COMPLETION': 'Workflow Completion'
}

function getBusinessTypeBadge(type: string) {
    switch (type) {
        case 'RANK_RENT':
            return <span className="badge badge-primary">Rank & Rent</span>
        case 'TRADITIONAL':
            return <span className="badge badge-info">Traditional</span>
        case 'GMB_ONLY':
            return <span className="badge badge-success">GMB Only</span>
        default:
            return <span className="badge">{type}</span>
    }
}

function getGBPStatusBadge(status: string) {
    switch (status) {
        case 'VERIFIED':
            return <span className="badge badge-success">✓ Verified</span>
        case 'SUSPENDED':
            return <span className="badge badge-error">⚠️ Suspended</span>
        default:
            return <span className="badge">{status}</span>
    }
}

function getInvoiceStatusBadge(status: string) {
    switch (status) {
        case 'PAID':
            return <span className="badge badge-success">Paid</span>
        case 'SENT':
            return <span className="badge badge-primary">Sent</span>
        case 'OVERDUE':
            return <span className="badge badge-error">Overdue</span>
        case 'PARTIAL':
            return <span className="badge badge-warning">Partial</span>
        case 'DRAFT':
            return <span className="badge">Draft</span>
        default:
            return <span className="badge">{status}</span>
    }
}

function formatCurrency(amount: number, currency: string = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

type TabType = 'overview' | 'reports' | 'invoices'

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const client = mockClients[id]
    const [activeTab, setActiveTab] = useState<TabType>('overview')
    const [downloadingReport, setDownloadingReport] = useState<string | null>(null)
    const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)

    const handleDownloadReport = async (reportId: string) => {
        setDownloadingReport(reportId)
        try {
            const response = await fetch(`/api/reports/${reportId}/download`)
            if (!response.ok) throw new Error('Failed to download')
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Report-${reportId}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()
        } catch (error) {
            console.error('Error:', error)
            alert('Failed to download report')
        } finally {
            setDownloadingReport(null)
        }
    }

    const handleDownloadInvoice = async (invoiceId: string, invoiceNumber: string) => {
        setDownloadingInvoice(invoiceId)
        try {
            const response = await fetch(`/api/invoices/${invoiceId}/pdf`)
            if (!response.ok) throw new Error('Failed to download')
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Invoice-${invoiceNumber}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()
        } catch (error) {
            console.error('Error:', error)
            alert('Failed to download invoice')
        } finally {
            setDownloadingInvoice(null)
        }
    }

    if (!client) {
        return (
            <>
                <Header title="Client Not Found" subtitle="" />
                <div className="page-content">
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-4)' }}>🔍</div>
                        <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Client Not Found</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
                            The client you&apos;re looking for doesn&apos;t exist or has been removed.
                        </p>
                        <Link href="/clients" className="btn btn-primary">
                            Back to Clients
                        </Link>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Header
                title={client.name}
                subtitle={`Created on ${client.createdAt}`}
                actions={
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                        <Link href={`/clients/${id}/edit`} className="btn btn-secondary">
                            Edit Client
                        </Link>
                        <Link href={`/workflows?clientId=${id}`} className="btn btn-primary">
                            + Start Workflow
                        </Link>
                    </div>
                }
            />

            <div className="page-content">
                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon primary">📍</div>
                        <div className="stat-value">{client.locationsCount}</div>
                        <div className="stat-label">Locations</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon warning">🔄</div>
                        <div className="stat-value">{client.activeWorkflows}</div>
                        <div className="stat-label">Active Workflows</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon success">✅</div>
                        <div className="stat-value">{client.completionRate}%</div>
                        <div className="stat-label">Completion Rate</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon info">📄</div>
                        <div className="stat-value">{client.reports.length}</div>
                        <div className="stat-label">Reports</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-1)',
                    marginBottom: 'var(--spacing-6)',
                    borderBottom: '1px solid var(--color-border)'
                }}>
                    {(['overview', 'reports', 'invoices'] as TabType[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: 'var(--spacing-3) var(--spacing-4)',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: activeTab === tab ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                                color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                                marginBottom: '-1px',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'overview' && '📋 '}
                            {tab === 'reports' && '📊 '}
                            {tab === 'invoices' && '💳 '}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
                        {/* Client Info */}
                        <div className="card">
                            <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 'var(--font-weight-semibold)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                Client Information
                            </h3>

                            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: 'var(--spacing-1)'
                                }}>
                                    Business Type
                                </div>
                                {getBusinessTypeBadge(client.businessType)}
                            </div>

                            <div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: 'var(--spacing-1)'
                                }}>
                                    Notes
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                    {client.notes || 'No notes added'}
                                </p>
                            </div>
                        </div>

                        {/* Locations */}
                        <div className="card">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                <h3 style={{
                                    fontSize: 'var(--font-size-lg)',
                                    fontWeight: 'var(--font-weight-semibold)'
                                }}>
                                    Locations
                                </h3>
                                <Link href={`/locations?clientId=${id}`} className="btn btn-ghost btn-sm">
                                    View All
                                </Link>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                                {client.locations.map(location => (
                                    <div
                                        key={location.id}
                                        style={{
                                            padding: 'var(--spacing-3)',
                                            background: 'var(--color-bg-tertiary)',
                                            borderRadius: 'var(--radius-lg)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                {location.name}
                                            </div>
                                            <div style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-text-muted)'
                                            }}>
                                                📍 {location.address}
                                            </div>
                                        </div>
                                        {getGBPStatusBadge(location.gbpStatus)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="card">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--spacing-4)'
                        }}>
                            <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 'var(--font-weight-semibold)'
                            }}>
                                📊 Reports
                            </h3>
                            <Link href="/reports" className="btn btn-ghost btn-sm">
                                View All Reports
                            </Link>
                        </div>

                        {client.reports.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-2)' }}>📊</div>
                                <p>No reports generated yet</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Report Type</th>
                                            <th>Period</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {client.reports.map(report => (
                                            <tr key={report.id}>
                                                <td>
                                                    <Link href={`/reports/${report.id}`} style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                        {REPORT_TYPE_LABELS[report.type] || report.type}
                                                    </Link>
                                                </td>
                                                <td>{report.period}</td>
                                                <td>
                                                    <span className={`badge ${report.status === 'READY' ? 'badge-success' : 'badge-warning'}`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleDownloadReport(report.id)}
                                                        disabled={downloadingReport === report.id}
                                                    >
                                                        {downloadingReport === report.id ? '⏳' : '📥'} PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'invoices' && (
                    <div className="card">
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 'var(--spacing-4)'
                        }}>
                            <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 'var(--font-weight-semibold)'
                            }}>
                                💳 Invoices
                            </h3>
                            <Link href="/invoices/new" className="btn btn-primary btn-sm">
                                + New Invoice
                            </Link>
                        </div>

                        {client.invoices.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-8)', color: 'var(--color-text-muted)' }}>
                                <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-2)' }}>💳</div>
                                <p>No invoices created yet</p>
                            </div>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Amount</th>
                                            <th>Issue Date</th>
                                            <th>Due Date</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {client.invoices.map(invoice => (
                                            <tr key={invoice.id}>
                                                <td>
                                                    <Link href={`/invoices/${invoice.id}`} style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                        {invoice.invoiceNumber}
                                                    </Link>
                                                </td>
                                                <td>{getInvoiceStatusBadge(invoice.status)}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 'var(--font-weight-semibold)' }}>
                                                    {formatCurrency(invoice.total, invoice.currency)}
                                                </td>
                                                <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                                                <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleDownloadInvoice(invoice.id, invoice.invoiceNumber)}
                                                        disabled={downloadingInvoice === invoice.id}
                                                    >
                                                        {downloadingInvoice === invoice.id ? '⏳' : '📥'} PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
