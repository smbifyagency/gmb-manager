'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { PERMISSIONS } from '@/lib/permissions'

interface Location {
    id: string
    name: string
    client: string
    clientId: string
    businessType: string
    address: string
    phone: string
    gbpStatus: string
    hasWebsite: boolean
    activeWorkflows: number
    completedWorkflows: number
    lastUpdated: string
}

// Initial mock locations data
const initialLocations: Location[] = [
    {
        id: '1',
        name: 'Tampa Bay Plumbers',
        client: 'Rank & Rent Portfolio',
        clientId: '1',
        businessType: 'RANK_RENT',
        address: '123 Main St, Tampa, FL 33601',
        phone: '(813) 555-0123',
        gbpStatus: 'VERIFIED',
        hasWebsite: true,
        activeWorkflows: 2,
        completedWorkflows: 1,
        lastUpdated: '2024-03-18'
    },
    {
        id: '2',
        name: 'Miami Roofing Masters',
        client: 'Rank & Rent Portfolio',
        clientId: '1',
        businessType: 'RANK_RENT',
        address: '456 Ocean Dr, Miami, FL 33139',
        phone: '(305) 555-0456',
        gbpStatus: 'SUSPENDED',
        hasWebsite: true,
        activeWorkflows: 1,
        completedWorkflows: 0,
        lastUpdated: '2024-03-15'
    },
    {
        id: '3',
        name: "Joe's Pizza Downtown",
        client: "Joe's Restaurants",
        clientId: '2',
        businessType: 'TRADITIONAL',
        address: '789 Broadway, Orlando, FL 32801',
        phone: '(407) 555-0789',
        gbpStatus: 'VERIFIED',
        hasWebsite: true,
        activeWorkflows: 1,
        completedWorkflows: 3,
        lastUpdated: '2024-03-20'
    },
    {
        id: '4',
        name: 'Sunrise Dental',
        client: 'Sunrise Dental LLC',
        clientId: '4',
        businessType: 'GMB_ONLY',
        address: '321 Health Blvd, Jacksonville, FL 32099',
        phone: '(904) 555-0321',
        gbpStatus: 'VERIFIED',
        hasWebsite: false,
        activeWorkflows: 1,
        completedWorkflows: 2,
        lastUpdated: '2024-03-19'
    },
    {
        id: '5',
        name: 'Orlando Electricians',
        client: 'Rank & Rent Portfolio',
        clientId: '1',
        businessType: 'RANK_RENT',
        address: '555 Power Lane, Orlando, FL 32803',
        phone: '(407) 555-0555',
        gbpStatus: 'VERIFIED',
        hasWebsite: true,
        activeWorkflows: 0,
        completedWorkflows: 2,
        lastUpdated: '2024-03-01'
    },
    {
        id: '6',
        name: 'Fort Lauderdale HVAC',
        client: 'Miami Services Group',
        clientId: '5',
        businessType: 'RANK_RENT',
        address: '888 Cool St, Fort Lauderdale, FL 33301',
        phone: '(954) 555-0888',
        gbpStatus: 'PENDING_VERIFICATION',
        hasWebsite: true,
        activeWorkflows: 1,
        completedWorkflows: 0,
        lastUpdated: '2024-03-17'
    }
]

const mockClients = [
    { id: '1', name: 'Rank & Rent Portfolio' },
    { id: '2', name: "Joe's Restaurants" },
    { id: '4', name: 'Sunrise Dental LLC' },
    { id: '5', name: 'Miami Services Group' }
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

function getGBPStatusBadge(status: string) {
    switch (status) {
        case 'VERIFIED':
            return <span className="badge badge-success">✓ Verified</span>
        case 'PENDING_VERIFICATION':
            return <span className="badge badge-warning">⏳ Pending</span>
        case 'SUSPENDED':
            return <span className="badge badge-error">⚠️ Suspended</span>
        case 'NOT_CLAIMED':
            return <span className="badge" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>Not Claimed</span>
        default:
            return null
    }
}

export default function LocationsPage() {
    const router = useRouter()
    const { hasPermission } = useAuth()
    const [locations, setLocations] = useState<Location[]>(initialLocations)
    const [filter, setFilter] = useState('all')
    const [gbpFilter, setGbpFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    // Form state
    const [formData, setFormData] = useState({
        clientId: '',
        name: '',
        phone: '',
        hasWebsite: 'yes',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        gbpUrl: ''
    })

    const filteredLocations = locations.filter(location => {
        const typeMatch = filter === 'all' || location.businessType === filter
        const gbpMatch = gbpFilter === 'all' || location.gbpStatus === gbpFilter
        return typeMatch && gbpMatch
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        setError('')
    }

    const handleAddLocation = async () => {
        // Validation
        if (!formData.clientId) {
            setError('Please select a client')
            return
        }
        if (!formData.name.trim()) {
            setError('Business name is required')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500))

            const selectedClient = mockClients.find(c => c.id === formData.clientId)

            // Create new location (mock)
            const newLocation: Location = {
                id: `loc-${Date.now()}`,
                name: formData.name,
                client: selectedClient?.name || 'Unknown',
                clientId: formData.clientId,
                businessType: 'TRADITIONAL', // Would come from client in real app
                address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
                phone: formData.phone,
                gbpStatus: formData.gbpUrl ? 'VERIFIED' : 'NOT_CLAIMED',
                hasWebsite: formData.hasWebsite === 'yes',
                activeWorkflows: 0,
                completedWorkflows: 0,
                lastUpdated: new Date().toISOString().split('T')[0]
            }

            setLocations(prev => [...prev, newLocation])
            setShowModal(false)
            resetForm()
        } catch {
            setError('Failed to add location. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleStartWorkflow = (locationId: string) => {
        router.push(`/workflows?locationId=${locationId}`)
    }

    const resetForm = () => {
        setFormData({
            clientId: '',
            name: '',
            phone: '',
            hasWebsite: 'yes',
            address: '',
            city: '',
            state: '',
            zipCode: '',
            gbpUrl: ''
        })
        setError('')
    }

    const handleCloseModal = () => {
        setShowModal(false)
        resetForm()
    }

    const canCreateLocation = hasPermission(PERMISSIONS.LOCATION_CREATE)
    const canStartWorkflow = hasPermission(PERMISSIONS.WORKFLOW_START)

    return (
        <>
            <Header
                title="Locations"
                subtitle="Manage business locations and their local SEO status"
                actions={
                    canCreateLocation && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <span>+ Add Location</span>
                        </button>
                    )
                }
            />

            <div className="page-content">
                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon primary">📍</div>
                        <div className="stat-value">{locations.length}</div>
                        <div className="stat-label">Total Locations</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon success">✅</div>
                        <div className="stat-value">{locations.filter(l => l.gbpStatus === 'VERIFIED').length}</div>
                        <div className="stat-label">Verified GBPs</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon warning">⏳</div>
                        <div className="stat-value">{locations.filter(l => l.gbpStatus === 'PENDING_VERIFICATION').length}</div>
                        <div className="stat-label">Pending Verification</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon error">🚨</div>
                        <div className="stat-value">{locations.filter(l => l.gbpStatus === 'SUSPENDED').length}</div>
                        <div className="stat-label">Suspended</div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-6)',
                    marginBottom: 'var(--spacing-6)',
                    flexWrap: 'wrap'
                }}>
                    <div>
                        <label style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--spacing-2)',
                            display: 'block'
                        }}>
                            Business Type
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                            <button
                                className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`btn btn-sm ${filter === 'RANK_RENT' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilter('RANK_RENT')}
                            >
                                Rank & Rent
                            </button>
                            <button
                                className={`btn btn-sm ${filter === 'TRADITIONAL' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilter('TRADITIONAL')}
                            >
                                Traditional
                            </button>
                            <button
                                className={`btn btn-sm ${filter === 'GMB_ONLY' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setFilter('GMB_ONLY')}
                            >
                                GMB Only
                            </button>
                        </div>
                    </div>

                    <div>
                        <label style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--spacing-2)',
                            display: 'block'
                        }}>
                            GBP Status
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                            <button
                                className={`btn btn-sm ${gbpFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setGbpFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`btn btn-sm ${gbpFilter === 'VERIFIED' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setGbpFilter('VERIFIED')}
                            >
                                Verified
                            </button>
                            <button
                                className={`btn btn-sm ${gbpFilter === 'SUSPENDED' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setGbpFilter('SUSPENDED')}
                            >
                                Suspended
                            </button>
                        </div>
                    </div>
                </div>

                {/* Locations Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: 'var(--spacing-4)'
                }}>
                    {filteredLocations.map(location => (
                        <div key={location.id} className="card">
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                marginBottom: 'var(--spacing-3)'
                            }}>
                                <div>
                                    <h3 style={{
                                        fontSize: 'var(--font-size-lg)',
                                        fontWeight: 'var(--font-weight-semibold)',
                                        marginBottom: 'var(--spacing-1)'
                                    }}>
                                        {location.name}
                                    </h3>
                                    <p style={{
                                        fontSize: 'var(--font-size-sm)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {location.client}
                                    </p>
                                </div>
                                {getGBPStatusBadge(location.gbpStatus)}
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 'var(--spacing-2)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                {getBusinessTypeBadge(location.businessType)}
                                {location.hasWebsite && (
                                    <span className="badge" style={{
                                        background: 'var(--color-bg-tertiary)',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        🌐 Website
                                    </span>
                                )}
                            </div>

                            <div style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-muted)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-2)',
                                    marginBottom: 'var(--spacing-1)'
                                }}>
                                    📍 {location.address}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-2)'
                                }}>
                                    📞 {location.phone}
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: 'var(--spacing-3)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                marginBottom: 'var(--spacing-4)',
                                fontSize: 'var(--font-size-sm)'
                            }}>
                                <span>🔄 {location.activeWorkflows} active</span>
                                <span>✅ {location.completedWorkflows} completed</span>
                            </div>

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    Updated: {location.lastUpdated}
                                </span>
                                <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                    <Link
                                        href={`/locations/${location.id}`}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        View
                                    </Link>
                                    {canStartWorkflow && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => handleStartWorkflow(location.id)}
                                        >
                                            Start Workflow
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Location Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Add New Location</h3>
                            <button
                                className="modal-close"
                                onClick={handleCloseModal}
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
                                <label className="form-label">Client *</label>
                                <select
                                    name="clientId"
                                    className="form-select"
                                    value={formData.clientId}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select client...</option>
                                    {mockClients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Business Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Enter business name..."
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        placeholder="(555) 555-0000"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Has Website?</label>
                                    <select
                                        name="hasWebsite"
                                        className="form-select"
                                        value={formData.hasWebsite}
                                        onChange={handleInputChange}
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    className="form-input"
                                    placeholder="Street address..."
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--spacing-4)' }}>
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        className="form-input"
                                        placeholder="City"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        className="form-input"
                                        placeholder="FL"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">ZIP</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        className="form-input"
                                        placeholder="33601"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">GBP URL (Optional)</label>
                                <input
                                    type="url"
                                    name="gbpUrl"
                                    className="form-input"
                                    placeholder="https://business.google.com/..."
                                    value={formData.gbpUrl}
                                    onChange={handleInputChange}
                                />
                                <p className="form-helper">
                                    Add the Google Business Profile URL if already claimed
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
                                onClick={handleAddLocation}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Location'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
