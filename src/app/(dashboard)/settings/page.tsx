'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'

// Types
interface NotificationSetting {
    id: string
    name: string
    description: string
    email: boolean
    push: boolean
}

interface IntegrationSetting {
    id: string
    name: string
    description: string
    connected: boolean
    icon: string
}

// Settings sections
const notificationSettings: NotificationSetting[] = [
    {
        id: 'task-assigned',
        name: 'Task Assigned',
        description: 'When a new task is assigned to you',
        email: true,
        push: true
    },
    {
        id: 'task-completed',
        name: 'Task Completed',
        description: 'When a team member completes a task',
        email: true,
        push: false
    },
    {
        id: 'workflow-blocked',
        name: 'Workflow Blocked',
        description: 'When a workflow is blocked due to dependencies',
        email: true,
        push: true
    },
    {
        id: 'gbp-suspension',
        name: 'GBP Suspension Alert',
        description: 'When a location gets suspended',
        email: true,
        push: true
    },
    {
        id: 'daily-summary',
        name: 'Daily Summary',
        description: 'Daily digest of all activities',
        email: true,
        push: false
    }
]

const integrations: IntegrationSetting[] = [
    {
        id: 'google-business',
        name: 'Google Business Profile',
        description: 'Connect your Google Business Profile for automated updates',
        connected: true,
        icon: '🔗'
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Send notifications to Slack channels',
        connected: false,
        icon: '💬'
    },
    {
        id: 'zapier',
        name: 'Zapier',
        description: 'Connect with 5000+ apps via Zapier',
        connected: false,
        icon: '⚡'
    },
    {
        id: 'google-analytics',
        name: 'Google Analytics',
        description: 'Track performance metrics',
        connected: true,
        icon: '📊'
    }
]

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'integrations'>('general')
    const [notifications, setNotifications] = useState(notificationSettings)
    const [integrationList, setIntegrationList] = useState(integrations)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // General settings state
    const [agencyName, setAgencyName] = useState('My SEO Agency')
    const [timezone, setTimezone] = useState('America/New_York')
    const [defaultPriority, setDefaultPriority] = useState('MEDIUM')
    const [autoAssign, setAutoAssign] = useState(true)

    const toggleNotification = (id: string, type: 'email' | 'push') => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, [type]: !n[type] } : n
        ))
    }

    const toggleIntegration = (id: string) => {
        setIntegrationList(prev => prev.map(i =>
            i.id === id ? { ...i, connected: !i.connected } : i
        ))
        const integration = integrationList.find(i => i.id === id)
        if (integration) {
            setSuccessMessage(`${integration.connected ? 'Disconnected from' : 'Connected to'} ${integration.name}`)
            setTimeout(() => setSuccessMessage(null), 3000)
        }
    }

    const handleSaveSettings = () => {
        setSuccessMessage('✅ Settings saved successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
    }

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'notifications', label: 'Notifications', icon: '🔔' },
        { id: 'integrations', label: 'Integrations', icon: '🔗' }
    ]

    return (
        <>
            <Header
                title="Settings"
                subtitle="Configure your agency's preferences and integrations"
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

                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--spacing-6)' }}>
                    {/* Tabs Sidebar */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-2)'
                    }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-3)',
                                    padding: 'var(--spacing-3) var(--spacing-4)',
                                    background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                    border: `1px solid ${activeTab === tab.id ? 'var(--color-accent-primary)' : 'transparent'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: 'pointer',
                                    color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: activeTab === tab.id ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                                    textAlign: 'left',
                                    transition: 'all var(--transition-fast)'
                                }}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="card">
                        {/* General Settings */}
                        {activeTab === 'general' && (
                            <div>
                                <h3 style={{
                                    fontSize: 'var(--font-size-lg)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    marginBottom: 'var(--spacing-6)'
                                }}>
                                    General Settings
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Agency Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={agencyName}
                                            onChange={e => setAgencyName(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Timezone</label>
                                        <select
                                            className="form-select"
                                            value={timezone}
                                            onChange={e => setTimezone(e.target.value)}
                                        >
                                            <option value="America/New_York">Eastern Time (ET)</option>
                                            <option value="America/Chicago">Central Time (CT)</option>
                                            <option value="America/Denver">Mountain Time (MT)</option>
                                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Default Task Priority</label>
                                        <select
                                            className="form-select"
                                            value={defaultPriority}
                                            onChange={e => setDefaultPriority(e.target.value)}
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="CRITICAL">Critical</option>
                                        </select>
                                    </div>

                                    <div style={{
                                        padding: 'var(--spacing-4)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>
                                                Auto-assign Tasks
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                                Automatically assign tasks to available team members
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setAutoAssign(!autoAssign)}
                                            style={{
                                                width: '44px',
                                                height: '24px',
                                                borderRadius: '12px',
                                                background: autoAssign ? 'var(--color-success)' : 'var(--color-bg-hover)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'background var(--transition-fast)'
                                            }}
                                        >
                                            <span style={{
                                                position: 'absolute',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                top: '2px',
                                                left: autoAssign ? '22px' : '2px',
                                                transition: 'left var(--transition-fast)'
                                            }} />
                                        </button>
                                    </div>

                                    <button className="btn btn-primary" onClick={handleSaveSettings} style={{ alignSelf: 'flex-start' }}>
                                        💾 Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                            <div>
                                <h3 style={{
                                    fontSize: 'var(--font-size-lg)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    marginBottom: 'var(--spacing-6)'
                                }}>
                                    Notification Preferences
                                </h3>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto auto',
                                    gap: 'var(--spacing-4)',
                                    alignItems: 'center',
                                    marginBottom: 'var(--spacing-4)'
                                }}>
                                    <div></div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', textAlign: 'center' }}>
                                        Email
                                    </div>
                                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', textAlign: 'center' }}>
                                        Push
                                    </div>
                                </div>

                                {notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr auto auto',
                                            gap: 'var(--spacing-4)',
                                            alignItems: 'center',
                                            padding: 'var(--spacing-4)',
                                            background: 'var(--color-bg-tertiary)',
                                            borderRadius: 'var(--radius-lg)',
                                            marginBottom: 'var(--spacing-3)'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>
                                                {notification.name}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                                {notification.description}
                                            </div>
                                        </div>
                                        <label style={{ display: 'flex', justifyContent: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={notification.email}
                                                onChange={() => toggleNotification(notification.id, 'email')}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                        </label>
                                        <label style={{ display: 'flex', justifyContent: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={notification.push}
                                                onChange={() => toggleNotification(notification.id, 'push')}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                        </label>
                                    </div>
                                ))}

                                <button className="btn btn-primary" onClick={handleSaveSettings} style={{ marginTop: 'var(--spacing-4)' }}>
                                    💾 Save Preferences
                                </button>
                            </div>
                        )}

                        {/* Integrations */}
                        {activeTab === 'integrations' && (
                            <div>
                                <h3 style={{
                                    fontSize: 'var(--font-size-lg)',
                                    fontWeight: 'var(--font-weight-semibold)',
                                    marginBottom: 'var(--spacing-6)'
                                }}>
                                    Integrations
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                                    {integrationList.map(integration => (
                                        <div
                                            key={integration.id}
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: 'var(--spacing-4)',
                                                background: 'var(--color-bg-tertiary)',
                                                borderRadius: 'var(--radius-lg)',
                                                border: `1px solid ${integration.connected ? 'var(--color-success)' : 'var(--color-border)'}`
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                                                <span style={{ fontSize: '28px' }}>{integration.icon}</span>
                                                <div>
                                                    <div style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-1)' }}>
                                                        {integration.name}
                                                    </div>
                                                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                                        {integration.description}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className={`btn ${integration.connected ? 'btn-secondary' : 'btn-primary'}`}
                                                onClick={() => toggleIntegration(integration.id)}
                                            >
                                                {integration.connected ? 'Disconnect' : 'Connect'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    )
}
