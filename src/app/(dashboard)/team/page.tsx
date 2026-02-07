'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'

// Types
interface TeamMember {
    id: string
    name: string
    email: string
    role: 'AGENCY_OWNER' | 'SEO_LEAD' | 'SEO_SPECIALIST' | 'VIRTUAL_ASSISTANT'
    avatar: string
    status: 'active' | 'inactive'
    joinedAt: string
    tasksCompleted: number
    activeWorkflows: number
}

// Mock team data
const initialTeamMembers: TeamMember[] = [
    {
        id: '1',
        name: 'Agency Owner',
        email: 'admin@localseo.hub',
        role: 'AGENCY_OWNER',
        avatar: 'AO',
        status: 'active',
        joinedAt: '2024-01-01',
        tasksCompleted: 156,
        activeWorkflows: 12
    },
    {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@localseo.hub',
        role: 'SEO_LEAD',
        avatar: 'SJ',
        status: 'active',
        joinedAt: '2024-02-15',
        tasksCompleted: 89,
        activeWorkflows: 8
    },
    {
        id: '3',
        name: 'Mike Chen',
        email: 'mike@localseo.hub',
        role: 'SEO_SPECIALIST',
        avatar: 'MC',
        status: 'active',
        joinedAt: '2024-03-01',
        tasksCompleted: 45,
        activeWorkflows: 5
    },
    {
        id: '4',
        name: 'Emily Rodriguez',
        email: 'emily@localseo.hub',
        role: 'VIRTUAL_ASSISTANT',
        avatar: 'ER',
        status: 'active',
        joinedAt: '2024-03-10',
        tasksCompleted: 78,
        activeWorkflows: 6
    },
    {
        id: '5',
        name: 'James Wilson',
        email: 'james@localseo.hub',
        role: 'SEO_SPECIALIST',
        avatar: 'JW',
        status: 'inactive',
        joinedAt: '2024-01-20',
        tasksCompleted: 34,
        activeWorkflows: 0
    }
]

function getRoleBadge(role: TeamMember['role']) {
    const roleConfig = {
        AGENCY_OWNER: { label: 'Agency Owner', color: 'var(--color-accent-primary)' },
        SEO_LEAD: { label: 'SEO Lead', color: 'var(--color-success)' },
        SEO_SPECIALIST: { label: 'SEO Specialist', color: 'var(--color-info)' },
        VIRTUAL_ASSISTANT: { label: 'Virtual Assistant', color: 'var(--color-warning)' }
    }
    const config = roleConfig[role]
    return (
        <span className="badge" style={{ background: config.color, color: 'white' }}>
            {config.label}
        </span>
    )
}

function getStatusBadge(status: 'active' | 'inactive') {
    return status === 'active'
        ? <span className="badge badge-success">Active</span>
        : <span className="badge" style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-muted)' }}>Inactive</span>
}

export default function TeamPage() {
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers)
    const [showModal, setShowModal] = useState(false)
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

    // Form state
    const [newMemberName, setNewMemberName] = useState('')
    const [newMemberEmail, setNewMemberEmail] = useState('')
    const [newMemberRole, setNewMemberRole] = useState<TeamMember['role']>('SEO_SPECIALIST')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const filteredMembers = teamMembers.filter(member => {
        if (filter === 'all') return true
        return member.status === filter
    })

    const handleInviteMember = async () => {
        if (!newMemberName.trim()) {
            setError('Name is required')
            return
        }
        if (!newMemberEmail.trim() || !newMemberEmail.includes('@')) {
            setError('Valid email is required')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newMember: TeamMember = {
                id: `member-${Date.now()}`,
                name: newMemberName,
                email: newMemberEmail,
                role: newMemberRole,
                avatar: newMemberName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
                status: 'active',
                joinedAt: new Date().toISOString().split('T')[0],
                tasksCompleted: 0,
                activeWorkflows: 0
            }

            setTeamMembers(prev => [...prev, newMember])
            setShowModal(false)
            setNewMemberName('')
            setNewMemberEmail('')
            setNewMemberRole('SEO_SPECIALIST')
            setSuccessMessage(`✅ Invitation sent to ${newMemberEmail}!`)
            setTimeout(() => setSuccessMessage(null), 5000)
        } catch (err) {
            setError('Failed to invite team member')
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleMemberStatus = (memberId: string) => {
        setTeamMembers(prev => prev.map(member =>
            member.id === memberId
                ? { ...member, status: member.status === 'active' ? 'inactive' : 'active' }
                : member
        ))
    }

    return (
        <>
            <Header
                title="Team"
                subtitle="Manage your team members and permissions"
                actions={
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <span>+ Invite Member</span>
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
                            style={{ background: 'none', border: 'none', color: 'var(--color-success)', cursor: 'pointer' }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Stats */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-8)' }}>
                    <div className="stat-card">
                        <div className="stat-card-icon primary">👥</div>
                        <div className="stat-value">{teamMembers.length}</div>
                        <div className="stat-label">Total Members</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon success">✓</div>
                        <div className="stat-value">{teamMembers.filter(m => m.status === 'active').length}</div>
                        <div className="stat-label">Active</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon warning">📊</div>
                        <div className="stat-value">{teamMembers.reduce((acc, m) => acc + m.tasksCompleted, 0)}</div>
                        <div className="stat-label">Tasks Completed</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card-icon info">🔄</div>
                        <div className="stat-value">{teamMembers.reduce((acc, m) => acc + m.activeWorkflows, 0)}</div>
                        <div className="stat-label">Active Workflows</div>
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
                    <button
                        className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('all')}
                    >
                        All Members
                    </button>
                    <button
                        className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`btn ${filter === 'inactive' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setFilter('inactive')}
                    >
                        Inactive
                    </button>
                </div>

                {/* Team Table */}
                <div className="card">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Tasks Completed</th>
                                <th>Active Workflows</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map(member => (
                                <tr key={member.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-full)',
                                                background: 'var(--color-accent-gradient)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontWeight: 'var(--font-weight-semibold)',
                                                fontSize: 'var(--font-size-sm)'
                                            }}>
                                                {member.avatar}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{member.name}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                                    {member.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{getRoleBadge(member.role)}</td>
                                    <td>{getStatusBadge(member.status)}</td>
                                    <td>{member.tasksCompleted}</td>
                                    <td>{member.activeWorkflows}</td>
                                    <td style={{ color: 'var(--color-text-muted)' }}>{member.joinedAt}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                            <button className="btn btn-ghost btn-sm">✏️</button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => toggleMemberStatus(member.id)}
                                                title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                                            >
                                                {member.status === 'active' ? '🔒' : '🔓'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Invite Member Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Invite Team Member</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {error && (
                                <div style={{
                                    padding: 'var(--spacing-3)',
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

                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="John Smith"
                                    value={newMemberName}
                                    onChange={e => setNewMemberName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address *</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="john@example.com"
                                    value={newMemberEmail}
                                    onChange={e => setNewMemberEmail(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    value={newMemberRole}
                                    onChange={e => setNewMemberRole(e.target.value as TeamMember['role'])}
                                >
                                    <option value="SEO_LEAD">SEO Lead</option>
                                    <option value="SEO_SPECIALIST">SEO Specialist</option>
                                    <option value="VIRTUAL_ASSISTANT">Virtual Assistant</option>
                                </select>
                                <p className="form-helper">
                                    {newMemberRole === 'SEO_LEAD' && 'Can manage workflows, assign tasks, and view all clients'}
                                    {newMemberRole === 'SEO_SPECIALIST' && 'Can complete tasks and manage assigned workflows'}
                                    {newMemberRole === 'VIRTUAL_ASSISTANT' && 'Can complete assigned tasks only'}
                                </p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleInviteMember} disabled={isSubmitting}>
                                {isSubmitting ? '⏳ Sending...' : '📧 Send Invitation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
