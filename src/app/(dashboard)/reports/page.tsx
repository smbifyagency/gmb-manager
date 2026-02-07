'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'

interface Report {
    id: string
    type: string
    period: string
    status: string
    createdAt: string
    client: {
        id: string
        name: string
    }
    location?: {
        id: string
        name: string
    }
}

const REPORT_TYPE_LABELS: Record<string, string> = {
    'MONTHLY_SEO': 'Monthly SEO Report',
    'WEEKLY_SUMMARY': 'Weekly Summary',
    'GBP_PERFORMANCE': 'GBP Performance',
    'CITATION_AUDIT': 'Citation Audit',
    'RANKING_SNAPSHOT': 'Ranking Snapshot',
    'WORKFLOW_COMPLETION': 'Workflow Completion'
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'READY':
            return <span className="badge badge-success">Ready</span>
        case 'GENERATING':
            return <span className="badge badge-warning">Generating...</span>
        case 'FAILED':
            return <span className="badge badge-error">Failed</span>
        default:
            return <span className="badge">{status}</span>
    }
}

function getTypeIcon(type: string) {
    switch (type) {
        case 'MONTHLY_SEO': return '📊'
        case 'WEEKLY_SUMMARY': return '📋'
        case 'GBP_PERFORMANCE': return '📍'
        case 'CITATION_AUDIT': return '🔍'
        case 'RANKING_SNAPSHOT': return '📈'
        case 'WORKFLOW_COMPLETION': return '✅'
        default: return '📄'
    }
}

export default function ReportsPage() {
    const { hasPermission } = useAuth()
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [typeFilter, setTypeFilter] = useState('all')
    const [isGenerating, setIsGenerating] = useState(false)
    const [showGenerateModal, setShowGenerateModal] = useState(false)

    const canCreate = hasPermission(PERMISSIONS.REPORT_CREATE)

    // Mock data - replace with API call
    useEffect(() => {
        // Simulate loading
        setLoading(true)
        setTimeout(() => {
            const mockReports: Report[] = [
                {
                    id: '1',
                    type: 'MONTHLY_SEO',
                    period: '2024-03',
                    status: 'READY',
                    createdAt: '2024-03-01T10:00:00Z',
                    client: { id: '1', name: 'Rank & Rent Portfolio' }
                },
                {
                    id: '2',
                    type: 'GBP_PERFORMANCE',
                    period: '2024-03',
                    status: 'READY',
                    createdAt: '2024-03-05T14:30:00Z',
                    client: { id: '2', name: "Joe's Restaurants" },
                    location: { id: '3', name: "Joe's Pizza Downtown" }
                },
                {
                    id: '3',
                    type: 'WEEKLY_SUMMARY',
                    period: '2024-W12',
                    status: 'GENERATING',
                    createdAt: '2024-03-18T09:00:00Z',
                    client: { id: '1', name: 'Rank & Rent Portfolio' }
                },
                {
                    id: '4',
                    type: 'CITATION_AUDIT',
                    period: '2024-03',
                    status: 'READY',
                    createdAt: '2024-03-10T11:15:00Z',
                    client: { id: '4', name: 'Sunrise Dental LLC' }
                }
            ]
            setReports(mockReports)
            setLoading(false)
        }, 500)
    }, [])

    const filteredReports = reports.filter(r =>
        typeFilter === 'all' || r.type === typeFilter
    )

    const handleGenerateReport = async () => {
        setIsGenerating(true)
        // TODO: Open modal to select client, type, period
        setTimeout(() => {
            setIsGenerating(false)
            setShowGenerateModal(false)
        }, 1000)
    }

    return (
        <>
            <Header
                title="Reports"
                subtitle="View and generate SEO performance reports"
                actions={
                    canCreate && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowGenerateModal(true)}
                        >
                            + Generate Report
                        </button>
                    )
                }
            />

            <div className="page-content">
                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon primary">📊</div>
                        <div className="stat-value">{reports.length}</div>
                        <div className="stat-label">Total Reports</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon success">✅</div>
                        <div className="stat-value">{reports.filter(r => r.status === 'READY').length}</div>
                        <div className="stat-label">Ready</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon warning">⏳</div>
                        <div className="stat-value">{reports.filter(r => r.status === 'GENERATING').length}</div>
                        <div className="stat-label">Generating</div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-3)',
                    marginBottom: 'var(--spacing-6)',
                    flexWrap: 'wrap'
                }}>
                    <button
                        className={`btn btn-sm ${typeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setTypeFilter('all')}
                    >
                        All Types
                    </button>
                    {Object.entries(REPORT_TYPE_LABELS).map(([type, label]) => (
                        <button
                            key={type}
                            className={`btn btn-sm ${typeFilter === type ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setTypeFilter(type)}
                        >
                            {getTypeIcon(type)} {label}
                        </button>
                    ))}
                </div>

                {/* Reports List */}
                {loading ? (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-4)' }}>⏳</div>
                        <p style={{ color: 'var(--color-text-muted)' }}>Loading reports...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-4)' }}>📊</div>
                        <h3 style={{ marginBottom: 'var(--spacing-2)' }}>No Reports Found</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Generate your first report to track SEO performance
                        </p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Report</th>
                                    <th>Client</th>
                                    <th>Location</th>
                                    <th>Period</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map(report => (
                                    <tr key={report.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                                                <span style={{ fontSize: '20px' }}>{getTypeIcon(report.type)}</span>
                                                <span>{REPORT_TYPE_LABELS[report.type]}</span>
                                            </div>
                                        </td>
                                        <td>{report.client.name}</td>
                                        <td>{report.location?.name || '—'}</td>
                                        <td>
                                            <code style={{
                                                background: 'var(--color-bg-tertiary)',
                                                padding: '2px 6px',
                                                borderRadius: 'var(--radius-sm)'
                                            }}>
                                                {report.period}
                                            </code>
                                        </td>
                                        <td>{getStatusBadge(report.status)}</td>
                                        <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                                <Link
                                                    href={`/reports/${report.id}`}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    View
                                                </Link>
                                                {report.status === 'READY' && (
                                                    <button className="btn btn-secondary btn-sm">
                                                        📥 Download
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Generate Report Modal */}
            {showGenerateModal && (
                <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Generate New Report</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowGenerateModal(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Client</label>
                                <select className="form-select">
                                    <option value="">Select client...</option>
                                    <option value="1">Rank & Rent Portfolio</option>
                                    <option value="2">Joe&apos;s Restaurants</option>
                                    <option value="4">Sunrise Dental LLC</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Report Type</label>
                                <select className="form-select">
                                    {Object.entries(REPORT_TYPE_LABELS).map(([type, label]) => (
                                        <option key={type} value={type}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Period</label>
                                <input
                                    type="month"
                                    className="form-input"
                                    defaultValue="2024-03"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowGenerateModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerateReport}
                                disabled={isGenerating}
                            >
                                {isGenerating ? 'Generating...' : '📊 Generate Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
