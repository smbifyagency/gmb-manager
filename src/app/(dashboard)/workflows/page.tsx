'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Type definitions
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
}

interface Location {
    id: string
    name: string
    client: string
    businessType: string
}

interface SOPTemplate {
    id: string
    name: string
    type: string
    description: string
    taskCount: number
    estimatedTime: string
    icon: string
}

// Mock workflow data (will be replaced with API data)
const initialMockWorkflows: Workflow[] = [
    {
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
        dueDate: '2024-03-25'
    },
    {
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
        dueDate: '2024-03-20'
    },
    {
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
        dueDate: '2024-03-31'
    },
    {
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
        dueDate: '2024-03-22'
    },
    {
        id: '5',
        name: 'New Location Setup',
        type: 'NEW_LOCATION',
        location: 'Orlando Electricians',
        client: 'Rank & Rent Portfolio',
        businessType: 'RANK_RENT',
        status: 'completed',
        priority: 'LOW',
        progress: 100,
        completedTasks: 11,
        totalTasks: 11,
        startedAt: '2024-02-15',
        dueDate: '2024-03-01'
    }
]

const sopTemplates: SOPTemplate[] = [
    {
        id: 'new-location',
        name: 'New Location Setup',
        type: 'NEW_LOCATION',
        description: 'Complete setup for a new business location',
        taskCount: 12,
        estimatedTime: '3-5 hours',
        icon: '📍'
    },
    {
        id: 'suspension',
        name: 'GBP Suspension Recovery',
        type: 'SUSPENSION_RECOVERY',
        description: 'Step-by-step recovery from a GBP suspension',
        taskCount: 8,
        estimatedTime: '2-4 hours',
        icon: '🚨'
    },
    {
        id: 'rebrand',
        name: 'Rebrand / Business Update',
        type: 'REBRAND',
        description: 'Handle business name, address, or major changes',
        taskCount: 10,
        estimatedTime: '4-6 hours',
        icon: '🔄'
    },
    {
        id: 'maintenance',
        name: 'Monthly Maintenance',
        type: 'MAINTENANCE',
        description: 'Recurring monthly optimization tasks',
        taskCount: 8,
        estimatedTime: '2-3 hours',
        icon: '📅'
    }
]

const mockLocations: Location[] = [
    { id: '1', name: 'Tampa Bay Plumbers', client: 'Rank & Rent Portfolio', businessType: 'RANK_RENT' },
    { id: '2', name: 'Miami Roofing Masters', client: 'Rank & Rent Portfolio', businessType: 'RANK_RENT' },
    { id: '3', name: "Joe's Pizza Downtown", client: "Joe's Restaurants", businessType: 'TRADITIONAL' },
    { id: '4', name: 'Sunrise Dental', client: 'Sunrise Dental LLC', businessType: 'GMB_ONLY' },
    { id: '5', name: 'Orlando Electricians', client: 'Rank & Rent Portfolio', businessType: 'RANK_RENT' },
    { id: '6', name: 'Fort Lauderdale HVAC', client: 'Miami Services Group', businessType: 'RANK_RENT' },
]

// Task counts by business type for each SOP template
const taskCountsByBusinessType: Record<string, Record<string, number>> = {
    'new-location': { 'RANK_RENT': 11, 'TRADITIONAL': 12, 'GMB_ONLY': 11 },
    'suspension': { 'RANK_RENT': 7, 'TRADITIONAL': 8, 'GMB_ONLY': 8 },
    'rebrand': { 'RANK_RENT': 0, 'TRADITIONAL': 10, 'GMB_ONLY': 8 },
    'maintenance': { 'RANK_RENT': 8, 'TRADITIONAL': 8, 'GMB_ONLY': 8 },
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'not_started':
            return <span className="badge badge-info">Not Started</span>
        case 'in_progress':
            return <span className="badge badge-primary">In Progress</span>
        case 'blocked':
            return <span className="badge badge-error">Blocked</span>
        case 'completed':
            return <span className="badge badge-success">Completed</span>
        default:
            return null
    }
}

function getPriorityBadge(priority: string) {
    switch (priority) {
        case 'LOW':
            return <span className="badge" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>Low</span>
        case 'MEDIUM':
            return <span className="badge badge-info">Medium</span>
        case 'HIGH':
            return <span className="badge badge-warning">High</span>
        case 'CRITICAL':
            return <span className="badge badge-error">Critical</span>
        default:
            return null
    }
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
            return null
    }
}

function getWorkflowIcon(type: string) {
    switch (type) {
        case 'NEW_LOCATION':
            return '📍'
        case 'SUSPENSION_RECOVERY':
            return '🚨'
        case 'REBRAND':
            return '🔄'
        case 'MAINTENANCE':
            return '📅'
        default:
            return '📋'
    }
}

export default function WorkflowsPage() {
    const router = useRouter()
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [workflows, setWorkflows] = useState<Workflow[]>(initialMockWorkflows)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const filteredWorkflows = workflows.filter(workflow => {
        if (filter === 'all') return true
        return workflow.status === filter
    })

    // Get selected location details for business type display
    const selectedLocationData = selectedLocation
        ? mockLocations.find(l => l.id === selectedLocation)
        : null

    // Get the selected template
    const selectedTemplateData = selectedTemplate
        ? sopTemplates.find(t => t.id === selectedTemplate)
        : null

    // Calculate task count based on business type
    const getFilteredTaskCount = () => {
        if (!selectedTemplate || !selectedLocationData) return 0
        return taskCountsByBusinessType[selectedTemplate]?.[selectedLocationData.businessType] || 0
    }

    // Handle starting a new workflow
    const handleStartWorkflow = async () => {
        if (!selectedTemplate || !selectedLocation) {
            setError('Please select both a template and a location')
            return
        }

        const locationData = mockLocations.find(l => l.id === selectedLocation)
        const templateData = sopTemplates.find(t => t.id === selectedTemplate)

        if (!locationData || !templateData) {
            setError('Invalid selection')
            return
        }

        // Check if the template is applicable for this business type
        const taskCount = getFilteredTaskCount()
        if (taskCount === 0) {
            setError('This SOP template is not applicable for this business type')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Generate due date (7 days from now for most, 3 days for suspension recovery)
            const daysToAdd = selectedTemplate === 'suspension' ? 3 : 7
            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + daysToAdd)

            // Create new workflow
            const newWorkflow: Workflow = {
                id: `workflow-${Date.now()}`,
                name: templateData.name,
                type: templateData.type,
                location: locationData.name,
                client: locationData.client,
                businessType: locationData.businessType,
                status: 'in_progress',
                priority: 'MEDIUM',
                progress: 0,
                completedTasks: 0,
                totalTasks: taskCount,
                startedAt: new Date().toISOString().split('T')[0],
                dueDate: dueDate.toISOString().split('T')[0]
            }

            // Add to workflows list
            setWorkflows(prev => [newWorkflow, ...prev])

            // Close modal and reset state
            setShowModal(false)
            setSelectedTemplate(null)
            setSelectedLocation(null)

            // Show success message
            setSuccessMessage(`✅ Workflow "${templateData.name}" created for ${locationData.name} with ${taskCount} tasks!`)
            setTimeout(() => setSuccessMessage(null), 5000)

        } catch (err) {
            console.error('Error creating workflow:', err)
            setError(err instanceof Error ? err.message : 'Failed to create workflow')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Reset modal state when closing
    const handleCloseModal = () => {
        setShowModal(false)
        setSelectedTemplate(null)
        setSelectedLocation(null)
        setError(null)
    }

    return (
        <>
            <Header
                title="Workflows"
                subtitle="Manage SOP-driven workflows for your locations"
                actions={
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <span>+ Start Workflow</span>
                    </button>
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
                        <span>{successMessage}</span>
                        <button
                            onClick={() => setSuccessMessage(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-success)',
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-8)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon primary">🔄</div>
                        <div className="stat-value">{workflows.filter(w => w.status === 'in_progress').length}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon error">⏸️</div>
                        <div className="stat-value">{workflows.filter(w => w.status === 'blocked').length}</div>
                        <div className="stat-label">Blocked</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon success">✅</div>
                        <div className="stat-value">{workflows.filter(w => w.status === 'completed').length}</div>
                        <div className="stat-label">Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon warning">⚡</div>
                        <div className="stat-value">{workflows.filter(w => w.priority === 'CRITICAL').length}</div>
                        <div className="stat-label">Critical Priority</div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-3)',
                    marginBottom: 'var(--spacing-6)'
                }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`btn ${filter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('in_progress')}
                    >
                        In Progress
                    </button>
                    <button
                        className={`btn ${filter === 'blocked' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('blocked')}
                    >
                        Blocked
                    </button>
                    <button
                        className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                </div>

                {/* Workflows Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                    gap: 'var(--spacing-4)'
                }}>
                    {filteredWorkflows.map(workflow => (
                        <Link
                            key={workflow.id}
                            href={`/workflows/${workflow.id}`}
                            className="workflow-card"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div className="workflow-header" style={{
                                background: 'transparent',
                                borderBottom: 'none',
                                padding: 0,
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                    <span style={{ fontSize: '24px' }}>{getWorkflowIcon(workflow.type)}</span>
                                    <div>
                                        <div style={{
                                            fontWeight: 'var(--font-weight-semibold)',
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
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                    {getPriorityBadge(workflow.priority)}
                                    {getStatusBadge(workflow.status)}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 'var(--spacing-3)',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-muted)'
                            }}>
                                <span>{workflow.client}</span>
                                {getBusinessTypeBadge(workflow.businessType)}
                            </div>

                            <div className="progress-bar" style={{ marginBottom: 'var(--spacing-2)' }}>
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
                                fontSize: 'var(--font-size-xs)',
                                color: 'var(--color-text-muted)'
                            }}>
                                <span>{workflow.completedTasks} of {workflow.totalTasks} tasks</span>
                                <span>Due: {workflow.dueDate}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Start Workflow Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Start New Workflow</h3>
                            <button
                                className="modal-close"
                                onClick={handleCloseModal}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Error Display */}
                            {error && (
                                <div style={{
                                    padding: 'var(--spacing-3) var(--spacing-4)',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid var(--color-error)',
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'var(--color-error)',
                                    marginBottom: 'var(--spacing-4)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Step 1: Select Template */}
                            <div style={{ marginBottom: 'var(--spacing-6)' }}>
                                <h4 style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    marginBottom: 'var(--spacing-3)',
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    1. Select SOP Template
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: 'var(--spacing-3)'
                                }}>
                                    {sopTemplates.map(template => (
                                        <div
                                            key={template.id}
                                            onClick={() => setSelectedTemplate(template.id)}
                                            style={{
                                                padding: 'var(--spacing-4)',
                                                border: `2px solid ${selectedTemplate === template.id ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                                                borderRadius: 'var(--radius-lg)',
                                                cursor: 'pointer',
                                                transition: 'all var(--transition-fast)',
                                                background: selectedTemplate === template.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent'
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-2)',
                                                marginBottom: 'var(--spacing-2)'
                                            }}>
                                                <span style={{ fontSize: '20px' }}>{template.icon}</span>
                                                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                                    {template.name}
                                                </span>
                                            </div>
                                            <p style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-text-muted)',
                                                marginBottom: 'var(--spacing-2)'
                                            }}>
                                                {template.description}
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                gap: 'var(--spacing-3)',
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-text-muted)'
                                            }}>
                                                <span>📋 {template.taskCount} tasks</span>
                                                <span>⏱️ {template.estimatedTime}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Step 2: Select Location */}
                            <div>
                                <h4 style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    marginBottom: 'var(--spacing-3)',
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    2. Select Location
                                </h4>
                                <select
                                    className="form-select"
                                    value={selectedLocation || ''}
                                    onChange={(e) => setSelectedLocation(e.target.value || null)}
                                    disabled={isSubmitting}
                                >
                                    <option value="">Choose a location...</option>
                                    {mockLocations.map(location => (
                                        <option key={location.id} value={location.id}>
                                            {location.name} ({location.client})
                                        </option>
                                    ))}
                                </select>

                                {/* Business Type Info */}
                                {selectedLocationData && (
                                    <div style={{
                                        marginTop: 'var(--spacing-3)',
                                        padding: 'var(--spacing-3)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        fontSize: 'var(--font-size-sm)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                                            <span>Business Type:</span>
                                            {getBusinessTypeBadge(selectedLocationData.businessType)}
                                        </div>
                                        <p style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: 'var(--spacing-2)'
                                        }}>
                                            {selectedLocationData.businessType === 'RANK_RENT' &&
                                                '✓ Owner approval tasks will be excluded'}
                                            {selectedLocationData.businessType === 'GMB_ONLY' &&
                                                '✓ Website-related tasks will be excluded'}
                                            {selectedLocationData.businessType === 'TRADITIONAL' &&
                                                '✓ All tasks applicable'}
                                        </p>
                                        {selectedTemplate && (
                                            <div style={{
                                                padding: 'var(--spacing-2)',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                borderRadius: 'var(--radius-md)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-2)'
                                            }}>
                                                <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                                    📋 {getFilteredTaskCount()} tasks
                                                </span>
                                                <span style={{ color: 'var(--color-text-muted)' }}>
                                                    will be generated for this workflow
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className="form-helper">
                                    Tasks will be automatically filtered based on the location&apos;s business type.
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={handleCloseModal}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                disabled={!selectedTemplate || !selectedLocation || isSubmitting || getFilteredTaskCount() === 0}
                                onClick={handleStartWorkflow}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span style={{ marginRight: 'var(--spacing-2)' }}>⏳</span>
                                        Creating...
                                    </>
                                ) : (
                                    '🚀 Start Workflow'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .workflow-card {
          display: block;
          padding: var(--spacing-5);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          transition: all var(--transition-fast);
        }
        .workflow-card:hover {
          border-color: var(--color-accent-primary);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }
        .workflow-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
      `}</style>
        </>
    )
}
