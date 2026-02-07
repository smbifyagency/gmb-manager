'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Link from 'next/link'

// Mock data
const mockLocations = [
    { id: '1', name: 'Tampa Bay Plumbers', client: 'Rank & Rent Portfolio', businessType: 'RANK_RENT' },
    { id: '2', name: 'Miami Roofing Masters', client: 'Rank & Rent Portfolio', businessType: 'RANK_RENT' },
    { id: '3', name: "Joe's Pizza Downtown", client: "Joe's Restaurants", businessType: 'TRADITIONAL' },
    { id: '4', name: 'Sunrise Dental', client: 'Sunrise Dental LLC', businessType: 'GMB_ONLY' },
]

const sopTemplates = [
    {
        id: 'new-location',
        name: 'New Location Setup',
        description: 'Complete setup for a new business location including GBP optimization',
        taskCount: 12,
        estimatedDays: 7,
        applicableTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY']
    },
    {
        id: 'suspension',
        name: 'GBP Suspension Recovery',
        description: 'Step-by-step process to recover a suspended Google Business Profile',
        taskCount: 8,
        estimatedDays: 3,
        applicableTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY']
    },
    {
        id: 'rebrand',
        name: 'Business Rebrand',
        description: 'Update all listings and profiles for a business rebrand',
        taskCount: 10,
        estimatedDays: 5,
        applicableTypes: ['TRADITIONAL']
    },
    {
        id: 'maintenance',
        name: 'Monthly Maintenance',
        description: 'Recurring tasks to keep GBP optimized and active',
        taskCount: 6,
        estimatedDays: 30,
        applicableTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY']
    }
]

function WorkflowNewContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preselectedLocationId = searchParams.get('locationId')

    const [selectedLocation, setSelectedLocation] = useState(preselectedLocationId || '')
    const [selectedSOP, setSelectedSOP] = useState('')
    const [priority, setPriority] = useState('MEDIUM')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Get business type from selected location
    const selectedLocationData = mockLocations.find(l => l.id === selectedLocation)
    const businessType = selectedLocationData?.businessType || ''

    // Filter SOPs based on business type
    const applicableSOPs = businessType
        ? sopTemplates.filter(sop => sop.applicableTypes.includes(businessType))
        : sopTemplates

    useEffect(() => {
        // Reset SOP selection if it's no longer applicable
        if (selectedSOP && !applicableSOPs.find(s => s.id === selectedSOP)) {
            setSelectedSOP('')
        }
    }, [businessType, selectedSOP, applicableSOPs])

    const handleSubmit = async () => {
        if (!selectedLocation) {
            setError('Please select a location')
            return
        }
        if (!selectedSOP) {
            setError('Please select an SOP template')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            const response = await fetch('/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locationId: selectedLocation,
                    sopTemplateId: selectedSOP,
                    priority
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to create workflow')
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/workflows')
            }, 1500)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create workflow')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <>
                <Header title="Start New Workflow" subtitle="" />
                <div className="page-content">
                    <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                        <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-4)' }}>✅</div>
                        <h2 style={{ marginBottom: 'var(--spacing-2)' }}>Workflow Created!</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Redirecting to workflows...
                        </p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Header
                title="Start New Workflow"
                subtitle="Select a location and SOP template to begin"
                actions={
                    <Link href="/workflows" className="btn btn-secondary">
                        Cancel
                    </Link>
                }
            />

            <div className="page-content">
                {error && (
                    <div style={{
                        padding: 'var(--spacing-3)',
                        background: 'var(--color-error-bg)',
                        border: '1px solid var(--color-error)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-error)',
                        marginBottom: 'var(--spacing-6)',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)' }}>
                    {/* Left Column - Configuration */}
                    <div>
                        <div className="card" style={{ marginBottom: 'var(--spacing-4)' }}>
                            <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 'var(--font-weight-semibold)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                1. Select Location
                            </h3>

                            <div className="form-group">
                                <select
                                    className="form-select"
                                    value={selectedLocation}
                                    onChange={(e) => {
                                        setSelectedLocation(e.target.value)
                                        setError('')
                                    }}
                                >
                                    <option value="">Choose a location...</option>
                                    {mockLocations.map(location => (
                                        <option key={location.id} value={location.id}>
                                            {location.name} - {location.client}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {selectedLocationData && (
                                <div style={{
                                    padding: 'var(--spacing-3)',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    <div style={{ marginBottom: 'var(--spacing-1)' }}>
                                        <strong>Client:</strong> {selectedLocationData.client}
                                    </div>
                                    <div>
                                        <strong>Type:</strong> {selectedLocationData.businessType.replace('_', ' ')}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="card" style={{ marginBottom: 'var(--spacing-4)' }}>
                            <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 'var(--font-weight-semibold)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                2. Select SOP Template
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                                {applicableSOPs.map(sop => (
                                    <label
                                        key={sop.id}
                                        style={{
                                            padding: 'var(--spacing-4)',
                                            border: selectedSOP === sop.id
                                                ? '2px solid var(--color-accent-primary)'
                                                : '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-lg)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)' }}>
                                            <input
                                                type="radio"
                                                name="sop"
                                                value={sop.id}
                                                checked={selectedSOP === sop.id}
                                                onChange={(e) => {
                                                    setSelectedSOP(e.target.value)
                                                    setError('')
                                                }}
                                                style={{ marginTop: '4px' }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    fontWeight: 'var(--font-weight-semibold)',
                                                    marginBottom: 'var(--spacing-1)'
                                                }}>
                                                    {sop.name}
                                                </div>
                                                <div style={{
                                                    fontSize: 'var(--font-size-sm)',
                                                    color: 'var(--color-text-muted)',
                                                    marginBottom: 'var(--spacing-2)'
                                                }}>
                                                    {sop.description}
                                                </div>
                                                <div style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    color: 'var(--color-text-muted)'
                                                }}>
                                                    📋 {sop.taskCount} tasks • ⏱️ ~{sop.estimatedDays} days
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 'var(--font-weight-semibold)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                3. Set Priority
                            </h3>

                            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => (
                                    <button
                                        key={p}
                                        className={`btn ${priority === p ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => setPriority(p)}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div>
                        <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + var(--spacing-8))' }}>
                            <h3 style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 'var(--font-weight-semibold)',
                                marginBottom: 'var(--spacing-4)'
                            }}>
                                Summary
                            </h3>

                            {selectedLocation && selectedSOP ? (
                                <>
                                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: 'var(--spacing-1)'
                                        }}>
                                            Location
                                        </div>
                                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                            {selectedLocationData?.name}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: 'var(--spacing-1)'
                                        }}>
                                            SOP Template
                                        </div>
                                        <div style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                            {sopTemplates.find(s => s.id === selectedSOP)?.name}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: 'var(--spacing-4)' }}>
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)',
                                            marginBottom: 'var(--spacing-1)'
                                        }}>
                                            Priority
                                        </div>
                                        <span className={`badge ${priority === 'CRITICAL' ? 'badge-error' :
                                                priority === 'HIGH' ? 'badge-warning' :
                                                    priority === 'MEDIUM' ? 'badge-primary' : 'badge-info'
                                            }`}>
                                            {priority}
                                        </span>
                                    </div>

                                    <button
                                        className="btn btn-primary w-full"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        style={{ marginTop: 'var(--spacing-4)' }}
                                    >
                                        {isSubmitting ? 'Creating...' : '🚀 Start Workflow'}
                                    </button>
                                </>
                            ) : (
                                <p style={{
                                    color: 'var(--color-text-muted)',
                                    textAlign: 'center',
                                    padding: 'var(--spacing-6)'
                                }}>
                                    Select a location and SOP template to see summary
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default function WorkflowNewPage() {
    return (
        <Suspense fallback={
            <div className="page-content" style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
                Loading...
            </div>
        }>
            <WorkflowNewContent />
        </Suspense>
    )
}
