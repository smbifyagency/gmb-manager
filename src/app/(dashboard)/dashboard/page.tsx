'use client'

import { useMemo } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { PERMISSIONS, ROLE_LABELS } from '@/lib/permissions'

// Mock data for demo purposes
const statsAdmin = [
    {
        label: 'Active Locations',
        value: '24',
        icon: '📍',
        iconClass: 'primary',
        change: '+3 this month',
        positive: true
    },
    {
        label: 'Tasks Due Today',
        value: '8',
        icon: '📋',
        iconClass: 'warning',
        change: '5 assigned to you',
        positive: true
    },
    {
        label: 'Overdue Tasks',
        value: '3',
        icon: '⚠️',
        iconClass: 'error',
        change: 'Needs attention',
        positive: false
    },
    {
        label: 'Completion Rate',
        value: '87%',
        icon: '✅',
        iconClass: 'success',
        change: '+5% vs last month',
        positive: true
    },
]

const statsMember = [
    {
        label: 'My Assigned Tasks',
        value: '12',
        icon: '📋',
        iconClass: 'primary',
        change: '5 due today',
        positive: true
    },
    {
        label: 'Tasks Due Today',
        value: '5',
        icon: '⏰',
        iconClass: 'warning',
        change: 'Assigned to you',
        positive: true
    },
    {
        label: 'Completed This Week',
        value: '18',
        icon: '✅',
        iconClass: 'success',
        change: '+3 vs last week',
        positive: true
    },
    {
        label: 'On-Time Rate',
        value: '92%',
        icon: '🎯',
        iconClass: 'info',
        change: 'Great job!',
        positive: true
    },
]

const statsClient = [
    {
        label: 'Active Projects',
        value: '3',
        icon: '📊',
        iconClass: 'primary',
        change: 'In progress',
        positive: true
    },
    {
        label: 'Tasks in Progress',
        value: '8',
        icon: '🔄',
        iconClass: 'info',
        change: 'Being worked on',
        positive: true
    },
    {
        label: 'Completed',
        value: '45',
        icon: '✅',
        iconClass: 'success',
        change: 'This month',
        positive: true
    },
    {
        label: 'Overall Progress',
        value: '75%',
        icon: '📈',
        iconClass: 'primary',
        change: 'Ahead of schedule',
        positive: true
    },
]

const riskAlerts = [
    {
        id: 1,
        type: 'critical',
        title: 'GBP Suspension Detected',
        location: 'Miami Roofing Masters',
        client: 'Rank & Rent Portfolio',
        time: '2 hours ago'
    },
    {
        id: 2,
        type: 'warning',
        title: 'Overdue Critical Task',
        location: 'Downtown Auto Repair',
        client: 'AutoCare Inc.',
        time: '1 day overdue'
    },
    {
        id: 3,
        type: 'info',
        title: 'Review Velocity Drop',
        location: 'Sunrise Dental',
        client: 'Sunrise Dental LLC',
        time: 'Last 30 days'
    }
]

const activeWorkflows = [
    {
        id: 1,
        name: 'New Location Setup',
        location: 'Tampa Bay Plumbers',
        client: 'Rank & Rent Portfolio',
        businessType: 'RANK_RENT',
        progress: 75,
        completedTasks: 9,
        totalTasks: 12,
        status: 'in_progress'
    },
    {
        id: 2,
        name: 'GBP Suspension Recovery',
        location: 'Miami Roofing Masters',
        client: 'Rank & Rent Portfolio',
        businessType: 'RANK_RENT',
        progress: 25,
        completedTasks: 2,
        totalTasks: 8,
        status: 'blocked'
    },
    {
        id: 3,
        name: 'Monthly Maintenance',
        location: 'Joe\'s Pizza Downtown',
        client: 'Joe\'s Restaurants',
        businessType: 'TRADITIONAL',
        progress: 50,
        completedTasks: 4,
        totalTasks: 8,
        status: 'in_progress'
    },
    {
        id: 4,
        name: 'Rebrand Update',
        location: 'Sunrise Dental',
        client: 'Sunrise Dental LLC',
        businessType: 'GMB_ONLY',
        progress: 90,
        completedTasks: 9,
        totalTasks: 10,
        status: 'in_progress'
    }
]

const recentTasks = [
    {
        id: 1,
        title: 'Upload Initial Photos',
        location: 'Tampa Bay Plumbers',
        status: 'pending',
        dueDate: 'Today',
        estimatedTime: '20 min'
    },
    {
        id: 2,
        title: 'Set Up Services List',
        location: 'Tampa Bay Plumbers',
        status: 'pending',
        dueDate: 'Today',
        estimatedTime: '20 min'
    },
    {
        id: 3,
        title: 'Gather Evidence Documents',
        location: 'Miami Roofing Masters',
        status: 'blocked',
        dueDate: 'Tomorrow',
        estimatedTime: '30 min'
    },
    {
        id: 4,
        title: 'Create GBP Post',
        location: 'Joe\'s Pizza Downtown',
        status: 'in_progress',
        dueDate: 'Today',
        estimatedTime: '15 min'
    }
]

function getBusinessTypeBadge(type: string) {
    switch (type) {
        case 'RANK_RENT':
            return <span className="badge badge-primary">Rank & Rent</span>
        case 'TRADITIONAL':
            return <span className="badge badge-info">Traditional</span>
        case 'GMB_ONLY':
            return <span className="badge badge-success">GMB Only</span>
        default:
            return null
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'pending':
            return <span className="badge badge-warning">Pending</span>
        case 'blocked':
            return <span className="badge badge-error">Blocked</span>
        case 'in_progress':
            return <span className="badge badge-primary">In Progress</span>
        case 'completed':
            return <span className="badge badge-success">Completed</span>
        default:
            return null
    }
}

export default function DashboardPage() {
    const {
        user,
        currentTeam,
        currentTeamRole,
        hasPermission,
        isClient,
        isTeamOwner,
        isTeamAdmin
    } = useAuth()

    // Select stats based on role
    const stats = useMemo(() => {
        if (isClient) return statsClient
        if (isTeamOwner || isTeamAdmin) return statsAdmin
        return statsMember
    }, [isClient, isTeamOwner, isTeamAdmin])

    // Create subtitle based on role
    const subtitle = useMemo(() => {
        if (isClient) {
            return 'View your project progress and status.'
        }
        if (currentTeam && currentTeamRole) {
            return `${currentTeam.team.name} • ${ROLE_LABELS[currentTeamRole]}`
        }
        return 'Welcome back! Here\'s your overview.'
    }, [isClient, currentTeam, currentTeamRole])

    // Can start workflow?
    const canStartWorkflow = hasPermission(PERMISSIONS.WORKFLOW_START)

    return (
        <>
            <Header
                title={`Welcome, ${user?.name?.split(' ')[0] || 'User'}`}
                subtitle={subtitle}
                actions={
                    canStartWorkflow && (
                        <Link href="/workflows" className="btn btn-primary">
                            <span>+ Start Workflow</span>
                        </Link>
                    )
                }
            />

            <div className="page-content">
                {/* Role Banner for Clients */}
                {isClient && (
                    <div style={{
                        padding: 'var(--spacing-4)',
                        background: 'rgba(168, 85, 247, 0.1)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--spacing-6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-3)'
                    }}>
                        <span style={{ fontSize: '24px' }}>👁️</span>
                        <div>
                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                Client View
                            </div>
                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-muted)'
                            }}>
                                You have read-only access to your projects and workflows.
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className={`stat-card-icon ${stat.iconClass}`}>
                                {stat.icon}
                            </div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                            <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                                {stat.positive ? '↑' : '↓'} {stat.change}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Risk Alerts - Only for Admins */}
                {(isTeamOwner || isTeamAdmin) && (
                    <div className="card mb-6" style={{ marginBottom: 'var(--spacing-8)' }}>
                        <div className="card-header">
                            <h3 className="card-title">⚠️ Risk Alerts</h3>
                            <Link href="/alerts" className="btn btn-ghost btn-sm">View All</Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                            {riskAlerts.map(alert => (
                                <div
                                    key={alert.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--spacing-4)',
                                        background: alert.type === 'critical'
                                            ? 'var(--color-error-bg)'
                                            : alert.type === 'warning'
                                                ? 'var(--color-warning-bg)'
                                                : 'var(--color-info-bg)',
                                        borderRadius: 'var(--radius-lg)',
                                        borderLeft: `3px solid ${alert.type === 'critical'
                                            ? 'var(--color-error)'
                                            : alert.type === 'warning'
                                                ? 'var(--color-warning)'
                                                : 'var(--color-info)'
                                            }`
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                                        <span style={{ fontSize: '24px' }}>
                                            {alert.type === 'critical' && '🚨'}
                                            {alert.type === 'warning' && '⚠️'}
                                            {alert.type === 'info' && 'ℹ️'}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                {alert.title}
                                            </div>
                                            <div style={{
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--color-text-muted)'
                                            }}>
                                                {alert.location} • {alert.client}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {alert.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Revenue Summary - Only for Owners */}
                {isTeamOwner && (
                    <div className="card mb-6" style={{ marginBottom: 'var(--spacing-8)' }}>
                        <div className="card-header">
                            <h3 className="card-title">💰 Revenue Summary</h3>
                            <Link href="/invoices" className="btn btn-ghost btn-sm">View All Invoices</Link>
                        </div>

                        <div className="stats-grid" style={{ marginBottom: 'var(--spacing-4)' }}>
                            <div className="stat-card" style={{ padding: 'var(--spacing-4)' }}>
                                <div className="stat-value" style={{ color: 'var(--color-success)' }}>$4,800</div>
                                <div className="stat-label">Paid This Month</div>
                            </div>
                            <div className="stat-card" style={{ padding: 'var(--spacing-4)' }}>
                                <div className="stat-value" style={{ color: 'var(--color-warning)' }}>$3,500</div>
                                <div className="stat-label">Outstanding</div>
                            </div>
                            <div className="stat-card" style={{ padding: 'var(--spacing-4)' }}>
                                <div className="stat-value" style={{ color: 'var(--color-error)' }}>$1,200</div>
                                <div className="stat-label">Overdue</div>
                            </div>
                            <div className="stat-card" style={{ padding: 'var(--spacing-4)' }}>
                                <div className="stat-value">12</div>
                                <div className="stat-label">Active Clients</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                            <Link href="/invoices/new" className="btn btn-primary btn-sm">
                                + Create Invoice
                            </Link>
                            <Link href="/reports" className="btn btn-secondary btn-sm">
                                📊 View Reports
                            </Link>
                        </div>
                    </div>
                )}

                {/* Two Column Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                    gap: 'var(--spacing-6)'
                }}>
                    {/* Active Workflows */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                🔄 {isClient ? 'Your Projects' : 'Active Workflows'}
                            </h3>
                            <Link href="/workflows" className="btn btn-ghost btn-sm">View All</Link>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                            {activeWorkflows.map(workflow => (
                                <div
                                    key={workflow.id}
                                    className="workflow-card"
                                    style={{ marginBottom: 0 }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 'var(--spacing-3)'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontWeight: 'var(--font-weight-medium)',
                                                marginBottom: 'var(--spacing-1)'
                                            }}>
                                                {workflow.name}
                                            </div>
                                            <div style={{
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--color-text-muted)'
                                            }}>
                                                {workflow.location}
                                            </div>
                                        </div>
                                        {!isClient && getBusinessTypeBadge(workflow.businessType)}
                                    </div>

                                    <div className="progress-bar" style={{ marginBottom: 'var(--spacing-2)' }}>
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
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        <span>{workflow.completedTasks} of {workflow.totalTasks} tasks</span>
                                        <span>{workflow.progress}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* My Tasks */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                ✅ {isClient ? 'Task Progress' : 'My Tasks'}
                            </h3>
                            {!isClient && (
                                <Link href="/tasks" className="btn btn-ghost btn-sm">View All</Link>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                            {recentTasks.map(task => (
                                <div
                                    key={task.id}
                                    className={`task-card ${task.status}`}
                                    style={{ marginBottom: 0 }}
                                >
                                    <div className="task-header">
                                        <div className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}>
                                            {task.status === 'completed' && '✓'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="task-title">{task.title}</div>
                                            <div style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-text-muted)',
                                                marginTop: 'var(--spacing-1)'
                                            }}>
                                                {task.location}
                                            </div>
                                        </div>
                                        {getStatusBadge(task.status)}
                                    </div>
                                    <div className="task-meta">
                                        <span className="task-time">📅 {task.dueDate}</span>
                                        {!isClient && (
                                            <span className="task-time">⏱️ {task.estimatedTime}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
