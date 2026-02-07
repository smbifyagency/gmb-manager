'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'

interface Client {
    id: string
    name: string
    businessType: string
    locationsCount: number
    activeWorkflows: number
    completionRate: number
    createdAt: string
}

// Initial mock client data
const initialClients: Client[] = [
    {
        id: '1',
        name: 'Rank & Rent Portfolio',
        businessType: 'RANK_RENT',
        locationsCount: 12,
        activeWorkflows: 5,
        completionRate: 78,
        createdAt: '2024-01-15'
    },
    {
        id: '2',
        name: "Joe's Restaurants",
        businessType: 'TRADITIONAL',
        locationsCount: 4,
        activeWorkflows: 2,
        completionRate: 92,
        createdAt: '2024-02-01'
    },
    {
        id: '3',
        name: 'AutoCare Inc.',
        businessType: 'TRADITIONAL',
        locationsCount: 3,
        activeWorkflows: 1,
        completionRate: 85,
        createdAt: '2024-02-10'
    },
    {
        id: '4',
        name: 'Sunrise Dental LLC',
        businessType: 'GMB_ONLY',
        locationsCount: 1,
        activeWorkflows: 1,
        completionRate: 95,
        createdAt: '2024-03-01'
    },
    {
        id: '5',
        name: 'Miami Services Group',
        businessType: 'RANK_RENT',
        locationsCount: 8,
        activeWorkflows: 3,
        completionRate: 72,
        createdAt: '2024-03-15'
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

export default function ClientsPage() {
    const { hasPermission } = useAuth()
    const [clients, setClients] = useState<Client[]>(initialClients)
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        businessType: '',
        notes: ''
    })

    const filteredClients = clients.filter(client => {
        if (filter === 'all') return true
        return client.businessType === filter
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleCreateClient = async () => {
        // Validation
        if (!formData.name.trim()) {
            setError('Client name is required')
            return
        }
        if (!formData.businessType) {
            setError('Please select a business type')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            // TODO: Replace with actual API call
            // const response = await fetch('/api/clients', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(formData)
            // })

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            // Create new client (mock)
            const newClient: Client = {
                id: `client-${Date.now()}`,
                name: formData.name,
                businessType: formData.businessType,
                locationsCount: 0,
                activeWorkflows: 0,
                completionRate: 0,
                createdAt: new Date().toISOString().split('T')[0]
            }

            setClients(prev => [...prev, newClient])
            setShowModal(false)
            setFormData({ name: '', businessType: '', notes: '' })
        } catch {
            setError('Failed to create client. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setFormData({ name: '', businessType: '', notes: '' })
        setError('')
    }

    // Handle Escape key to close modal
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCloseModal()
        }
    }

    const canCreateClient = hasPermission(PERMISSIONS.CLIENT_CREATE)

    return (
        <>
            <Header
                title="Clients"
                subtitle="Manage your agency clients and their business profiles"
                actions={
                    canCreateClient && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <span>+ Add Client</span>
                        </button>
                    )
                }
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
                        All ({clients.length})
                    </button>
                    <button
                        className={`btn ${filter === 'RANK_RENT' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('RANK_RENT')}
                    >
                        Rank & Rent ({clients.filter(c => c.businessType === 'RANK_RENT').length})
                    </button>
                    <button
                        className={`btn ${filter === 'TRADITIONAL' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('TRADITIONAL')}
                    >
                        Traditional ({clients.filter(c => c.businessType === 'TRADITIONAL').length})
                    </button>
                    <button
                        className={`btn ${filter === 'GMB_ONLY' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('GMB_ONLY')}
                    >
                        GMB Only ({clients.filter(c => c.businessType === 'GMB_ONLY').length})
                    </button>
                </div>

                {/* Clients Table */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Client Name</th>
                                <th>Business Type</th>
                                <th>Locations</th>
                                <th>Active Workflows</th>
                                <th>Completion Rate</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map(client => (
                                <tr key={client.id}>
                                    <td>
                                        <Link
                                            href={`/clients/${client.id}`}
                                            style={{
                                                fontWeight: 'var(--font-weight-medium)',
                                                color: 'var(--color-text-primary)'
                                            }}
                                        >
                                            {client.name}
                                        </Link>
                                    </td>
                                    <td>{getBusinessTypeBadge(client.businessType)}</td>
                                    <td>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-2)'
                                        }}>
                                            📍 {client.locationsCount}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--spacing-2)'
                                        }}>
                                            🔄 {client.activeWorkflows}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                            <div className="progress-bar" style={{ width: '80px' }}>
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${client.completionRate}%` }}
                                                />
                                            </div>
                                            <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                                {client.completionRate}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                            <Link
                                                href={`/clients/${client.id}`}
                                                className="btn btn-ghost btn-sm"
                                            >
                                                View
                                            </Link>
                                            {hasPermission(PERMISSIONS.CLIENT_UPDATE) && (
                                                <Link
                                                    href={`/clients/${client.id}/edit`}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Client Modal */}
            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={handleCloseModal}
                    onKeyDown={handleKeyDown}
                    role="dialog"
                    aria-modal="true"
                    tabIndex={-1}
                >
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Client</h3>
                            <button
                                className="modal-close"
                                onClick={handleCloseModal}
                                aria-label="Close modal"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            {error && (
                                <div style={{
                                    padding: 'var(--spacing-3)',
                                    background: 'var(--color-error-bg)',
                                    border: '1px solid var(--color-error)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-error)',
                                    marginBottom: 'var(--spacing-4)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    {error}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Client Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Enter client name..."
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    autoFocus
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Business Type *</label>
                                <select
                                    name="businessType"
                                    className="form-select"
                                    value={formData.businessType}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select business type...</option>
                                    <option value="RANK_RENT">Rank & Rent - SEO-owned lead gen sites</option>
                                    <option value="TRADITIONAL">Traditional - Website + Google Business Profile</option>
                                    <option value="GMB_ONLY">GMB Only - Google Maps presence only</option>
                                </select>
                                <p className="form-helper">
                                    This determines which tasks are included in workflows.
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    className="form-textarea"
                                    placeholder="Add any notes about this client..."
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                />
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
                                onClick={handleCreateClient}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Client'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
