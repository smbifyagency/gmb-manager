'use client'

import { use } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'

// Mock location data - would come from API
const mockLocations: Record<string, {
    id: string
    name: string
    client: string
    clientId: string
    businessType: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
    gbpStatus: string
    gbpUrl: string
    hasWebsite: boolean
    websiteUrl: string
    activeWorkflows: number
    completedWorkflows: number
    lastUpdated: string
    workflows: Array<{
        id: string
        name: string
        status: string
        progress: number
    }>
}> = {
    '1': {
        id: '1',
        name: 'Tampa Bay Plumbers',
        client: 'Rank & Rent Portfolio',
        clientId: '1',
        businessType: 'RANK_RENT',
        address: '123 Main St',
        city: 'Tampa',
        state: 'FL',
        zipCode: '33601',
        phone: '(813) 555-0123',
        gbpStatus: 'VERIFIED',
        gbpUrl: 'https://business.google.com/...',
        hasWebsite: true,
        websiteUrl: 'https://tampabayplumbers.com',
        activeWorkflows: 2,
        completedWorkflows: 1,
        lastUpdated: '2024-03-18',
        workflows: [
            { id: 'w1', name: 'New Location Setup', status: 'in_progress', progress: 75 },
            { id: 'w2', name: 'Monthly Maintenance', status: 'in_progress', progress: 50 },
        ]
    },
    '2': {
        id: '2',
        name: 'Miami Roofing Masters',
        client: 'Rank & Rent Portfolio',
        clientId: '1',
        businessType: 'RANK_RENT',
        address: '456 Ocean Dr',
        city: 'Miami',
        state: 'FL',
        zipCode: '33139',
        phone: '(305) 555-0456',
        gbpStatus: 'SUSPENDED',
        gbpUrl: '',
        hasWebsite: true,
        websiteUrl: 'https://miamiroofingmasters.com',
        activeWorkflows: 1,
        completedWorkflows: 0,
        lastUpdated: '2024-03-15',
        workflows: [
            { id: 'w3', name: 'GBP Suspension Recovery', status: 'blocked', progress: 25 },
        ]
    }
}

function getGBPStatusBadge(status: string) {
    switch (status) {
        case 'VERIFIED':
            return <span className="badge badge-success">✓ Verified</span>
        case 'PENDING_VERIFICATION':
            return <span className="badge badge-warning">⏳ Pending</span>
        case 'SUSPENDED':
            return <span className="badge badge-error">⚠️ Suspended</span>
        default:
            return <span className="badge">{status}</span>
    }
}

function getWorkflowStatusBadge(status: string) {
    switch (status) {
        case 'in_progress':
            return <span className="badge badge-primary">In Progress</span>
        case 'blocked':
            return <span className="badge badge-error">Blocked</span>
        case 'completed':
            return <span className="badge badge-success">Completed</span>
        default:
            return <span className="badge">{status}</span>
    }
}

export default function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const location = mockLocations[id]

    if (!location) {
        return (
            <>
                <Header title="Location Not Found" subtitle="" />
                <div className="page-content">
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-4)' }}>🔍</div>
                        <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Location Not Found</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>
                            The location you&apos;re looking for doesn&apos;t exist or has been removed.
                        </p>
                        <Link href="/locations" className="btn btn-primary">
                            Back to Locations
                        </Link>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Header
                title={location.name}
                subtitle={`${location.client} • ${location.city}, ${location.state}`}
                actions={
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                        <Link href={`/locations/${id}/edit`} className="btn btn-secondary">
                            Edit Location
                        </Link>
                        <Link href={`/workflows?locationId=${id}`} className="btn btn-primary">
                            + Start Workflow
                        </Link>
                    </div>
                }
            />

            <div className="page-content">
                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon primary">🔄</div>
                        <div className="stat-value">{location.activeWorkflows}</div>
                        <div className="stat-label">Active Workflows</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon success">✅</div>
                        <div className="stat-value">{location.completedWorkflows}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon info">📅</div>
                        <div className="stat-value">{location.lastUpdated}</div>
                        <div className="stat-label">Last Updated</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
                    {/* Location Info */}
                    <div className="card">
                        <h3 style={{
                            fontSize: 'var(--font-size-lg)',
                            fontWeight: 'var(--font-weight-semibold)',
                            marginBottom: 'var(--spacing-4)'
                        }}>
                            Location Details
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                            <div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: 'var(--spacing-1)'
                                }}>
                                    GBP Status
                                </div>
                                {getGBPStatusBadge(location.gbpStatus)}
                            </div>

                            <div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: 'var(--spacing-1)'
                                }}>
                                    Address
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                    📍 {location.address}, {location.city}, {location.state} {location.zipCode}
                                </p>
                            </div>

                            <div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: 'var(--spacing-1)'
                                }}>
                                    Phone
                                </div>
                                <p style={{ fontSize: 'var(--font-size-sm)' }}>
                                    📞 {location.phone}
                                </p>
                            </div>

                            {location.hasWebsite && (
                                <div>
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-muted)',
                                        marginBottom: 'var(--spacing-1)'
                                    }}>
                                        Website
                                    </div>
                                    <a
                                        href={location.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--color-accent-primary)'
                                        }}
                                    >
                                        🌐 {location.websiteUrl}
                                    </a>
                                </div>
                            )}

                            {location.gbpUrl && (
                                <div>
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-muted)',
                                        marginBottom: 'var(--spacing-1)'
                                    }}>
                                        GBP URL
                                    </div>
                                    <a
                                        href={location.gbpUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: 'var(--font-size-sm)',
                                            color: 'var(--color-accent-primary)'
                                        }}
                                    >
                                        📊 Open in Google Business Profile
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Workflows */}
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
                                Active Workflows
                            </h3>
                            <Link href={`/workflows?locationId=${id}`} className="btn btn-ghost btn-sm">
                                View All
                            </Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                            {location.workflows.length === 0 ? (
                                <p style={{
                                    color: 'var(--color-text-muted)',
                                    textAlign: 'center',
                                    padding: 'var(--spacing-6)'
                                }}>
                                    No active workflows
                                </p>
                            ) : (
                                location.workflows.map(workflow => (
                                    <div
                                        key={workflow.id}
                                        style={{
                                            padding: 'var(--spacing-3)',
                                            background: 'var(--color-bg-tertiary)',
                                            borderRadius: 'var(--radius-lg)'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 'var(--spacing-2)'
                                        }}>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                {workflow.name}
                                            </div>
                                            {getWorkflowStatusBadge(workflow.status)}
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{
                                                    width: `${workflow.progress}%`,
                                                    background: workflow.status === 'blocked'
                                                        ? 'var(--color-warning)'
                                                        : 'var(--color-accent-gradient)'
                                                }}
                                            />
                                        </div>
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                            marginTop: 'var(--spacing-1)'
                                        }}>
                                            {workflow.progress}% complete
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
