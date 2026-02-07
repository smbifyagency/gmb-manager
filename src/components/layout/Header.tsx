'use client'

import { useState } from 'react'

interface HeaderProps {
    title: string
    subtitle?: string
    actions?: React.ReactNode
}

interface Notification {
    id: number
    title: string
    message: string
    time: string
    unread: boolean
    type: 'warning' | 'info' | 'success' | 'error'
}

// Initial notifications data
const initialNotifications: Notification[] = [
    {
        id: 1,
        title: 'Task overdue',
        message: 'GBP Photo Upload for "Miami Plumbers" is 2 days overdue',
        time: '2 hours ago',
        unread: true,
        type: 'warning'
    },
    {
        id: 2,
        title: 'New task assigned',
        message: 'You have been assigned "Set Up Rank Tracking" for Downtown Auto',
        time: '5 hours ago',
        unread: true,
        type: 'info'
    },
    {
        id: 3,
        title: 'Workflow completed',
        message: 'New Location Setup for "Joe\'s Pizza" marked as complete',
        time: '1 day ago',
        unread: false,
        type: 'success'
    },
    {
        id: 4,
        title: 'GBP Suspension Alert',
        message: '"Miami Roofing Masters" has been suspended - action required',
        time: '3 hours ago',
        unread: true,
        type: 'error'
    }
]

export default function Header({ title, subtitle, actions }: HeaderProps) {
    const [showNotifications, setShowNotifications] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

    const unreadCount = notifications.filter(n => n.unread).length

    // Mark a single notification as read
    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, unread: false } : n
        ))
    }

    // Mark all notifications as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
    }

    // Delete a notification
    const deleteNotification = (id: number, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent triggering mark as read
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    // Clear all notifications
    const clearAllNotifications = () => {
        setNotifications([])
    }

    // Get icon for notification type
    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'warning': return '⚠️'
            case 'info': return 'ℹ️'
            case 'success': return '✅'
            case 'error': return '🚨'
            default: return '📌'
        }
    }

    return (
        <header className="header">
            <div>
                <h1 className="header-title">{title}</h1>
                {subtitle && (
                    <p style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text-muted)',
                        marginTop: 'var(--spacing-1)'
                    }}>
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="header-actions">
                {actions}

                <div style={{ position: 'relative' }}>
                    <button
                        className="notification-bell"
                        onClick={() => setShowNotifications(!showNotifications)}
                        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                    >
                        <span style={{ fontSize: '20px' }}>🔔</span>
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <>
                            {/* Backdrop to close notifications */}
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 99
                                }}
                                onClick={() => setShowNotifications(false)}
                            />

                            <div className="notification-dropdown" style={{ zIndex: 100 }}>
                                <div className="notification-header">
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                                        Notifications {unreadCount > 0 && `(${unreadCount})`}
                                    </span>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                        {unreadCount > 0 && (
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={markAllAsRead}
                                                title="Mark all as read"
                                            >
                                                ✓ Mark all read
                                            </button>
                                        )}
                                        {notifications.length > 0 && (
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={clearAllNotifications}
                                                title="Clear all notifications"
                                                style={{ color: 'var(--color-error)' }}
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="notification-list">
                                    {notifications.length === 0 ? (
                                        <div style={{
                                            padding: 'var(--spacing-8)',
                                            textAlign: 'center',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-2)' }}>🔕</div>
                                            <div>No notifications</div>
                                        </div>
                                    ) : (
                                        notifications.map(notification => (
                                            <div
                                                key={notification.id}
                                                className={`notification-item ${notification.unread ? 'unread' : ''}`}
                                                onClick={() => markAsRead(notification.id)}
                                                style={{ cursor: 'pointer' }}
                                                role="button"
                                                tabIndex={0}
                                                aria-label={`${notification.title} - ${notification.message}`}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'flex-start',
                                                    gap: 'var(--spacing-3)',
                                                    flex: 1
                                                }}>
                                                    <span style={{ fontSize: '18px' }}>
                                                        {getNotificationIcon(notification.type)}
                                                    </span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                            marginBottom: 'var(--spacing-1)'
                                                        }}>
                                                            <span style={{
                                                                fontWeight: 'var(--font-weight-medium)',
                                                                fontSize: 'var(--font-size-sm)'
                                                            }}>
                                                                {notification.title}
                                                            </span>
                                                            {notification.unread && (
                                                                <span style={{
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    borderRadius: '50%',
                                                                    background: 'var(--color-accent-primary)',
                                                                    flexShrink: 0
                                                                }} />
                                                            )}
                                                        </div>
                                                        <div style={{
                                                            fontSize: 'var(--font-size-xs)',
                                                            color: 'var(--color-text-muted)',
                                                            marginBottom: 'var(--spacing-1)'
                                                        }}>
                                                            {notification.message}
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
                                                                {notification.time}
                                                            </span>
                                                            <button
                                                                onClick={(e) => deleteNotification(notification.id, e)}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: 'var(--spacing-1)',
                                                                    borderRadius: 'var(--radius-md)',
                                                                    color: 'var(--color-text-muted)',
                                                                    fontSize: '14px',
                                                                    opacity: 0.6,
                                                                    transition: 'all var(--transition-fast)'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.color = 'var(--color-error)'
                                                                    e.currentTarget.style.opacity = '1'
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.color = 'var(--color-text-muted)'
                                                                    e.currentTarget.style.opacity = '0.6'
                                                                }}
                                                                title="Delete notification"
                                                                aria-label="Delete notification"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {notifications.length > 0 && (
                                    <div style={{
                                        padding: 'var(--spacing-3)',
                                        borderTop: '1px solid var(--color-border)',
                                        textAlign: 'center'
                                    }}>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            style={{ width: '100%' }}
                                        >
                                            View all notifications
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
