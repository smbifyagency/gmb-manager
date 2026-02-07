'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useAuth } from '@/contexts/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'

interface Task {
    id: string
    title: string
    instructions: string
    location: string
    client: string
    workflow: string
    status: 'pending' | 'in_progress' | 'blocked' | 'completed'
    evidenceType: string
    estimatedMinutes: number
    dueDate: string
    order: number
    isBlocked: boolean
    blockedReason?: string
}

// Initial mock task data
const initialTasks: Task[] = [
    {
        id: '1',
        title: 'Upload Initial Photos',
        instructions: `1. Prepare at least 5-10 high-quality photos:
   - Logo (square format)
   - Cover photo (16:9 aspect ratio)
   - Interior photos (3+)
   - Exterior photos (2+)
   - Team photos if applicable
2. Go to GBP → Photos
3. Upload all photos with descriptive filenames
4. Set logo and cover photo appropriately`,
        location: 'Tampa Bay Plumbers',
        client: 'Rank & Rent Portfolio',
        workflow: 'New Location Setup',
        status: 'pending',
        evidenceType: 'SCREENSHOT',
        estimatedMinutes: 20,
        dueDate: '2024-03-20',
        order: 6,
        isBlocked: false
    },
    {
        id: '2',
        title: 'Set Up Services List',
        instructions: `1. Go to GBP → Edit profile → Services (or Products)
2. Add ALL services the business offers
3. Include service descriptions and prices if applicable
4. Group services into logical categories
5. For products, add product photos`,
        location: 'Tampa Bay Plumbers',
        client: 'Rank & Rent Portfolio',
        workflow: 'New Location Setup',
        status: 'pending',
        evidenceType: 'SCREENSHOT',
        estimatedMinutes: 20,
        dueDate: '2024-03-20',
        order: 8,
        isBlocked: false
    },
    {
        id: '3',
        title: 'Gather Evidence Documents',
        instructions: `Collect documentation proving business legitimacy:
1. Business license or registration
2. Utility bill showing address
3. Bank statement with business name
4. Photos of physical location (storefront, signage)
5. Photos of team/employees at location
6. Lease agreement (if applicable)

Compile into a single PDF or folder.`,
        location: 'Miami Roofing Masters',
        client: 'Rank & Rent Portfolio',
        workflow: 'GBP Suspension Recovery',
        status: 'blocked',
        evidenceType: 'FILE',
        estimatedMinutes: 30,
        dueDate: '2024-03-21',
        order: 3,
        isBlocked: true,
        blockedReason: 'Waiting for Suspension Type Identification'
    },
    {
        id: '4',
        title: 'Create GBP Post',
        instructions: `1. Create at least 1 Google Business Profile post
2. Options:
   - What's New: General updates
   - Offer: Promotions or specials
   - Event: Upcoming events
3. Include engaging image or video
4. Add clear call-to-action
5. Use relevant keywords naturally`,
        location: "Joe's Pizza Downtown",
        client: "Joe's Restaurants",
        workflow: 'Monthly Maintenance',
        status: 'in_progress',
        evidenceType: 'SCREENSHOT',
        estimatedMinutes: 15,
        dueDate: '2024-03-20',
        order: 1,
        isBlocked: false
    },
    {
        id: '5',
        title: 'Submit to Top Citation Directories',
        instructions: `1. Create listings on the top 10 citation sites:
   - Yelp
   - Facebook Business
   - Apple Maps
   - Bing Places
   - Yellow Pages
   - BBB (if applicable)
   - Industry-specific directories
2. Use EXACT NAP format documented earlier
3. Add consistent description and categories`,
        location: 'Tampa Bay Plumbers',
        client: 'Rank & Rent Portfolio',
        workflow: 'New Location Setup',
        status: 'pending',
        evidenceType: 'TEXT',
        estimatedMinutes: 60,
        dueDate: '2024-03-22',
        order: 10,
        isBlocked: false
    }
]

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

function getEvidenceLabel(type: string) {
    switch (type) {
        case 'SCREENSHOT':
            return '📷 Screenshot required'
        case 'URL':
            return '🔗 URL required'
        case 'TEXT':
            return '📝 Text evidence required'
        case 'FILE':
            return '📁 File upload required'
        case 'CHECKLIST':
            return '☑️ Checklist completion required'
        default:
            return 'No evidence needed'
    }
}

export default function TasksPage() {
    const { hasPermission } = useAuth()
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [filter, setFilter] = useState('all')
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [evidence, setEvidence] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true
        return task.status === filter
    })

    const canCompleteTask = hasPermission(PERMISSIONS.TASK_COMPLETE)

    const handleStartTask = (taskId: string) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, status: 'in_progress' as const } : task
        ))
        // Update selected task if it's the same
        if (selectedTask?.id === taskId) {
            setSelectedTask(prev => prev ? { ...prev, status: 'in_progress' } : null)
        }
    }

    const handleCompleteTask = async (taskId: string) => {
        // Validate evidence for non-NONE types
        const task = tasks.find(t => t.id === taskId)
        if (task && task.evidenceType !== 'NONE' && !evidence.trim()) {
            alert('Please provide evidence before completing this task')
            return
        }

        setIsSubmitting(true)

        try {
            // TODO: API call to complete task
            // await fetch(`/api/tasks/${taskId}`, {
            //     method: 'PATCH',
            //     body: JSON.stringify({ status: 'COMPLETED', evidence })
            // })

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            setTasks(prev => prev.map(task =>
                task.id === taskId ? { ...task, status: 'completed' as const } : task
            ))

            // Clear selection and evidence
            setSelectedTask(null)
            setEvidence('')
        } catch (error) {
            console.error('Failed to complete task:', error)
            alert('Failed to complete task. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setEvidence(`File: ${file.name}`)
        }
    }

    return (
        <>
            <Header
                title="My Tasks"
                subtitle="Complete your assigned local SEO tasks"
            />

            <div className="page-content">
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
                        All ({tasks.length})
                    </button>
                    <button
                        className={`btn ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({tasks.filter(t => t.status === 'pending').length})
                    </button>
                    <button
                        className={`btn ${filter === 'in_progress' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('in_progress')}
                    >
                        In Progress ({tasks.filter(t => t.status === 'in_progress').length})
                    </button>
                    <button
                        className={`btn ${filter === 'blocked' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('blocked')}
                    >
                        Blocked ({tasks.filter(t => t.status === 'blocked').length})
                    </button>
                    <button
                        className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed ({tasks.filter(t => t.status === 'completed').length})
                    </button>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: selectedTask ? '1fr 1fr' : '1fr',
                    gap: 'var(--spacing-6)'
                }}>
                    {/* Task List */}
                    <div>
                        {filteredTasks.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                                <div style={{ fontSize: '48px', marginBottom: 'var(--spacing-4)' }}>✅</div>
                                <p style={{ color: 'var(--color-text-muted)' }}>No tasks in this category</p>
                            </div>
                        ) : (
                            filteredTasks.map(task => (
                                <div
                                    key={task.id}
                                    className={`task-card ${task.status} ${selectedTask?.id === task.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedTask(task)
                                        setEvidence('')
                                    }}
                                    style={{
                                        borderColor: selectedTask?.id === task.id
                                            ? 'var(--color-accent-primary)'
                                            : undefined,
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div className="task-header">
                                        <div className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}>
                                            {task.status === 'completed' && '✓'}
                                            {task.status === 'blocked' && '🔒'}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="task-title">{task.title}</div>
                                            <div style={{
                                                fontSize: 'var(--font-size-xs)',
                                                color: 'var(--color-text-muted)',
                                                marginTop: 'var(--spacing-1)'
                                            }}>
                                                {task.location} • {task.workflow}
                                            </div>
                                        </div>
                                        {getStatusBadge(task.status)}
                                    </div>

                                    <div className="task-meta">
                                        <span className="task-time">📅 Due: {task.dueDate}</span>
                                        <span className="task-time">⏱️ {task.estimatedMinutes} min</span>
                                        <span className="task-time">{getEvidenceLabel(task.evidenceType).split(' ')[0]}</span>
                                    </div>

                                    {task.isBlocked && task.blockedReason && (
                                        <div style={{
                                            marginTop: 'var(--spacing-3)',
                                            padding: 'var(--spacing-2) var(--spacing-3)',
                                            background: 'var(--color-warning-bg)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-warning)'
                                        }}>
                                            🔒 {task.blockedReason}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Task Detail Panel */}
                    {selectedTask && (
                        <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--spacing-8))' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: 'var(--font-size-xl)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        marginBottom: 'var(--spacing-2)'
                                    }}>
                                        {selectedTask.title}
                                    </h3>
                                    <p style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {selectedTask.location} • {selectedTask.workflow}
                                    </p>
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setSelectedTask(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 'var(--spacing-4)',
                                marginBottom: 'var(--spacing-6)'
                            }}>
                                {getStatusBadge(selectedTask.status)}
                                <span style={{
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    ⏱️ Estimated: {selectedTask.estimatedMinutes} minutes
                                </span>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-6)' }}>
                                <h4 style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    marginBottom: 'var(--spacing-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    📋 Instructions
                                </h4>
                                <div style={{
                                    background: 'var(--color-bg-tertiary)',
                                    padding: 'var(--spacing-4)',
                                    borderRadius: 'var(--radius-lg)',
                                    fontSize: 'var(--font-size-sm)',
                                    lineHeight: 'var(--line-height-relaxed)',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {selectedTask.instructions}
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-6)' }}>
                                <h4 style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    marginBottom: 'var(--spacing-3)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    📎 Evidence Required
                                </h4>

                                <div style={{
                                    padding: 'var(--spacing-3)',
                                    background: 'var(--color-info-bg)',
                                    borderRadius: 'var(--radius-lg)',
                                    marginBottom: 'var(--spacing-4)',
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-info)'
                                }}>
                                    {getEvidenceLabel(selectedTask.evidenceType)}
                                </div>

                                {selectedTask.status !== 'completed' && (
                                    <>
                                        {(selectedTask.evidenceType === 'SCREENSHOT' || selectedTask.evidenceType === 'FILE') && (
                                            <div style={{
                                                border: '2px dashed var(--color-border)',
                                                borderRadius: 'var(--radius-lg)',
                                                padding: 'var(--spacing-8)',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all var(--transition-fast)',
                                                position: 'relative'
                                            }}>
                                                <input
                                                    type="file"
                                                    onChange={handleFileUpload}
                                                    style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        opacity: 0,
                                                        cursor: 'pointer'
                                                    }}
                                                    accept={selectedTask.evidenceType === 'SCREENSHOT' ? 'image/*' : '*'}
                                                />
                                                <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-2)' }}>
                                                    {selectedTask.evidenceType === 'SCREENSHOT' ? '📤' : '📁'}
                                                </div>
                                                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                                                    {evidence || 'Click to upload or drag and drop'}
                                                </p>
                                            </div>
                                        )}

                                        {selectedTask.evidenceType === 'URL' && (
                                            <input
                                                type="url"
                                                className="form-input"
                                                placeholder="https://..."
                                                value={evidence}
                                                onChange={(e) => setEvidence(e.target.value)}
                                            />
                                        )}

                                        {selectedTask.evidenceType === 'TEXT' && (
                                            <textarea
                                                className="form-textarea"
                                                placeholder="Paste or type your evidence here..."
                                                value={evidence}
                                                onChange={(e) => setEvidence(e.target.value)}
                                            />
                                        )}
                                    </>
                                )}
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 'var(--spacing-3)'
                            }}>
                                {selectedTask.isBlocked ? (
                                    <button className="btn btn-secondary w-full" disabled>
                                        🔒 Task is Blocked
                                    </button>
                                ) : selectedTask.status === 'completed' ? (
                                    <button className="btn btn-success w-full" disabled>
                                        ✅ Completed
                                    </button>
                                ) : (
                                    <>
                                        {selectedTask.status === 'pending' && (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ flex: 1 }}
                                                onClick={() => handleStartTask(selectedTask.id)}
                                            >
                                                ▶️ Start Task
                                            </button>
                                        )}
                                        {canCompleteTask && (
                                            <button
                                                className="btn btn-primary"
                                                style={{ flex: 1 }}
                                                onClick={() => handleCompleteTask(selectedTask.id)}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Saving...' : '✅ Mark Complete'}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
