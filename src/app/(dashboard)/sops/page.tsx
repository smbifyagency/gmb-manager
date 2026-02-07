'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { useRouter } from 'next/navigation'

// Types
interface Task {
    id: string
    title: string
    instructions: string
    category: string
    evidenceType: string
    estimatedMinutes: number
    isRequired: boolean
    requiresOwnerApproval: boolean
    applicableBusinessTypes: string[]
    dependsOnTaskIds: string[]
}

interface SOPTemplate {
    id: string
    name: string
    type: string
    description: string
    applicableTypes: string[]
    taskCount: number
    estimatedHours: string
    icon: string
    isActive: boolean
    usageCount: number
    isCustom?: boolean
    tasks: {
        title: string
        category: string
        time: number
        required: boolean
    }[]
}

// Categories for tasks
const taskCategories = [
    'GBP Setup',
    'GBP Optimization',
    'Website',
    'Citations',
    'Reviews',
    'Tracking',
    'Documentation',
    'Verification',
    'Content'
]

// Evidence types
const evidenceTypes = [
    { value: 'NONE', label: 'None Required' },
    { value: 'URL', label: 'URL Link' },
    { value: 'SCREENSHOT', label: 'Screenshot' },
    { value: 'TEXT', label: 'Text Note' },
    { value: 'FILE', label: 'File Upload' },
    { value: 'CHECKLIST', label: 'Checklist' }
]

// SOP Types
const sopTypes = [
    { value: 'NEW_LOCATION', label: 'New Location Setup' },
    { value: 'SUSPENSION_RECOVERY', label: 'Suspension Recovery' },
    { value: 'REBRAND', label: 'Rebrand / Business Update' },
    { value: 'MAINTENANCE', label: 'Monthly Maintenance' },
    { value: 'CUSTOM', label: 'Custom Workflow' }
]

// SOP Templates with detailed task information
const initialSOPTemplates: SOPTemplate[] = [
    {
        id: 'new-location',
        name: 'New Location Setup',
        type: 'NEW_LOCATION',
        description: 'Complete checklist for setting up a new business location in local SEO ecosystem',
        applicableTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
        taskCount: 12,
        estimatedHours: '3-5',
        icon: '📍',
        isActive: true,
        usageCount: 24,
        tasks: [
            { title: 'Create or Claim Google Business Profile', category: 'GBP Setup', time: 20, required: true },
            { title: 'Set Primary Business Category', category: 'GBP Setup', time: 10, required: true },
            { title: 'Add Secondary Categories', category: 'GBP Optimization', time: 10, required: true },
            { title: 'Configure Service Area', category: 'GBP Setup', time: 10, required: true },
            { title: 'Validate NAP Information', category: 'Documentation', time: 10, required: true },
            { title: 'Upload Initial Photos', category: 'GBP Optimization', time: 20, required: true },
            { title: 'Write Business Description', category: 'GBP Optimization', time: 15, required: true },
            { title: 'Set Up Services/Products', category: 'GBP Optimization', time: 20, required: true },
            { title: 'Configure Business Hours', category: 'GBP Setup', time: 5, required: true },
            { title: 'Submit to Top Citation Directories', category: 'Citations', time: 60, required: true },
            { title: 'Set Up Rank Tracking', category: 'Tracking', time: 20, required: true },
            { title: 'Request Initial Reviews', category: 'Reviews', time: 15, required: false }
        ]
    },
    {
        id: 'suspension',
        name: 'GBP Suspension Recovery',
        type: 'SUSPENSION_RECOVERY',
        description: 'Step-by-step process to recover from a Google Business Profile suspension',
        applicableTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
        taskCount: 8,
        estimatedHours: '2-4',
        icon: '🚨',
        isActive: true,
        usageCount: 7,
        tasks: [
            { title: 'Identify Suspension Type', category: 'Documentation', time: 10, required: true },
            { title: 'Complete Risk Factor Checklist', category: 'Documentation', time: 20, required: true },
            { title: 'Gather Evidence Documents', category: 'Documentation', time: 30, required: true },
            { title: 'Fix Identified Issues', category: 'Verification', time: 60, required: true },
            { title: 'Submit Reinstatement Request', category: 'Verification', time: 20, required: true },
            { title: 'Submit Video Verification', category: 'Verification', time: 30, required: false },
            { title: 'Post-Reinstatement Cleanup', category: 'GBP Optimization', time: 20, required: true },
            { title: '30-Day Monitoring Period', category: 'Tracking', time: 10, required: true }
        ]
    },
    {
        id: 'rebrand',
        name: 'Rebrand / Business Update',
        type: 'REBRAND',
        description: 'Complete checklist for handling business name changes, moves, or major updates',
        applicableTypes: ['TRADITIONAL', 'GMB_ONLY'],
        taskCount: 10,
        estimatedHours: '4-6',
        icon: '🔄',
        isActive: true,
        usageCount: 5,
        tasks: [
            { title: 'Document New Brand Information', category: 'Documentation', time: 15, required: true },
            { title: 'Update Google Business Profile Name', category: 'GBP Optimization', time: 10, required: true },
            { title: 'Update GBP Address', category: 'GBP Optimization', time: 10, required: false },
            { title: 'Update GBP Phone Number', category: 'GBP Optimization', time: 5, required: false },
            { title: 'Re-evaluate Categories', category: 'GBP Optimization', time: 15, required: true },
            { title: 'Update Website Branding', category: 'Website', time: 60, required: true },
            { title: 'Update Schema Markup', category: 'Website', time: 20, required: true },
            { title: 'Update All Citation Sites', category: 'Citations', time: 120, required: true },
            { title: 'Monitor Review Impact', category: 'Reviews', time: 15, required: true },
            { title: 'Track Ranking Impact', category: 'Tracking', time: 20, required: true }
        ]
    },
    {
        id: 'maintenance',
        name: 'Monthly Maintenance',
        type: 'MAINTENANCE',
        description: 'Recurring monthly tasks to maintain and improve local SEO presence',
        applicableTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
        taskCount: 8,
        estimatedHours: '2-3',
        icon: '📅',
        isActive: true,
        usageCount: 45,
        tasks: [
            { title: 'Create GBP Post', category: 'Content', time: 15, required: true },
            { title: 'Upload New Photos', category: 'GBP Optimization', time: 15, required: true },
            { title: 'Monitor Q&A Section', category: 'GBP Optimization', time: 10, required: true },
            { title: 'Check Review Velocity', category: 'Reviews', time: 10, required: true },
            { title: 'Respond to New Reviews', category: 'Reviews', time: 20, required: true },
            { title: 'Check Competitor Rankings', category: 'Tracking', time: 20, required: true },
            { title: 'Audit Citations', category: 'Citations', time: 20, required: false },
            { title: 'Generate Monthly Report', category: 'Tracking', time: 30, required: true }
        ]
    }
]

function getBusinessTypeBadge(type: string) {
    switch (type) {
        case 'RANK_RENT':
            return <span key={type} className="badge badge-primary" style={{ marginRight: 'var(--spacing-1)' }}>Rank &amp; Rent</span>
        case 'TRADITIONAL':
            return <span key={type} className="badge badge-info" style={{ marginRight: 'var(--spacing-1)' }}>Traditional</span>
        case 'GMB_ONLY':
            return <span key={type} className="badge badge-success" style={{ marginRight: 'var(--spacing-1)' }}>GMB Only</span>
        default:
            return null
    }
}

function getCategoryColor(category: string) {
    switch (category) {
        case 'GBP Setup':
        case 'GBP Optimization':
            return 'var(--color-accent-primary)'
        case 'Website':
            return 'var(--color-info)'
        case 'Citations':
            return 'var(--color-warning)'
        case 'Reviews':
            return 'var(--color-success)'
        case 'Tracking':
            return 'var(--color-accent-secondary)'
        case 'Documentation':
            return 'var(--color-text-muted)'
        case 'Verification':
            return 'var(--color-error)'
        case 'Content':
            return '#a855f7'
        default:
            return 'var(--color-text-muted)'
    }
}

// Empty task template
const createEmptyTask = (): Task => ({
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: '',
    instructions: '',
    category: 'GBP Setup',
    evidenceType: 'NONE',
    estimatedMinutes: 15,
    isRequired: true,
    requiresOwnerApproval: false,
    applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
    dependsOnTaskIds: []
})

export default function SOPsPage() {
    const router = useRouter()
    const [selectedSOP, setSelectedSOP] = useState<SOPTemplate | null>(null)
    const [sopTemplates, setSOPTemplates] = useState<SOPTemplate[]>(initialSOPTemplates)

    // Create SOP Modal State
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // SOP Form State
    const [sopName, setSOPName] = useState('')
    const [sopDescription, setSOPDescription] = useState('')
    const [sopType, setSOPType] = useState('CUSTOM')
    const [sopIcon, setSOPIcon] = useState('📋')
    const [applicableBusinessTypes, setApplicableBusinessTypes] = useState<string[]>(['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'])
    const [tasks, setTasks] = useState<Task[]>([createEmptyTask()])

    // Task being edited
    const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(0)

    // Handle business type toggle
    const toggleBusinessType = (type: string) => {
        setApplicableBusinessTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    // Handle task business type toggle
    const toggleTaskBusinessType = (taskIndex: number, type: string) => {
        setTasks(prev => prev.map((task, idx) =>
            idx === taskIndex
                ? {
                    ...task,
                    applicableBusinessTypes: task.applicableBusinessTypes.includes(type)
                        ? task.applicableBusinessTypes.filter(t => t !== type)
                        : [...task.applicableBusinessTypes, type]
                }
                : task
        ))
    }

    // Add new task
    const addTask = () => {
        const newTask = createEmptyTask()
        setTasks(prev => [...prev, newTask])
        setEditingTaskIndex(tasks.length)
    }

    // Remove task
    const removeTask = (index: number) => {
        if (tasks.length <= 1) {
            setError('SOP must have at least one task')
            return
        }
        setTasks(prev => prev.filter((_, idx) => idx !== index))
        if (editingTaskIndex === index) {
            setEditingTaskIndex(Math.max(0, index - 1))
        } else if (editingTaskIndex !== null && editingTaskIndex > index) {
            setEditingTaskIndex(editingTaskIndex - 1)
        }
    }

    // Update task field
    const updateTask = (index: number, field: keyof Task, value: Task[keyof Task]) => {
        setTasks(prev => prev.map((task, idx) =>
            idx === index ? { ...task, [field]: value } : task
        ))
    }

    // Move task up
    const moveTaskUp = (index: number) => {
        if (index === 0) return
        setTasks(prev => {
            const newTasks = [...prev]
                ;[newTasks[index - 1], newTasks[index]] = [newTasks[index], newTasks[index - 1]]
            return newTasks
        })
        if (editingTaskIndex === index) setEditingTaskIndex(index - 1)
        else if (editingTaskIndex === index - 1) setEditingTaskIndex(index)
    }

    // Move task down
    const moveTaskDown = (index: number) => {
        if (index === tasks.length - 1) return
        setTasks(prev => {
            const newTasks = [...prev]
                ;[newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]]
            return newTasks
        })
        if (editingTaskIndex === index) setEditingTaskIndex(index + 1)
        else if (editingTaskIndex === index + 1) setEditingTaskIndex(index)
    }

    // Calculate total estimated time
    const totalEstimatedMinutes = tasks.reduce((acc, task) => acc + task.estimatedMinutes, 0)
    const totalEstimatedHours = (totalEstimatedMinutes / 60).toFixed(1)

    // Validate form
    const validateForm = (): string | null => {
        if (!sopName.trim()) return 'SOP name is required'
        if (!sopDescription.trim()) return 'SOP description is required'
        if (applicableBusinessTypes.length === 0) return 'Select at least one business type'
        if (tasks.length === 0) return 'Add at least one task'

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i]
            if (!task.title.trim()) return `Task ${i + 1}: Title is required`
            if (!task.instructions.trim()) return `Task ${i + 1}: Instructions are required`
            if (task.applicableBusinessTypes.length === 0) return `Task ${i + 1}: Select at least one business type`
        }

        return null
    }

    // Handle save SOP
    const handleSaveSOP = async () => {
        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Create new SOP template
            const newSOP: SOPTemplate = {
                id: `custom-${Date.now()}`,
                name: sopName,
                type: sopType,
                description: sopDescription,
                applicableTypes: applicableBusinessTypes,
                taskCount: tasks.length,
                estimatedHours: totalEstimatedHours,
                icon: sopIcon,
                isActive: true,
                usageCount: 0,
                isCustom: true,
                tasks: tasks.map(task => ({
                    title: task.title,
                    category: task.category,
                    time: task.estimatedMinutes,
                    required: task.isRequired
                }))
            }

            // Add to templates list
            setSOPTemplates(prev => [...prev, newSOP])

            // Reset form
            resetForm()
            setShowCreateModal(false)

            // Show success message
            setSuccessMessage(`✅ SOP "${sopName}" created successfully with ${tasks.length} tasks!`)
            setTimeout(() => setSuccessMessage(null), 5000)

        } catch (err) {
            console.error('Error creating SOP:', err)
            setError(err instanceof Error ? err.message : 'Failed to create SOP')
        } finally {
            setIsSubmitting(false)
        }
    }

    // Reset form
    const resetForm = () => {
        setSOPName('')
        setSOPDescription('')
        setSOPType('CUSTOM')
        setSOPIcon('📋')
        setApplicableBusinessTypes(['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'])
        setTasks([createEmptyTask()])
        setEditingTaskIndex(0)
        setError(null)
    }

    // Close modal
    const handleCloseModal = () => {
        setShowCreateModal(false)
        resetForm()
    }

    return (
        <>
            <Header
                title="SOP Templates"
                subtitle="Pre-built and custom workflow templates for local SEO tasks"
                actions={
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <span>+ Create Custom SOP</span>
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

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: selectedSOP ? '1fr 1fr' : '1fr',
                    gap: 'var(--spacing-6)'
                }}>
                    {/* SOP Templates Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: selectedSOP ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: 'var(--spacing-4)',
                        alignContent: 'start'
                    }}>
                        {sopTemplates.map(sop => (
                            <div
                                key={sop.id}
                                className="card"
                                onClick={() => setSelectedSOP(sop)}
                                style={{
                                    cursor: 'pointer',
                                    borderColor: selectedSOP?.id === sop.id ? 'var(--color-accent-primary)' : undefined,
                                    background: selectedSOP?.id === sop.id ? 'rgba(99, 102, 241, 0.05)' : undefined
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    marginBottom: 'var(--spacing-4)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                        <span style={{ fontSize: '32px' }}>{sop.icon}</span>
                                        <div>
                                            <h3 style={{
                                                fontSize: 'var(--font-size-lg)',
                                                fontWeight: 'var(--font-weight-semibold)',
                                                marginBottom: 'var(--spacing-1)'
                                            }}>
                                                {sop.name}
                                            </h3>
                                            <p style={{
                                                fontSize: 'var(--font-size-sm)',
                                                color: 'var(--color-text-muted)'
                                            }}>
                                                {sop.description}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                                        {sop.isCustom && (
                                            <span className="badge badge-warning">Custom</span>
                                        )}
                                        {sop.isActive && (
                                            <span className="badge badge-success">Active</span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                    {sop.applicableTypes.map(type => getBusinessTypeBadge(type))}
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: 'var(--spacing-3)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    <span>📋 {sop.taskCount} tasks</span>
                                    <span>⏱️ {sop.estimatedHours} hours</span>
                                    <span>📊 Used {sop.usageCount}x</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SOP Detail Panel */}
                    {selectedSOP && (
                        <div className="card" style={{
                            position: 'sticky',
                            top: 'calc(var(--header-height) + var(--spacing-8))',
                            maxHeight: 'calc(100vh - var(--header-height) - var(--spacing-16))',
                            overflow: 'auto'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 'var(--spacing-6)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                    <span style={{ fontSize: '40px' }}>{selectedSOP.icon}</span>
                                    <div>
                                        <h2 style={{
                                            fontSize: 'var(--font-size-2xl)',
                                            fontWeight: 'var(--font-weight-bold)',
                                            marginBottom: 'var(--spacing-1)'
                                        }}>
                                            {selectedSOP.name}
                                        </h2>
                                        <p style={{ color: 'var(--color-text-muted)' }}>
                                            {selectedSOP.description}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => setSelectedSOP(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 'var(--spacing-4)',
                                marginBottom: 'var(--spacing-6)'
                            }}>
                                <div style={{
                                    flex: 1,
                                    padding: 'var(--spacing-4)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: 'var(--font-size-2xl)',
                                        fontWeight: 'var(--font-weight-bold)'
                                    }}>
                                        {selectedSOP.taskCount}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        Tasks
                                    </div>
                                </div>
                                <div style={{
                                    flex: 1,
                                    padding: 'var(--spacing-4)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: 'var(--font-size-2xl)',
                                        fontWeight: 'var(--font-weight-bold)'
                                    }}>
                                        {selectedSOP.estimatedHours}h
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        Est. Time
                                    </div>
                                </div>
                                <div style={{
                                    flex: 1,
                                    padding: 'var(--spacing-4)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        fontSize: 'var(--font-size-2xl)',
                                        fontWeight: 'var(--font-weight-bold)'
                                    }}>
                                        {selectedSOP.usageCount}
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        Times Used
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                <h4 style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: 'var(--spacing-2)'
                                }}>
                                    Applicable Business Types
                                </h4>
                                <div>
                                    {selectedSOP.applicableTypes.map(type => getBusinessTypeBadge(type))}
                                </div>
                            </div>

                            <div>
                                <h4 style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    marginBottom: 'var(--spacing-3)'
                                }}>
                                    Task Checklist
                                </h4>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                                    {selectedSOP.tasks.map((task, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: 'var(--spacing-3) var(--spacing-4)',
                                                background: 'var(--color-bg-tertiary)',
                                                borderRadius: 'var(--radius-lg)',
                                                borderLeft: `3px solid ${getCategoryColor(task.category)}`
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                                <span style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--color-text-muted)',
                                                    width: '20px'
                                                }}>
                                                    {index + 1}.
                                                </span>
                                                <div>
                                                    <div style={{
                                                        fontSize: 'var(--font-size-sm)',
                                                        fontWeight: 'var(--font-weight-medium)'
                                                    }}>
                                                        {task.title}
                                                    </div>
                                                    <div style={{
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: getCategoryColor(task.category)
                                                    }}>
                                                        {task.category}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-3)'
                                            }}>
                                                <span style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--color-text-muted)'
                                                }}>
                                                    {task.time} min
                                                </span>
                                                {task.required ? (
                                                    <span className="badge badge-error" style={{ fontSize: '10px' }}>Required</span>
                                                ) : (
                                                    <span className="badge" style={{
                                                        fontSize: '10px',
                                                        background: 'var(--color-bg-hover)',
                                                        color: 'var(--color-text-muted)'
                                                    }}>Optional</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 'var(--spacing-3)',
                                marginTop: 'var(--spacing-6)'
                            }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }}>
                                    ✏️ Edit Template
                                </button>
                                <button className="btn btn-primary" style={{ flex: 1 }}>
                                    🚀 Use Template
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create SOP Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Create Custom SOP</h3>
                            <button className="modal-close" onClick={handleCloseModal}>✕</button>
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

                            {/* SOP Metadata Section */}
                            <div style={{ marginBottom: 'var(--spacing-6)' }}>
                                <h4 style={{
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    marginBottom: 'var(--spacing-3)',
                                    color: 'var(--color-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    SOP Details
                                </h4>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                                    <div className="form-group">
                                        <label className="form-label">SOP Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., Holiday Hours Update"
                                            value={sopName}
                                            onChange={e => setSOPName(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Workflow Type</label>
                                        <select
                                            className="form-select"
                                            value={sopType}
                                            onChange={e => setSOPType(e.target.value)}
                                        >
                                            {sopTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Description *</label>
                                    <textarea
                                        className="form-input"
                                        rows={2}
                                        placeholder="Brief description of what this SOP accomplishes..."
                                        value={sopDescription}
                                        onChange={e => setSOPDescription(e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Applicable Business Types *</label>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap' }}>
                                        {['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'].map(type => (
                                            <label key={type} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--spacing-2)',
                                                padding: 'var(--spacing-2) var(--spacing-3)',
                                                background: applicableBusinessTypes.includes(type)
                                                    ? 'rgba(99, 102, 241, 0.1)'
                                                    : 'var(--color-bg-tertiary)',
                                                border: `1px solid ${applicableBusinessTypes.includes(type)
                                                    ? 'var(--color-accent-primary)'
                                                    : 'var(--color-border)'}`,
                                                borderRadius: 'var(--radius-lg)',
                                                cursor: 'pointer'
                                            }}>
                                                <input
                                                    type="checkbox"
                                                    checked={applicableBusinessTypes.includes(type)}
                                                    onChange={() => toggleBusinessType(type)}
                                                    style={{ display: 'none' }}
                                                />
                                                {getBusinessTypeBadge(type)}
                                                {applicableBusinessTypes.includes(type) && <span>✓</span>}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div style={{
                                    padding: 'var(--spacing-3)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)',
                                    display: 'flex',
                                    gap: 'var(--spacing-6)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    <span>📋 <strong>{tasks.length}</strong> tasks</span>
                                    <span>⏱️ <strong>{totalEstimatedHours}</strong> hours estimated</span>
                                </div>
                            </div>

                            {/* Tasks Section */}
                            <div>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 'var(--spacing-3)'
                                }}>
                                    <h4 style={{
                                        fontSize: 'var(--font-size-sm)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        color: 'var(--color-text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em'
                                    }}>
                                        Tasks ({tasks.length})
                                    </h4>
                                    <button className="btn btn-secondary btn-sm" onClick={addTask}>
                                        + Add Task
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--spacing-4)' }}>
                                    {/* Task List */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 'var(--spacing-2)',
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}>
                                        {tasks.map((task, index) => (
                                            <div
                                                key={task.id}
                                                onClick={() => setEditingTaskIndex(index)}
                                                style={{
                                                    padding: 'var(--spacing-3)',
                                                    background: editingTaskIndex === index
                                                        ? 'rgba(99, 102, 241, 0.1)'
                                                        : 'var(--color-bg-tertiary)',
                                                    border: `1px solid ${editingTaskIndex === index
                                                        ? 'var(--color-accent-primary)'
                                                        : 'var(--color-border)'}`,
                                                    borderRadius: 'var(--radius-lg)',
                                                    cursor: 'pointer',
                                                    borderLeft: `3px solid ${getCategoryColor(task.category)}`
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--spacing-2)',
                                                    marginBottom: 'var(--spacing-1)'
                                                }}>
                                                    <span style={{
                                                        fontSize: 'var(--font-size-xs)',
                                                        color: 'var(--color-text-muted)'
                                                    }}>
                                                        {index + 1}.
                                                    </span>
                                                    <span style={{
                                                        fontSize: 'var(--font-size-sm)',
                                                        fontWeight: 'var(--font-weight-medium)',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {task.title || 'Untitled Task'}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--color-text-muted)'
                                                }}>
                                                    <span>{task.estimatedMinutes} min</span>
                                                    <div style={{ display: 'flex', gap: 'var(--spacing-1)' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveTaskUp(index) }}
                                                            disabled={index === 0}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                                                opacity: index === 0 ? 0.3 : 1,
                                                                padding: '2px'
                                                            }}
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); moveTaskDown(index) }}
                                                            disabled={index === tasks.length - 1}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: index === tasks.length - 1 ? 'not-allowed' : 'pointer',
                                                                opacity: index === tasks.length - 1 ? 0.3 : 1,
                                                                padding: '2px'
                                                            }}
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Task Editor */}
                                    {editingTaskIndex !== null && tasks[editingTaskIndex] && (
                                        <div style={{
                                            padding: 'var(--spacing-4)',
                                            background: 'var(--color-bg-tertiary)',
                                            borderRadius: 'var(--radius-lg)',
                                            maxHeight: '400px',
                                            overflowY: 'auto'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: 'var(--spacing-4)'
                                            }}>
                                                <h5 style={{
                                                    fontWeight: 'var(--font-weight-semibold)'
                                                }}>
                                                    Task {editingTaskIndex + 1}
                                                </h5>
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => removeTask(editingTaskIndex)}
                                                    style={{ color: 'var(--color-error)' }}
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Task Title *</label>
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="e.g., Update GBP Hours"
                                                    value={tasks[editingTaskIndex].title}
                                                    onChange={e => updateTask(editingTaskIndex, 'title', e.target.value)}
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Instructions *</label>
                                                <textarea
                                                    className="form-input"
                                                    rows={3}
                                                    placeholder="Step-by-step instructions for completing this task..."
                                                    value={tasks[editingTaskIndex].instructions}
                                                    onChange={e => updateTask(editingTaskIndex, 'instructions', e.target.value)}
                                                />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Category</label>
                                                    <select
                                                        className="form-select"
                                                        value={tasks[editingTaskIndex].category}
                                                        onChange={e => updateTask(editingTaskIndex, 'category', e.target.value)}
                                                    >
                                                        {taskCategories.map(cat => (
                                                            <option key={cat} value={cat}>{cat}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Evidence Required</label>
                                                    <select
                                                        className="form-select"
                                                        value={tasks[editingTaskIndex].evidenceType}
                                                        onChange={e => updateTask(editingTaskIndex, 'evidenceType', e.target.value)}
                                                    >
                                                        {evidenceTypes.map(type => (
                                                            <option key={type.value} value={type.value}>{type.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                                                <div className="form-group">
                                                    <label className="form-label">Est. Time (minutes)</label>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        min="1"
                                                        value={tasks[editingTaskIndex].estimatedMinutes}
                                                        onChange={e => updateTask(editingTaskIndex, 'estimatedMinutes', parseInt(e.target.value) || 15)}
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label className="form-label">Depends On</label>
                                                    <select
                                                        className="form-select"
                                                        value=""
                                                        onChange={e => {
                                                            if (e.target.value) {
                                                                const currentDeps = tasks[editingTaskIndex].dependsOnTaskIds
                                                                if (!currentDeps.includes(e.target.value)) {
                                                                    updateTask(editingTaskIndex, 'dependsOnTaskIds', [...currentDeps, e.target.value])
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Add dependency...</option>
                                                        {tasks.slice(0, editingTaskIndex).map((t, idx) => (
                                                            <option key={t.id} value={t.id} disabled={tasks[editingTaskIndex].dependsOnTaskIds.includes(t.id)}>
                                                                Task {idx + 1}: {t.title || 'Untitled'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {tasks[editingTaskIndex].dependsOnTaskIds.length > 0 && (
                                                        <div style={{
                                                            marginTop: 'var(--spacing-2)',
                                                            display: 'flex',
                                                            flexWrap: 'wrap',
                                                            gap: 'var(--spacing-1)'
                                                        }}>
                                                            {tasks[editingTaskIndex].dependsOnTaskIds.map(depId => {
                                                                const depIdx = tasks.findIndex(t => t.id === depId)
                                                                return (
                                                                    <span key={depId} className="badge" style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 'var(--spacing-1)'
                                                                    }}>
                                                                        Task {depIdx + 1}
                                                                        <button
                                                                            onClick={() => updateTask(editingTaskIndex, 'dependsOnTaskIds',
                                                                                tasks[editingTaskIndex].dependsOnTaskIds.filter(id => id !== depId)
                                                                            )}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                cursor: 'pointer',
                                                                                padding: 0,
                                                                                fontSize: '12px'
                                                                            }}
                                                                        >
                                                                            ✕
                                                                        </button>
                                                                    </span>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-3)' }}>
                                                <label style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--spacing-2)',
                                                    cursor: 'pointer'
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={tasks[editingTaskIndex].isRequired}
                                                        onChange={e => updateTask(editingTaskIndex, 'isRequired', e.target.checked)}
                                                    />
                                                    <span>Required Task</span>
                                                </label>
                                                <label style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--spacing-2)',
                                                    cursor: 'pointer'
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={tasks[editingTaskIndex].requiresOwnerApproval}
                                                        onChange={e => updateTask(editingTaskIndex, 'requiresOwnerApproval', e.target.checked)}
                                                    />
                                                    <span>Requires Owner Approval</span>
                                                </label>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label">Applicable Business Types</label>
                                                <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                                                    {['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'].map(type => (
                                                        <label key={type} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 'var(--spacing-2)',
                                                            padding: 'var(--spacing-1) var(--spacing-2)',
                                                            background: tasks[editingTaskIndex].applicableBusinessTypes.includes(type)
                                                                ? 'rgba(99, 102, 241, 0.1)'
                                                                : 'var(--color-bg-secondary)',
                                                            border: `1px solid ${tasks[editingTaskIndex].applicableBusinessTypes.includes(type)
                                                                ? 'var(--color-accent-primary)'
                                                                : 'var(--color-border)'}`,
                                                            borderRadius: 'var(--radius-md)',
                                                            cursor: 'pointer',
                                                            fontSize: 'var(--font-size-xs)'
                                                        }}>
                                                            <input
                                                                type="checkbox"
                                                                checked={tasks[editingTaskIndex].applicableBusinessTypes.includes(type)}
                                                                onChange={() => toggleTaskBusinessType(editingTaskIndex, type)}
                                                                style={{ display: 'none' }}
                                                            />
                                                            {type.replace('_', ' ')}
                                                            {tasks[editingTaskIndex].applicableBusinessTypes.includes(type) && ' ✓'}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                onClick={handleSaveSOP}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span style={{ marginRight: 'var(--spacing-2)' }}>⏳</span>
                                        Saving...
                                    </>
                                ) : (
                                    '💾 Save SOP'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
