'use client'

import { use, useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'

interface ReportData {
    gbpStats: {
        views: number
        searches: number
        calls: number
        directions: number
        websiteClicks: number
        changeFromLast: { views: number, calls: number }
    }
    rankings: Array<{
        keyword: string
        position: number
        change: number
        city: string
    }>
    citations: {
        total: number
        consistent: number
        inconsistent: number
        missing: number
    }
    reviews: {
        total: number
        average: number
        newThisPeriod: number
        responseRate: number
    }
    workflowProgress: {
        completed: number
        inProgress: number
        overdue: number
    }
}

interface Report {
    id: string
    type: string
    period: string
    status: string
    createdAt: string
    client: {
        id: string
        name: string
        businessType: string
    }
    location?: {
        id: string
        name: string
        address: string
        city: string
        state: string
    }
    data: ReportData
}

const REPORT_TYPE_LABELS: Record<string, string> = {
    'MONTHLY_SEO': 'Monthly SEO Report',
    'WEEKLY_SUMMARY': 'Weekly Summary',
    'GBP_PERFORMANCE': 'GBP Performance',
    'CITATION_AUDIT': 'Citation Audit',
    'RANKING_SNAPSHOT': 'Ranking Snapshot',
    'WORKFLOW_COMPLETION': 'Workflow Completion'
}

function formatChange(value: number) {
    if (value > 0) return <span style={{ color: 'var(--color-success)' }}>+{value}%</span>
    if (value < 0) return <span style={{ color: 'var(--color-error)' }}>{value}%</span>
    return <span style={{ color: 'var(--color-text-muted)' }}>0%</span>
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [report, setReport] = useState<Report | null>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)

    const handleDownloadPDF = async () => {
        if (!report) return
        setDownloading(true)
        try {
            const response = await fetch(`/api/reports/${report.id}/download`)
            if (!response.ok) throw new Error('Failed to download PDF')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `Report-${report.client.name.replace(/\s+/g, '-')}-${report.period}.pdf`
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
        // Mock data - replace with API call
        setTimeout(() => {
            setReport({
                id,
                type: 'MONTHLY_SEO',
                period: '2024-03',
                status: 'READY',
                createdAt: '2024-03-01T10:00:00Z',
                client: {
                    id: '1',
                    name: 'Rank & Rent Portfolio',
                    businessType: 'RANK_RENT'
                },
                data: {
                    gbpStats: {
                        views: 3542,
                        searches: 1823,
                        calls: 47,
                        directions: 128,
                        websiteClicks: 234,
                        changeFromLast: { views: 12, calls: 8 }
                    },
                    rankings: [
                        { keyword: 'plumber near me', position: 3, change: 2, city: 'Tampa' },
                        { keyword: 'emergency plumber', position: 5, change: -1, city: 'Tampa' },
                        { keyword: 'water heater repair', position: 2, change: 1, city: 'Tampa' },
                        { keyword: 'drain cleaning', position: 4, change: 0, city: 'Tampa' },
                        { keyword: '24 hour plumber', position: 6, change: 3, city: 'Tampa' }
                    ],
                    citations: {
                        total: 45,
                        consistent: 38,
                        inconsistent: 5,
                        missing: 2
                    },
                    reviews: {
                        total: 87,
                        average: 4.7,
                        newThisPeriod: 12,
                        responseRate: 95
                    },
                    workflowProgress: {
                        completed: 8,
                        inProgress: 2,
                        overdue: 1
                    }
                }
            })
            setLoading(false)
        }, 500)
    }, [id])

    if (loading) {
        return (
            <>
                <Header title="Loading..." subtitle="" />
                <div className="page-content" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                    <div style={{ fontSize: '32px' }}>⏳</div>
                    <p>Loading report...</p>
                </div>
            </>
        )
    }

    if (!report) {
        return (
            <>
                <Header title="Report Not Found" subtitle="" />
                <div className="page-content">
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-4)' }}>🔍</div>
                        <h2>Report not found</h2>
                        <Link href="/reports" className="btn btn-primary" style={{ marginTop: 'var(--spacing-4)' }}>
                            Back to Reports
                        </Link>
                    </div>
                </div>
            </>
        )
    }

    const { data } = report

    return (
        <>
            <Header
                title={REPORT_TYPE_LABELS[report.type]}
                subtitle={`${report.client.name} • ${report.period}`}
                actions={
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={handleDownloadPDF}
                            disabled={downloading}
                        >
                            {downloading ? '⏳ Generating...' : '📥 Download PDF'}
                        </button>
                        <button className="btn btn-secondary">📊 Download Excel</button>
                    </div>
                }
            />

            <div className="page-content">
                {/* GBP Performance Stats */}
                <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <h3 style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                        marginBottom: 'var(--spacing-4)'
                    }}>
                        📍 Google Business Profile Performance
                    </h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value">{data.gbpStats.views.toLocaleString()}</div>
                            <div className="stat-label">Profile Views</div>
                            <div style={{ marginTop: 'var(--spacing-1)' }}>
                                {formatChange(data.gbpStats.changeFromLast.views)}
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{data.gbpStats.searches.toLocaleString()}</div>
                            <div className="stat-label">Search Appearances</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{data.gbpStats.calls}</div>
                            <div className="stat-label">Phone Calls</div>
                            <div style={{ marginTop: 'var(--spacing-1)' }}>
                                {formatChange(data.gbpStats.changeFromLast.calls)}
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{data.gbpStats.directions}</div>
                            <div className="stat-label">Direction Requests</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{data.gbpStats.websiteClicks}</div>
                            <div className="stat-label">Website Clicks</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
                    {/* Rankings */}
                    <div className="card">
                        <h3 style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: 'var(--spacing-4)'
                        }}>
                            📈 Keyword Rankings
                        </h3>
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Keyword</th>
                                        <th>Position</th>
                                        <th>Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.rankings.map((rank, i) => (
                                        <tr key={i}>
                                            <td>{rank.keyword}</td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 'var(--font-weight-semibold)',
                                                    color: rank.position <= 3 ? 'var(--color-success)' : 'inherit'
                                                }}>
                                                    #{rank.position}
                                                </span>
                                            </td>
                                            <td>
                                                {rank.change > 0 && <span style={{ color: 'var(--color-success)' }}>▲ {rank.change}</span>}
                                                {rank.change < 0 && <span style={{ color: 'var(--color-error)' }}>▼ {Math.abs(rank.change)}</span>}
                                                {rank.change === 0 && <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Reviews */}
                    <div className="card">
                        <h3 style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: 'var(--spacing-4)'
                        }}>
                            ⭐ Reviews & Ratings
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                            <div style={{
                                padding: 'var(--spacing-4)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                    {data.reviews.average}
                                </div>
                                <div style={{ color: 'var(--color-text-muted)' }}>Average Rating</div>
                            </div>
                            <div style={{
                                padding: 'var(--spacing-4)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                    {data.reviews.total}
                                </div>
                                <div style={{ color: 'var(--color-text-muted)' }}>Total Reviews</div>
                            </div>
                            <div style={{
                                padding: 'var(--spacing-4)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
                                    +{data.reviews.newThisPeriod}
                                </div>
                                <div style={{ color: 'var(--color-text-muted)' }}>New This Period</div>
                            </div>
                            <div style={{
                                padding: 'var(--spacing-4)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                    {data.reviews.responseRate}%
                                </div>
                                <div style={{ color: 'var(--color-text-muted)' }}>Response Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Citations */}
                    <div className="card">
                        <h3 style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: 'var(--spacing-4)'
                        }}>
                            🔍 Citation Audit
                        </h3>
                        <div style={{ marginBottom: 'var(--spacing-4)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                                <span>Consistency Score</span>
                                <strong>{Math.round(data.citations.consistent / data.citations.total * 100)}%</strong>
                            </div>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${data.citations.consistent / data.citations.total * 100}%` }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}>
                            <span>✅ Consistent: {data.citations.consistent}</span>
                            <span>⚠️ Inconsistent: {data.citations.inconsistent}</span>
                            <span>❌ Missing: {data.citations.missing}</span>
                        </div>
                    </div>

                    {/* Workflow Progress */}
                    <div className="card">
                        <h3 style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: 'var(--spacing-4)'
                        }}>
                            📋 Workflow Progress
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-4)' }}>
                            <div style={{
                                padding: 'var(--spacing-4)',
                                background: 'var(--color-success-bg)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
                                    {data.workflowProgress.completed}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Completed</div>
                            </div>
                            <div style={{
                                padding: 'var(--spacing-4)',
                                background: 'var(--color-info-bg)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-info)' }}>
                                    {data.workflowProgress.inProgress}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>In Progress</div>
                            </div>
                            <div style={{
                                padding: 'var(--spacing-4)',
                                background: 'var(--color-error-bg)',
                                borderRadius: 'var(--radius-lg)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
                                    {data.workflowProgress.overdue}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>Overdue</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
