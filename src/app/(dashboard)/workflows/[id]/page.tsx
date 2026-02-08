'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'

// Type definitions
interface Task {
    id: string
    name: string
    description: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'SKIPPED'
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
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED'
    priority: string
    progress: number
    completedTasks: number
    totalTasks: number
    startedAt: string | null
    dueDate: string | null
    completedAt: string | null
    tasks: Task[]
}

// Mock workflow data (until API is fully integrated)
const mockWorkflows: Record<string, Workflow> = {
    '1': {
        id: '1',
        name: 'New Location Setup',
        type: 'NEW_LOCATION',
        location: 'Tampa Bay Plumbers',
        client: 'Rank & Rent Portfolio',
        businessType: 'RANK_RENT',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        progress: 75,
        completedTasks: 9,
        totalTasks: 12,
        startedAt: '2024-03-10',
        dueDate: '2024-03-25',
        completedAt: null,
        tasks: [
            { id: 't1', name: 'Create GBP Listing', description: 'Set up the Google Business Profile', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-12', priority: 'HIGH', evidence: null, order: 1 },
            { id: 't2', name: 'Add Photos (5 minimum)', description: 'Upload at least 5 high-quality photos', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-13', priority: 'HIGH', evidence: null, order: 2 },
            { id: 't3', name: 'Write Business Description', description: 'Create SEO-optimized description', status: 'COMPLETED', assignee: 'Sarah', dueDate: '2024-03-14', priority: 'MEDIUM', evidence: null, order: 3 },
            { id: 't4', name: 'Set Categories', description: 'Select primary and secondary categories', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-14', priority: 'HIGH', evidence: null, order: 4 },
            { id: 't5', name: 'Add Services', description: 'List all services offered', status: 'COMPLETED', assignee: 'Sarah', dueDate: '2024-03-15', priority: 'MEDIUM', evidence: null, order: 5 },
            { id: 't6', name: 'Set Hours', description: 'Configure business hours', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-15', priority: 'MEDIUM', evidence: null, order: 6 },
            { id: 't7', name: 'Add Phone Number', description: 'Add tracking phone number', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-16', priority: 'HIGH', evidence: null, order: 7 },
            { id: 't8', name: 'Link Website', description: 'Connect website URL', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-16', priority: 'MEDIUM', evidence: null, order: 8 },
            { id: 't9', name: 'Verify Listing', description: 'Complete verification process', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-18', priority: 'CRITICAL', evidence: null, order: 9 },
            { id: 't10', name: 'Create First Post', description: 'Publish first GBP post', status: 'IN_PROGRESS', assignee: 'Sarah', dueDate: '2024-03-20', priority: 'MEDIUM', evidence: null, order: 10 },
            { id: 't11', name: 'Set Up Q&A', description: 'Pre-populate Q&A section', status: 'PENDING', assignee: null, dueDate: '2024-03-22', priority: 'LOW', evidence: null, order: 11 },
            { id: 't12', name: 'Request First Review', description: 'Reach out for first review', status: 'PENDING', assignee: null, dueDate: '2024-03-25', priority: 'MEDIUM', evidence: null, order: 12 },
        ]
    },
    '2': {
        id: '2',
        name: 'GBP Suspension Recovery',
        type: 'SUSPENSION_RECOVERY',
        location: 'Miami Roofing Masters',
        client: 'Rank & Rent Portfolio',
        businessType: 'RANK_RENT',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        progress: 25,
        completedTasks: 2,
        totalTasks: 8,
        startedAt: '2024-03-15',
        dueDate: '2024-03-20',
        completedAt: null,
        tasks: [
            { id: 't1', name: 'Document Suspension Notice', description: 'Screenshot and document the suspension', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-15', priority: 'CRITICAL', evidence: null, order: 1 },
            { id: 't2', name: 'Identify Violation Cause', description: 'Analyze what triggered suspension', status: 'COMPLETED', assignee: 'Sarah', dueDate: '2024-03-16', priority: 'CRITICAL', evidence: null, order: 2 },
            { id: 't3', name: 'Prepare Appeal Documents', description: 'Gather proof of legitimacy', status: 'BLOCKED', assignee: 'John', dueDate: '2024-03-17', priority: 'CRITICAL', evidence: null, order: 3 },
            { id: 't4', name: 'Submit Reinstatement Request', description: 'File appeal with Google', status: 'PENDING', assignee: null, dueDate: '2024-03-18', priority: 'CRITICAL', evidence: null, order: 4 },
            { id: 't5', name: 'Follow Up on Appeal', description: 'Check status after 3 days', status: 'PENDING', assignee: null, dueDate: '2024-03-19', priority: 'HIGH', evidence: null, order: 5 },
            { id: 't6', name: 'Video Verification (if needed)', description: 'Complete video call if requested', status: 'PENDING', assignee: null, dueDate: '2024-03-19', priority: 'HIGH', evidence: null, order: 6 },
            { id: 't7', name: 'Confirm Reinstatement', description: 'Verify listing is active again', status: 'PENDING', assignee: null, dueDate: '2024-03-20', priority: 'CRITICAL', evidence: null, order: 7 },
            { id: 't8', name: 'Post-Recovery Audit', description: 'Review and prevent future issues', status: 'PENDING', assignee: null, dueDate: '2024-03-20', priority: 'MEDIUM', evidence: null, order: 8 },
        ]
    },
    '3': {
        id: '3',
        name: 'Monthly Maintenance',
        type: 'MAINTENANCE',
        location: "Joe's Pizza Downtown",
        client: "Joe's Restaurants",
        businessType: 'TRADITIONAL',
        status: 'NOT_STARTED',
        priority: 'MEDIUM',
        progress: 0,
        completedTasks: 0,
        totalTasks: 8,
        startedAt: null,
        dueDate: '2024-03-31',
        completedAt: null,
        tasks: [
            { id: 't1', name: 'Review GBP Insights', description: 'Check performance metrics', status: 'PENDING', assignee: null, dueDate: '2024-03-05', priority: 'MEDIUM', evidence: null, order: 1 },
            { id: 't2', name: 'Update Photos', description: 'Add new seasonal photos', status: 'PENDING', assignee: null, dueDate: '2024-03-10', priority: 'MEDIUM', evidence: null, order: 2 },
            { id: 't3', name: 'Respond to Reviews', description: 'Reply to all new reviews', status: 'PENDING', assignee: null, dueDate: '2024-03-15', priority: 'HIGH', evidence: null, order: 3 },
            { id: 't4', name: 'Create Monthly Post', description: 'Publish promotional post', status: 'PENDING', assignee: null, dueDate: '2024-03-15', priority: 'MEDIUM', evidence: null, order: 4 },
            { id: 't5', name: 'Update Q&A', description: 'Add new Q&A if needed', status: 'PENDING', assignee: null, dueDate: '2024-03-20', priority: 'LOW', evidence: null, order: 5 },
            { id: 't6', name: 'Check NAP Consistency', description: 'Verify name/address/phone', status: 'PENDING', assignee: null, dueDate: '2024-03-25', priority: 'LOW', evidence: null, order: 6 },
            { id: 't7', name: 'Update Services/Menu', description: 'Refresh any stale info', status: 'PENDING', assignee: null, dueDate: '2024-03-28', priority: 'LOW', evidence: null, order: 7 },
            { id: 't8', name: 'Generate Monthly Report', description: 'Create client report', status: 'PENDING', assignee: null, dueDate: '2024-03-31', priority: 'MEDIUM', evidence: null, order: 8 },
        ]
    },
    '4': {
        id: '4',
        name: 'Rebrand Update',
        type: 'REBRAND',
        location: 'Sunrise Dental',
        client: 'Sunrise Dental LLC',
        businessType: 'GMB_ONLY',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        progress: 100,
        completedTasks: 10,
        totalTasks: 10,
        startedAt: '2024-03-05',
        dueDate: '2024-03-20',
        completedAt: '2024-03-19',
        tasks: [
            { id: 't1', name: 'Update Business Name', description: 'Change to new brand name', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-06', priority: 'CRITICAL', evidence: null, order: 1 },
            { id: 't2', name: 'Upload New Logo', description: 'Replace logo in GBP', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-07', priority: 'HIGH', evidence: null, order: 2 },
            { id: 't3', name: 'Update Cover Photo', description: 'New branded cover image', status: 'COMPLETED', assignee: 'Sarah', dueDate: '2024-03-08', priority: 'HIGH', evidence: null, order: 3 },
            { id: 't4', name: 'Revise Description', description: 'Update with new branding', status: 'COMPLETED', assignee: 'Sarah', dueDate: '2024-03-09', priority: 'MEDIUM', evidence: null, order: 4 },
            { id: 't5', name: 'Update Website URL', description: 'Link new website', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-10', priority: 'HIGH', evidence: null, order: 5 },
            { id: 't6', name: 'Update Phone (if changed)', description: 'New contact number', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-10', priority: 'MEDIUM', evidence: null, order: 6 },
            { id: 't7', name: 'Post Rebrand Announcement', description: 'Announce the change', status: 'COMPLETED', assignee: 'Sarah', dueDate: '2024-03-12', priority: 'MEDIUM', evidence: null, order: 7 },
            { id: 't8', name: 'Update All Photos', description: 'Replace old branded photos', status: 'COMPLETED', assignee: 'Sarah', dueDate: '2024-03-15', priority: 'MEDIUM', evidence: null, order: 8 },
            { id: 't9', name: 'Check Citation Consistency', description: 'Update major directories', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-18', priority: 'MEDIUM', evidence: null, order: 9 },
            { id: 't10', name: 'Final QA Check', description: 'Verify all updates are live', status: 'COMPLETED', assignee: 'John', dueDate: '2024-03-20', priority: 'HIGH', evidence: null, order: 10 },
        ]
    }
}

export default function WorkflowDetailPage() {
    const params = useParams()
    const router = useRouter()
    const workflowId = params.id as string

    const [workflow, setWorkflow] = useState<Workflow | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Fetch workflow data
    const fetchWorkflow = useCallback(() => {
        setLoading(true)
        // For now, use mock data. In production, this would be an API call
        setTimeout(() => {
            const found = mockWorkflows[workflowId]
            setWorkflow(found || null)
            setLoading(false)
        }, 300)
    }, [workflowId])

    useEffect(() => {
        fetchWorkflow()
    }, [fetchWorkflow])

    // Workflow action handler
    const handleWorkflowAction = async (action: 'start' | 'complete' | 'reopen' | 'pause') => {
        if (!workflow) return

        setActionLoading(action)
        setError(null)

        try {
            // For now, simulate with mock data update
            // In production: const response = await fetch(`/api/workflows/${workflowId}`, { method: 'PATCH', body: JSON.stringify({ action }) })

            await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API delay

            let newStatus: Workflow['status'] = workflow.status
            let updates: Partial<Workflow> = {}

            switch (action) {
                case 'start':
                    if (workflow.status !== 'NOT_STARTED' && workflow.status !== 'PAUSED') {
                        throw new Error(`Cannot start workflow in ${workflow.status} status`)
                    }
                    newStatus = 'IN_PROGRESS'
                    updates = { startedAt: new Date().toISOString().split('T')[0] }
                    break
                case 'complete':
                    if (workflow.status !== 'IN_PROGRESS') {
                        throw new Error('Cannot complete workflow. Must be IN_PROGRESS.')
                    }
                    const incompleteTasks = workflow.tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'SKIPPED')
                    if (incompleteTasks.length > 0) {
                        throw new Error(`Cannot complete workflow. ${incompleteTasks.length} task(s) still pending.`)
                    }
                    newStatus = 'COMPLETED'
                    updates = { completedAt: new Date().toISOString().split('T')[0], progress: 100 }
                    break
                case 'reopen':
                    if (workflow.status !== 'COMPLETED') {
                        throw new Error('Cannot reopen. Workflow must be COMPLETED.')
                    }
                    newStatus = 'IN_PROGRESS'
                    updates = { completedAt: null }
                    break
                case 'pause':
                    if (workflow.status !== 'IN_PROGRESS') {
                        throw new Error('Cannot pause. Workflow must be IN_PROGRESS.')
                    }
                    newStatus = 'PAUSED'
                    break
            }

            // Update local state
            setWorkflow({
                ...workflow,
                ...updates,
                status: newStatus
            })

            setSuccessMessage(`Workflow ${action === 'start' ? 'started' : action === 'complete' ? 'completed' : action === 'reopen' ? 'reopened' : 'paused'} successfully!`)
            setTimeout(() => setSuccessMessage(null), 3000)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Action failed')
        } finally {
            setActionLoading(null)
        }
    }

    // Task action handler
    const handleTaskAction = async (taskId: string, action: 'start' | 'complete' | 'skip') => {
        if (!workflow) return

        setActionLoading(taskId)

        try {
            await new Promise(resolve => setTimeout(resolve, 300)) // Simulate API delay

            const taskIndex = workflow.tasks.findIndex(t => t.id === taskId)
            if (taskIndex === -1) throw new Error('Task not found')

            const task = workflow.tasks[taskIndex]
            let newStatus: Task['status'] = task.status

            switch (action) {
                case 'start':
                    newStatus = 'IN_PROGRESS'
                    break
                case 'complete':
                    newStatus = 'COMPLETED'
                    break
                case 'skip':
                    newStatus = 'SKIPPED'
                    break
            }

            const updatedTasks = [...workflow.tasks]
            updatedTasks[taskIndex] = { ...task, status: newStatus }

            const completedCount = updatedTasks.filter(t => t.status === 'COMPLETED').length
            const progress = Math.round((completedCount / updatedTasks.length) * 100)

            setWorkflow({
                ...workflow,
                tasks: updatedTasks,
                completedTasks: completedCount,
                progress
            })

            setSuccessMessage(`Task ${action === 'complete' ? 'completed' : action === 'start' ? 'started' : 'skipped'}!`)
            setTimeout(() => setSuccessMessage(null), 2000)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Task action failed')
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { bg: string; color: string; label: string }> = {
            'COMPLETED': { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', label: 'Completed' },
            'IN_PROGRESS': { bg: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-info)', label: 'In Progress' },
            'PENDING': { bg: 'rgba(156, 163, 175, 0.1)', color: 'var(--color-text-muted)', label: 'Pending' },
            'NOT_STARTED': { bg: 'rgba(156, 163, 175, 0.1)', color: 'var(--color-text-muted)', label: 'Not Started' },
            'BLOCKED': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', label: 'Blocked' },
            'PAUSED': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)', label: 'Paused' },
            'SKIPPED': { bg: 'rgba(156, 163, 175, 0.1)', color: 'var(--color-text-muted)', label: 'Skipped' },
        }
        const s = statusMap[status] || statusMap['PENDING']
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

    // Get appropriate action buttons based on workflow status
    const getWorkflowActions = () => {
        if (!workflow) return null

        const buttons: React.ReactNode[] = []

        switch (workflow.status) {
            case 'NOT_STARTED':
                buttons.push(
                    <button
                        key="start"
                        className="btn btn-primary"
                        onClick={() => handleWorkflowAction('start')}
                        disabled={actionLoading === 'start'}
                    >
                        {actionLoading === 'start' ? '⏳ Starting...' : '▶️ Start Workflow'}
                    </button>
                )
                break
            case 'IN_PROGRESS':
                buttons.push(
                    <button
                        key="pause"
                        className="btn btn-secondary"
                        onClick={() => handleWorkflowAction('pause')}
                        disabled={actionLoading === 'pause'}
                    >
                        {actionLoading === 'pause' ? '⏳...' : '⏸️ Pause'}
                    </button>
                )
                buttons.push(
                    <button
                        key="complete"
                        className="btn btn-primary"
                        onClick={() => handleWorkflowAction('complete')}
                        disabled={actionLoading === 'complete'}
                    >
                        {actionLoading === 'complete' ? '⏳ Completing...' : '✅ Mark Complete'}
                    </button>
                )
                break
            case 'PAUSED':
                buttons.push(
                    <button
                        key="resume"
                        className="btn btn-primary"
                        onClick={() => handleWorkflowAction('start')}
                        disabled={actionLoading === 'start'}
                    >
                        {actionLoading === 'start' ? '⏳...' : '▶️ Resume'}
                    </button>
                )
                break
            case 'COMPLETED':
                buttons.push(
                    <button
                        key="reopen"
                        className="btn btn-secondary"
                        onClick={() => handleWorkflowAction('reopen')}
                        disabled={actionLoading === 'reopen'}
                    >
                        {actionLoading === 'reopen' ? '⏳...' : '🔄 Reopen'}
                    </button>
                )
                break
        }

        return buttons
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
                        {getWorkflowActions()}
                    </div>
                }
            />

            <div className="page-content">
                {/* Success Message */}
                {successMessage && (
                    <div style={{
                        padding: 'var(--spacing-4)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid var(--color-success)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-success)',
                        marginBottom: 'var(--spacing-6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span>✅ {successMessage}</span>
                        <button onClick={() => setSuccessMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div style={{
                        padding: 'var(--spacing-4)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid var(--color-error)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-error)',
                        marginBottom: 'var(--spacing-6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <span>❌ {error}</span>
                        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
                    </div>
                )}

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
                            <span style={{ fontSize: '20px' }}>{getWorkflowIcon(workflow.type)}</span> {workflow.type.replace(/_/g, ' ')}
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                Started
                            </div>
                            <span>{workflow.startedAt || 'Not started'}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                Due Date
                            </div>
                            <span>{workflow.dueDate || 'No due date'}</span>
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
                                    background: workflow.status === 'PAUSED'
                                        ? 'var(--color-warning)'
                                        : workflow.status === 'COMPLETED'
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
                                    background: task.status === 'COMPLETED'
                                        ? 'rgba(16, 185, 129, 0.05)'
                                        : task.status === 'BLOCKED'
                                            ? 'rgba(245, 158, 11, 0.05)'
                                            : 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    border: `1px solid ${task.status === 'COMPLETED'
                                        ? 'rgba(16, 185, 129, 0.2)'
                                        : task.status === 'BLOCKED'
                                            ? 'rgba(245, 158, 11, 0.2)'
                                            : 'var(--color-border)'}`
                                }}
                            >
                                {/* Task Number */}
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: 'var(--radius-full)',
                                    background: task.status === 'COMPLETED'
                                        ? 'var(--color-success)'
                                        : task.status === 'IN_PROGRESS'
                                            ? 'var(--color-info)'
                                            : task.status === 'BLOCKED'
                                                ? 'var(--color-warning)'
                                                : 'var(--color-border)',
                                    color: task.status === 'PENDING' ? 'var(--color-text-muted)' : 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    fontSize: 'var(--font-size-sm)',
                                    flexShrink: 0
                                }}>
                                    {task.status === 'COMPLETED' ? '✓' : task.status === 'SKIPPED' ? '—' : index + 1}
                                </div>

                                {/* Task Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: 'var(--font-weight-medium)',
                                        marginBottom: '4px',
                                        textDecoration: task.status === 'COMPLETED' || task.status === 'SKIPPED' ? 'line-through' : 'none',
                                        opacity: task.status === 'COMPLETED' || task.status === 'SKIPPED' ? 0.7 : 1
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

                                {/* Action Buttons */}
                                {workflow.status === 'IN_PROGRESS' && task.status !== 'COMPLETED' && task.status !== 'SKIPPED' && (
                                    <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                        {task.status === 'PENDING' && (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '6px 12px', fontSize: 'var(--font-size-sm)' }}
                                                onClick={() => handleTaskAction(task.id, 'start')}
                                                disabled={actionLoading === task.id}
                                            >
                                                {actionLoading === task.id ? '...' : 'Start'}
                                            </button>
                                        )}
                                        {task.status === 'IN_PROGRESS' && (
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '6px 12px', fontSize: 'var(--font-size-sm)' }}
                                                onClick={() => handleTaskAction(task.id, 'complete')}
                                                disabled={actionLoading === task.id}
                                            >
                                                {actionLoading === task.id ? '...' : 'Complete'}
                                            </button>
                                        )}
                                        {task.status !== 'BLOCKED' && (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '6px 12px', fontSize: 'var(--font-size-sm)', opacity: 0.7 }}
                                                onClick={() => handleTaskAction(task.id, 'skip')}
                                                disabled={actionLoading === task.id}
                                            >
                                                Skip
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}
