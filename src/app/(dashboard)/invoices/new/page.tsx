'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import { useRouter } from 'next/navigation'

interface Client {
    id: string
    name: string
}

interface LineItem {
    description: string
    quantity: number
    unitPrice: number
}

export default function NewInvoicePage() {
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        clientId: '',
        dueDate: '',
        taxRate: 0,
        notes: ''
    })
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { description: '', quantity: 1, unitPrice: 0 }
    ])

    useEffect(() => {
        // Mock clients - replace with API
        setClients([
            { id: '1', name: 'Rank & Rent Portfolio' },
            { id: '2', name: "Joe's Restaurants" },
            { id: '4', name: 'Sunrise Dental LLC' },
            { id: '5', name: 'Miami Services Group' }
        ])

        // Default due date (30 days from now)
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 30)
        setFormData(prev => ({
            ...prev,
            dueDate: dueDate.toISOString().split('T')[0]
        }))
    }, [])

    const handleAddLine = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }])
    }

    const handleRemoveLine = (index: number) => {
        if (lineItems.length === 1) return
        setLineItems(lineItems.filter((_, i) => i !== index))
    }

    const handleLineChange = (index: number, field: keyof LineItem, value: string | number) => {
        const updated = [...lineItems]
        updated[index] = { ...updated[index], [field]: value }
        setLineItems(updated)
    }

    const calculateSubtotal = () => {
        return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    }

    const calculateTax = () => {
        return calculateSubtotal() * (formData.taxRate / 100)
    }

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.clientId || !formData.dueDate) {
            alert('Please select a client and set a due date')
            return
        }

        if (lineItems.some(item => !item.description || item.unitPrice <= 0)) {
            alert('Please fill in all line items with valid prices')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    lineItems
                })
            })

            if (response.ok) {
                const { invoice } = await response.json()
                router.push(`/invoices/${invoice.id}`)
            } else {
                alert('Failed to create invoice')
            }
        } catch {
            alert('Error creating invoice')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Header
                title="Create Invoice"
                subtitle="Create a new invoice for a client"
            />

            <div className="page-content">
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-6)' }}>
                        {/* Main Form */}
                        <div>
                            {/* Client & Dates */}
                            <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)' }}>
                                    <div className="form-group">
                                        <label className="form-label">Client *</label>
                                        <select
                                            className="form-select"
                                            value={formData.clientId}
                                            onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select client...</option>
                                            {clients.map(client => (
                                                <option key={client.id} value={client.id}>{client.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Due Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.dueDate}
                                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div className="card" style={{ marginBottom: 'var(--spacing-6)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Line Items</h3>

                                {lineItems.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 80px 120px 40px',
                                            gap: 'var(--spacing-3)',
                                            marginBottom: 'var(--spacing-3)',
                                            alignItems: 'start'
                                        }}
                                    >
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Description"
                                            value={item.description}
                                            onChange={e => handleLineChange(index, 'description', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Qty"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => handleLineChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                        />
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder="Price"
                                            min="0"
                                            step="0.01"
                                            value={item.unitPrice || ''}
                                            onChange={e => handleLineChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleRemoveLine(index)}
                                            disabled={lineItems.length === 1}
                                            style={{ padding: 'var(--spacing-2)' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleAddLine}
                                >
                                    + Add Line Item
                                </button>
                            </div>

                            {/* Notes */}
                            <div className="card">
                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Thank you for your business!"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div>
                            <div className="card" style={{ position: 'sticky', top: 'var(--spacing-4)' }}>
                                <h3 style={{ marginBottom: 'var(--spacing-4)' }}>Summary</h3>

                                <div className="form-group">
                                    <label className="form-label">Tax Rate (%)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={formData.taxRate}
                                        onChange={e => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div style={{
                                    borderTop: '1px solid var(--color-border)',
                                    paddingTop: 'var(--spacing-4)',
                                    marginTop: 'var(--spacing-4)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                                        <span>Subtotal</span>
                                        <span>${calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    {formData.taxRate > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-2)' }}>
                                            <span>Tax ({formData.taxRate}%)</span>
                                            <span>${calculateTax().toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 'var(--font-size-xl)',
                                        fontWeight: 'var(--font-weight-bold)',
                                        marginTop: 'var(--spacing-4)',
                                        paddingTop: 'var(--spacing-4)',
                                        borderTop: '2px solid var(--color-border)'
                                    }}>
                                        <span>Total</span>
                                        <span>${calculateTotal().toFixed(2)}</span>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'var(--spacing-6)', display: 'flex', gap: 'var(--spacing-3)' }}>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => router.back()}
                                        style={{ flex: 1 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={loading}
                                        style={{ flex: 1 }}
                                    >
                                        {loading ? 'Creating...' : 'Create Invoice'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}
