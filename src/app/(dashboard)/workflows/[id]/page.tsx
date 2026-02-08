'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

// Type definitions
interface Task {
    id: string
    name: string
    description: string
    status: 'pending' | 'in_progress' | 'completed' | 'blocked'
    assignee: string | null
    dueDate: string | null
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    evidence: string | null
    order: number
}

interface Workflow {
    id: string
    name: string
    type: string
    location: string
    client: string
    businessType: string
    status: string
    priority: string
    progress: number
    completedTasks: number
    totalTasks: number
    startedAt: string
    dueDate: string
    tasks: Task[]
}

// Mock workflow data
const mockWorkflows: Record<string, Workflow> = {
    '1': {
        id: '1',
        name: 'New Location Setup',
        type: 'NEW_LOCATION',
        location: 'Tampa Bay Plumbers',
        client: 'Rank & Rent Portfolio',
        businessType: 'RANK_RENT',
        status: 'in_progress',
        priority: 'HIGH',
        progress: 75,
        completedTasks: 9,
        totalTasks: 12,
        startedAt: '2024-03-10',
        dueDate: '2024-03-25',
        tasks: [
            { id: 't1', name: 'Create GBP Listing', description: 'Set up the Google Business Profile', status: 'completed', assignee: 'John', dueDate: '2024-03-12', priority: 'HIGH', evidence: null, order: 1 },
            { id: 't2', name: 'Add Photos (5 minimum)', description: 'Upload at least 5 high-quality photos', status: 'completed', assignee: 'John', dueDate: '2024-03-13', priority: 'HIGH', evidence: null, order: 2 },
            { id: 't3', name: 'Write Business Description', description: 'Create SEO-optimized description', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-14', priority: 'MEDIUM', evidence: null, order: 3 },
            { id: 't4', name: 'Set Categories', description: 'Select primary and secondary categories', status: 'completed', assignee: 'John', dueDate: '2024-03-14', priority: 'HIGH', evidence: null, order: 4 },
            { id: 't5', name: 'Add Services', description: 'List all services offered', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-15', priority: 'MEDIUM', evidence: null, order: 5 },
            { id: 't6', name: 'Set Hours', description: 'Configure business hours', status: 'completed', assignee: 'John', dueDate: '2024-03-15', priority: 'MEDIUM', evidence: null, order: 6 },
            { id: 't7', name: 'Add Phone Number', description: 'Add tracking phone number', status: 'completed', assignee: 'John', dueDate: '2024-03-16', priority: 'HIGH', evidence: null, order: 7 },
            { id: 't8', name: 'Link Website', description: 'Connect website URL', status: 'completed', assignee: 'John', dueDate: '2024-03-16', priority: 'MEDIUM', evidence: null, order: 8 },
            { id: 't9', name: 'Verify Listing', description: 'Complete verification process', status: 'completed', assignee: 'John', dueDate: '2024-03-18', priority: 'CRITICAL', evidence: null, order: 9 },
            { id: 't10', name: 'Create First Post', description: 'Publish first GBP post', status: 'in_progress', assignee: 'Sarah', dueDate: '2024-03-20', priority: 'MEDIUM', evidence: null, order: 10 },
            { id: 't11', name: 'Set Up Q&A', description: 'Pre-populate Q&A section', status: 'pending', assignee: null, dueDate: '2024-03-22', priority: 'LOW', evidence: null, order: 11 },
            { id: 't12', name: 'Request First Review', description: 'Reach out for first review', status: 'pending', assignee: null, dueDate: '2024-03-25', priority: 'MEDIUM', evidence: null, order: 12 },
        ]
    },
    '2': {
        id: '2',
        name: 'GBP Suspension Recovery',
        type: 'SUSPENSION_RECOVERY',
        location: 'Miami Roofing Masters',
        client: 'Rank & Rent Portfolio',
        businessType: 'RANK_RENT',
        status: 'blocked',
        priority: 'CRITICAL',
        progress: 25,
        completedTasks: 2,
        totalTasks: 8,
        startedAt: '2024-03-15',
        dueDate: '2024-03-20',
        tasks: [
            { id: 't1', name: 'Document Suspension Notice', description: 'Screenshot and document the suspension', status: 'completed', assignee: 'John', dueDate: '2024-03-15', priority: 'CRITICAL', evidence: null, order: 1 },
            { id: 't2', name: 'Identify Violation Cause', description: 'Analyze what triggered suspension', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-16', priority: 'CRITICAL', evidence: null, order: 2 },
            { id: 't3', name: 'Prepare Appeal Documents', description: 'Gather proof of legitimacy', status: 'blocked', assignee: 'John', dueDate: '2024-03-17', priority: 'CRITICAL', evidence: null, order: 3 },
            { id: 't4', name: 'Submit Reinstatement Request', description: 'File appeal with Google', status: 'pending', assignee: null, dueDate: '2024-03-18', priority: 'CRITICAL', evidence: null, order: 4 },
            { id: 't5', name: 'Follow Up on Appeal', description: 'Check status after 3 days', status: 'pending', assignee: null, dueDate: '2024-03-19', priority: 'HIGH', evidence: null, order: 5 },
            { id: 't6', name: 'Video Verification (if needed)', description: 'Complete video call if requested', status: 'pending', assignee: null, dueDate: '2024-03-19', priority: 'HIGH', evidence: null, order: 6 },
            { id: 't7', name: 'Confirm Reinstatement', description: 'Verify listing is active again', status: 'pending', assignee: null, dueDate: '2024-03-20', priority: 'CRITICAL', evidence: null, order: 7 },
            { id: 't8', name: 'Post-Recovery Audit', description: 'Review and prevent future issues', status: 'pending', assignee: null, dueDate: '2024-03-20', priority: 'MEDIUM', evidence: null, order: 8 },
        ]
    },
    '3': {
        id: '3',
        name: 'Monthly Maintenance',
        type: 'MAINTENANCE',
        location: "Joe's Pizza Downtown",
        client: "Joe's Restaurants",
        businessType: 'TRADITIONAL',
        status: 'in_progress',
        priority: 'MEDIUM',
        progress: 50,
        completedTasks: 4,
        totalTasks: 8,
        startedAt: '2024-03-01',
        dueDate: '2024-03-31',
        tasks: [
            { id: 't1', name: 'Review GBP Insights', description: 'Check performance metrics', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-05', priority: 'MEDIUM', evidence: null, order: 1 },
            { id: 't2', name: 'Update Photos', description: 'Add new seasonal photos', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-10', priority: 'MEDIUM', evidence: null, order: 2 },
            { id: 't3', name: 'Respond to Reviews', description: 'Reply to all new reviews', status: 'completed', assignee: 'John', dueDate: '2024-03-15', priority: 'HIGH', evidence: null, order: 3 },
            { id: 't4', name: 'Create Monthly Post', description: 'Publish promotional post', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-15', priority: 'MEDIUM', evidence: null, order: 4 },
            { id: 't5', name: 'Update Q&A', description: 'Add new Q&A if needed', status: 'in_progress', assignee: 'Sarah', dueDate: '2024-03-20', priority: 'LOW', evidence: null, order: 5 },
            { id: 't6', name: 'Check NAP Consistency', description: 'Verify name/address/phone', status: 'pending', assignee: null, dueDate: '2024-03-25', priority: 'LOW', evidence: null, order: 6 },
            { id: 't7', name: 'Update Services/Menu', description: 'Refresh any stale info', status: 'pending', assignee: null, dueDate: '2024-03-28', priority: 'LOW', evidence: null, order: 7 },
            { id: 't8', name: 'Generate Monthly Report', description: 'Create client report', status: 'pending', assignee: null, dueDate: '2024-03-31', priority: 'MEDIUM', evidence: null, order: 8 },
        ]
    },
    '4': {
        id: '4',
        name: 'Rebrand Update',
        type: 'REBRAND',
        location: 'Sunrise Dental',
        client: 'Sunrise Dental LLC',
        businessType: 'GMB_ONLY',
        status: 'in_progress',
        priority: 'MEDIUM',
        progress: 90,
        completedTasks: 9,
        totalTasks: 10,
        startedAt: '2024-03-05',
        dueDate: '2024-03-20',
        tasks: [
            { id: 't1', name: 'Update Business Name', description: 'Change to new brand name', status: 'completed', assignee: 'John', dueDate: '2024-03-06', priority: 'CRITICAL', evidence: null, order: 1 },
            { id: 't2', name: 'Upload New Logo', description: 'Replace logo in GBP', status: 'completed', assignee: 'John', dueDate: '2024-03-07', priority: 'HIGH', evidence: null, order: 2 },
            { id: 't3', name: 'Update Cover Photo', description: 'New branded cover image', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-08', priority: 'HIGH', evidence: null, order: 3 },
            { id: 't4', name: 'Revise Description', description: 'Update with new branding', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-09', priority: 'MEDIUM', evidence: null, order: 4 },
            { id: 't5', name: 'Update Website URL', description: 'Link new website', status: 'completed', assignee: 'John', dueDate: '2024-03-10', priority: 'HIGH', evidence: null, order: 5 },
            { id: 't6', name: 'Update Phone (if changed)', description: 'New contact number', status: 'completed', assignee: 'John', dueDate: '2024-03-10', priority: 'MEDIUM', evidence: null, order: 6 },
            { id: 't7', name: 'Post Rebrand Announcement', description: 'Announce the change', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-12', priority: 'MEDIUM', evidence: null, order: 7 },
            { id: 't8', name: 'Update All Photos', description: 'Replace old branded photos', status: 'completed', assignee: 'Sarah', dueDate: '2024-03-15', priority: 'MEDIUM', evidence: null, order: 8 },
            { id: 't9', name: 'Check Citation Consistency', description: 'Update major directories', status: 'completed', assignee: 'John', dueDate: '2024-03-18', priority: 'MEDIUM', evidence: null, order: 9 },
            { id: 't10', name: 'Final QA Check', description: 'Verify all updates are live', status: 'in_progress', assignee: 'John', dueDate: '2024-03-20', priority: 'HIGH', evidence: null, order: 10 },
        ]
    }
}

export default function WorkflowDetailPage() {
    const params = useParams()
    const router = useRouter()
    const workflowId = params.id as string

    const [workflow, setWorkflow] = useState<Workflow | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate API fetch
        setTimeout(() => {
            const found = mockWorkflows[workflowId]
            setWorkflow(found || null)
            setLoading(false)
        }, 300)
    }, [workflowId])

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string; label: string }> = {
            completed: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', label: 'Completed' },
            in_progress: { bg: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-info)', label: 'In Progress' },
            pending: { bg: 'rgba(156, 163, 175, 0.1)', color: 'var(--color-text-muted)', label: 'Pending' },
            blocked: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', label: 'Blocked' }
        }
        const s = styles[status] || styles.pending
        return (
            <span style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: s.bg,
                color: s.color,
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)'
            }}>
                {s.label}
            </span>
        )
    }

    const getPriorityBadge = (priority: string) => {
        const styles: Record<string, { bg: string; color: string }> = {
            CRITICAL: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' },
            HIGH: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' },
            MEDIUM: { bg: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-info)' },
            LOW: { bg: 'rgba(156, 163, 175, 0.1)', color: 'var(--color-text-muted)' }
        }
        const s = styles[priority] || styles.MEDIUM
        return (
            <span style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: s.bg,
                color: s.color,
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)'
            }}>
                {priority}
            </span>
        )
    }

    const getWorkflowIcon = (type: string) => {
        const icons: Record<string, string> = {
            'NEW_LOCATION': '🆕',
            'SUSPENSION_RECOVERY': '🚨',
            'MAINTENANCE': '🔧',
            'REBRAND': '✨',
            'MONTHLY': '📅'
        }
        return icons[type] || '📋'
    }

    if (loading) {
        return (
            <>
                <Header title="Loading..." subtitle="Please wait" />
                <div className="page-content" style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                    <p>Loading workflow details...</p>
                </div>
            </>
        )
    }

    if (!workflow) {
        return (
            <>
                <Header title="Workflow Not Found" subtitle="The requested workflow does not exist" />
                <div className="page-content" style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                    <p style={{ marginBottom: '24px' }}>Workflow with ID &quot;{workflowId}&quot; was not found.</p>
                    <Link href="/workflows" className="btn btn-primary">
                        ← Back to Workflows
                    </Link>
                </div>
            </>
        )
    }

    return (
        <>
            <Header
                title={workflow.name}
                subtitle={`${workflow.location} · ${workflow.client}`}
                actions={
                    <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                        <Link href="/workflows" className="btn btn-secondary">
                            ← Back
                        </Link>
                        <button className="btn btn-primary">
                            ⚡ Mark Complete
                        </button>
                    </div>
                }
            />

            <div className="page-content">
                {/* Workflow Summary Card */}
                <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 'var(--spacing-6)'
                    }}>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                Status
                            </div>
                            {getStatusBadge(workflow.status)}
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                Priority
                            </div>
                            {getPriorityBadge(workflow.priority)}
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                Type
                            </div>
                            <span style={{ fontSize: '20px' }}>{getWorkflowIcon(workflow.type)}</span> {workflow.type.replace('_', ' ')}
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                Started
                            </div>
                            <span>{workflow.startedAt}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                Due Date
                            </div>
                            <span>{workflow.dueDate}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                Progress
                            </div>
                            <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{workflow.progress}%</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginTop: 'var(--spacing-6)' }}>
                        <div className="progress-bar" style={{ height: '8px' }}>
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${workflow.progress}%`,
                                    background: workflow.status === 'blocked'
                                        ? 'var(--color-warning)'
                                        : workflow.status === 'completed'
                                            ? 'var(--color-success)'
                                            : 'var(--color-accent-gradient)'
                                }}
                            />
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-muted)',
                            marginTop: 'var(--spacing-2)'
                        }}>
                            <span>{workflow.completedTasks} of {workflow.totalTasks} tasks completed</span>
                            <span>{workflow.totalTasks - workflow.completedTasks} remaining</span>
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="card">
                    <h3 style={{
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: 'var(--font-weight-semibold)',
                        marginBottom: 'var(--spacing-4)'
                    }}>
                        Tasks ({workflow.tasks.length})
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                        {workflow.tasks.map((task, index) => (
                            <div
                                key={task.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-4)',
                                    padding: 'var(--spacing-4)',
                                    background: task.status === 'completed'
                                        ? 'rgba(16, 185, 129, 0.05)'
                                        : task.status === 'blocked'
                                            ? 'rgba(245, 158, 11, 0.05)'
                                            : 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: `1px solid ${task.status === 'completed'
                                        ? 'rgba(16, 185, 129, 0.2)'
                                        : task.status === 'blocked'
                                            ? 'rgba(245, 158, 11, 0.2)'
                                            : 'var(--color-border)'}`
                                }}
                            >
                                {/* Task Number */}
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: 'var(--radius-full)',
                                    background: task.status === 'completed'
                                        ? 'var(--color-success)'
                                        : task.status === 'in_progress'
                                            ? 'var(--color-info)'
                                            : task.status === 'blocked'
                                                ? 'var(--color-warning)'
                                                : 'var(--color-border)',
                                    color: task.status === 'pending' ? 'var(--color-text-muted)' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    fontSize: 'var(--font-size-sm)',
                                    flexShrink: 0
                                }}>
                                    {task.status === 'completed' ? '✓' : index + 1}
                                </div>

                                {/* Task Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: 'var(--font-weight-medium)',
                                        marginBottom: '4px',
                                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                        opacity: task.status === 'completed' ? 0.7 : 1
                                    }}>
                                        {task.name}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {task.description}
                                    </div>
                                </div>

                                {/* Assignee */}
                                <div style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    {task.assignee || 'Unassigned'}
                                </div>

                                {/* Priority */}
                                {getPriorityBadge(task.priority)}

                                {/* Status */}
                                {getStatusBadge(task.status)}

                                {/* Action */}
                                {task.status !== 'completed' && (
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: 'var(--font-size-sm)' }}
                                    >
                                        {task.status === 'pending' ? 'Start' : task.status === 'blocked' ? 'Unblock' : 'Complete'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
