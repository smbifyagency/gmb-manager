'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PERMISSIONS, Permission, ROLE_LABELS } from '@/lib/permissions'

// Navigation item type
interface NavItem {
    name: string
    href: string
    icon: string
    permission?: Permission  // If set, item only shows if user has this permission
}

interface NavSection {
    section: string
    items: NavItem[]
}

// Full navigation structure with permission requirements
const fullNavigation: NavSection[] = [
    {
        section: 'Overview',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: '📊' },
            { name: 'My Tasks', href: '/tasks', icon: '✅' },
        ]
    },
    {
        section: 'Management',
        items: [
            { name: 'Clients', href: '/clients', icon: '🏢', permission: PERMISSIONS.CLIENT_VIEW },
            { name: 'Locations', href: '/locations', icon: '📍', permission: PERMISSIONS.LOCATION_VIEW },
            { name: 'Workflows', href: '/workflows', icon: '🔄', permission: PERMISSIONS.WORKFLOW_VIEW },
        ]
    },
    {
        section: 'Reports & Billing',
        items: [
            { name: 'Reports', href: '/reports', icon: '📈', permission: PERMISSIONS.REPORT_VIEW },
            { name: 'Invoices', href: '/invoices', icon: '💰', permission: PERMISSIONS.INVOICE_VIEW },
        ]
    },
    {
        section: 'Configuration',
        items: [
            { name: 'SOP Templates', href: '/sops', icon: '📋', permission: PERMISSIONS.SOP_VIEW },
            { name: 'Team', href: '/team', icon: '👥', permission: PERMISSIONS.TEAM_VIEW },
            { name: 'Settings', href: '/settings', icon: '⚙️', permission: PERMISSIONS.SETTINGS_VIEW },
        ]
    }
]

export default function Sidebar() {
    const pathname = usePathname()
    const {
        user,
        teams,
        currentTeam,
        switchTeam,
        hasPermission,
        currentTeamRole,
        isClient
    } = useAuth()

    const [showTeamSwitcher, setShowTeamSwitcher] = useState(false)

    // Filter navigation based on permissions
    const navigation = fullNavigation.map(section => ({
        ...section,
        items: section.items.filter(item =>
            !item.permission || hasPermission(item.permission)
        )
    })).filter(section => section.items.length > 0)

    // Get role badge color
    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return 'var(--color-accent-primary)'
            case 'ADMIN': return 'var(--color-success)'
            case 'TEAM': return 'var(--color-info)'
            default: return 'var(--color-text-muted)'
        }
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span style={{ fontSize: '24px' }}>🎯</span>
                    <span>Local SEO Hub</span>
                </div>
            </div>

            {/* Team Switcher */}
            {teams.length > 0 && !isClient && (
                <div style={{
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    borderBottom: '1px solid var(--color-border)'
                }}>
                    <div
                        onClick={() => setShowTeamSwitcher(!showTeamSwitcher)}
                        style={{
                            padding: 'var(--spacing-3)',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '2px'
                                }}>
                                    Current Workspace
                                </div>
                                <div style={{
                                    fontWeight: 'var(--font-weight-medium)',
                                    fontSize: 'var(--font-size-sm)'
                                }}>
                                    {currentTeam?.team.name || 'Select Team'}
                                </div>
                            </div>
                            <span style={{
                                fontSize: '12px',
                                transform: showTeamSwitcher ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s'
                            }}>
                                ▼
                            </span>
                        </div>
                        {currentTeamRole && (
                            <div style={{ marginTop: 'var(--spacing-2)' }}>
                                <span style={{
                                    fontSize: 'var(--font-size-xs)',
                                    padding: '2px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    background: getRoleBadgeColor(currentTeamRole),
                                    color: 'white'
                                }}>
                                    {ROLE_LABELS[currentTeamRole]}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Team dropdown */}
                    {showTeamSwitcher && teams.length > 1 && (
                        <div style={{
                            marginTop: 'var(--spacing-2)',
                            background: 'var(--color-bg-secondary)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            overflow: 'hidden'
                        }}>
                            {teams.map(tm => (
                                <div
                                    key={tm.team.id}
                                    onClick={() => {
                                        switchTeam(tm.team.id)
                                        setShowTeamSwitcher(false)
                                    }}
                                    style={{
                                        padding: 'var(--spacing-3)',
                                        cursor: 'pointer',
                                        background: tm.team.id === currentTeam?.team.id
                                            ? 'rgba(99, 102, 241, 0.1)'
                                            : 'transparent',
                                        borderLeft: tm.team.id === currentTeam?.team.id
                                            ? '3px solid var(--color-accent-primary)'
                                            : '3px solid transparent',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all var(--transition-fast)'
                                    }}
                                >
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                        {tm.team.name}
                                    </span>
                                    <span style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: getRoleBadgeColor(tm.role)
                                    }}>
                                        {tm.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Client View Label */}
            {isClient && (
                <div style={{
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    borderBottom: '1px solid var(--color-border)'
                }}>
                    <div style={{
                        padding: 'var(--spacing-3)',
                        background: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: 'var(--radius-lg)',
                        textAlign: 'center'
                    }}>
                        <span style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-accent-secondary)',
                            fontWeight: 'var(--font-weight-medium)'
                        }}>
                            👁️ Client View (Read-Only)
                        </span>
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                {navigation.map((section) => (
                    <div key={section.section} className="nav-section">
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`nav-item ${pathname === item.href || pathname.startsWith(item.href + '/') ? 'active' : ''}`}
                            >
                                <span className="nav-item-icon">{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>

            <div style={{
                padding: 'var(--spacing-4)',
                borderTop: '1px solid var(--color-border)',
                marginTop: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)',
                    padding: 'var(--spacing-3)'
                }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-accent-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'var(--font-weight-semibold)',
                        fontSize: 'var(--font-size-sm)'
                    }}>
                        {user?.name.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                    </div>
                    <div>
                        <div style={{
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-medium)'
                        }}>
                            {user?.name || 'User'}
                        </div>
                        <div style={{
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-text-muted)'
                        }}>
                            {user?.email || ''}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
