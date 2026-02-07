// Professional Invoice PDF Component
// Agency-grade invoice suitable for client delivery

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { styles, colors, formatCurrency, formatDate } from './pdf-styles'
import { AgencyBranding, getTeamBranding, formatCompanyAddress } from './branding'

// Invoice Line Item
export interface InvoiceLineItemData {
    description: string
    quantity: number
    unitPrice: number
    total: number
}

// Invoice Data Structure
export interface InvoiceData {
    id: string
    invoiceNumber: string
    status: string
    issueDate: Date | string
    dueDate: Date | string
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
    currency: string
    notes?: string
    paidAmount?: number

    // Client Info
    client: {
        name: string
        email?: string
        address?: string
        phone?: string
    }

    // Line Items
    lineItems: InvoiceLineItemData[]

    // Payment History (optional)
    payments?: Array<{
        amount: number
        method: string
        paidAt: Date | string
    }>
}

// Custom styles specific to invoices
const invoiceStyles = StyleSheet.create({
    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },

    invoiceTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 2,
    },

    invoiceNumber: {
        marginTop: 10,
        fontSize: 10,
        color: colors.secondary,
    },

    statusBadge: {
        marginTop: 10,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    billToBox: {
        marginBottom: 25,
    },

    billToLabel: {
        fontSize: 9,
        color: colors.secondary,
        textTransform: 'uppercase',
        marginBottom: 5,
        letterSpacing: 0.5,
    },

    billToName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.black,
        marginBottom: 3,
    },

    billToDetail: {
        fontSize: 10,
        color: colors.secondary,
        marginBottom: 2,
    },

    itemsTable: {
        marginBottom: 20,
    },

    tableHeaderInvoice: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },

    tableHeaderCell: {
        color: colors.white,
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    tableRowInvoice: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },

    colDescription: {
        flex: 3,
    },

    colQty: {
        flex: 1,
        textAlign: 'center',
    },

    colRate: {
        flex: 1,
        textAlign: 'right',
    },

    colAmount: {
        flex: 1,
        textAlign: 'right',
    },

    totalsSection: {
        alignItems: 'flex-end',
        marginTop: 20,
    },

    totalsBox: {
        width: 250,
    },

    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },

    totalsLabel: {
        fontSize: 10,
        color: colors.secondary,
    },

    totalsValue: {
        fontSize: 10,
        color: colors.black,
    },

    totalsDivider: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginVertical: 5,
    },

    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.light,
        padding: 10,
        borderRadius: 4,
        marginTop: 5,
    },

    grandTotalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },

    grandTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },

    paymentBox: {
        marginTop: 30,
        padding: 15,
        backgroundColor: colors.light,
        borderRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
    },

    paymentTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
    },

    paymentDetail: {
        fontSize: 9,
        color: colors.secondary,
        marginBottom: 3,
    },
})

// Get status badge style
function getStatusStyle(status: string) {
    switch (status.toUpperCase()) {
        case 'PAID':
            return { backgroundColor: '#c6f6d5', color: colors.success }
        case 'OVERDUE':
            return { backgroundColor: '#fed7d7', color: colors.danger }
        case 'PARTIAL':
            return { backgroundColor: '#fefcbf', color: colors.warning }
        case 'SENT':
        case 'VIEWED':
            return { backgroundColor: '#bee3f8', color: colors.accent }
        default:
            return { backgroundColor: colors.light, color: colors.secondary }
    }
}

// Invoice PDF Component
interface InvoicePDFProps {
    invoice: InvoiceData
    branding?: AgencyBranding
}

export function InvoicePDF({ invoice, branding }: InvoicePDFProps) {
    const brand = branding || getTeamBranding()
    const addressLines = formatCompanyAddress(brand)
    const statusStyle = getStatusStyle(invoice.status)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={invoiceStyles.invoiceHeader}>
                    {/* Left: Company Info */}
                    <View>
                        <Text style={styles.companyName}>{brand.companyName}</Text>
                        {addressLines.map((line, i) => (
                            <Text key={i} style={styles.companyDetail}>{line}</Text>
                        ))}
                    </View>

                    {/* Right: Invoice Title & Number */}
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={invoiceStyles.invoiceTitle}>INVOICE</Text>
                        <Text style={invoiceStyles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
                        <View style={[invoiceStyles.statusBadge, statusStyle]}>
                            <Text>{invoice.status.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* Invoice Details & Bill To */}
                <View style={styles.infoBox}>
                    {/* Invoice Details */}
                    <View style={styles.infoColumn}>
                        <Text style={styles.infoLabel}>Issue Date</Text>
                        <Text style={styles.infoValue}>{formatDate(invoice.issueDate)}</Text>

                        <Text style={styles.infoLabel}>Due Date</Text>
                        <Text style={styles.infoValueLarge}>{formatDate(invoice.dueDate)}</Text>
                    </View>

                    {/* Bill To */}
                    <View style={[styles.infoColumn, { paddingLeft: 40 }]}>
                        <Text style={invoiceStyles.billToLabel}>Bill To</Text>
                        <Text style={invoiceStyles.billToName}>{invoice.client.name}</Text>
                        {invoice.client.email && (
                            <Text style={invoiceStyles.billToDetail}>{invoice.client.email}</Text>
                        )}
                        {invoice.client.address && (
                            <Text style={invoiceStyles.billToDetail}>{invoice.client.address}</Text>
                        )}
                        {invoice.client.phone && (
                            <Text style={invoiceStyles.billToDetail}>{invoice.client.phone}</Text>
                        )}
                    </View>
                </View>

                {/* Line Items Table */}
                <View style={invoiceStyles.itemsTable}>
                    {/* Table Header */}
                    <View style={invoiceStyles.tableHeaderInvoice}>
                        <Text style={[invoiceStyles.tableHeaderCell, invoiceStyles.colDescription]}>
                            Description
                        </Text>
                        <Text style={[invoiceStyles.tableHeaderCell, invoiceStyles.colQty]}>
                            Qty
                        </Text>
                        <Text style={[invoiceStyles.tableHeaderCell, invoiceStyles.colRate]}>
                            Rate
                        </Text>
                        <Text style={[invoiceStyles.tableHeaderCell, invoiceStyles.colAmount]}>
                            Amount
                        </Text>
                    </View>

                    {/* Table Rows */}
                    {invoice.lineItems.map((item, index) => (
                        <View
                            key={index}
                            style={[
                                invoiceStyles.tableRowInvoice,
                                index % 2 === 1 ? { backgroundColor: colors.light } : {}
                            ]}
                        >
                            <Text style={invoiceStyles.colDescription}>{item.description}</Text>
                            <Text style={invoiceStyles.colQty}>{item.quantity}</Text>
                            <Text style={invoiceStyles.colRate}>
                                {formatCurrency(item.unitPrice, invoice.currency)}
                            </Text>
                            <Text style={invoiceStyles.colAmount}>
                                {formatCurrency(item.total, invoice.currency)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={invoiceStyles.totalsSection}>
                    <View style={invoiceStyles.totalsBox}>
                        <View style={invoiceStyles.totalsRow}>
                            <Text style={invoiceStyles.totalsLabel}>Subtotal</Text>
                            <Text style={invoiceStyles.totalsValue}>
                                {formatCurrency(invoice.subtotal, invoice.currency)}
                            </Text>
                        </View>

                        {invoice.taxRate > 0 && (
                            <View style={invoiceStyles.totalsRow}>
                                <Text style={invoiceStyles.totalsLabel}>
                                    Tax ({invoice.taxRate}%)
                                </Text>
                                <Text style={invoiceStyles.totalsValue}>
                                    {formatCurrency(invoice.taxAmount, invoice.currency)}
                                </Text>
                            </View>
                        )}

                        <View style={invoiceStyles.totalsDivider} />

                        <View style={invoiceStyles.grandTotal}>
                            <Text style={invoiceStyles.grandTotalLabel}>Total Due</Text>
                            <Text style={invoiceStyles.grandTotalValue}>
                                {formatCurrency(invoice.total, invoice.currency)}
                            </Text>
                        </View>

                        {invoice.paidAmount && invoice.paidAmount > 0 && (
                            <>
                                <View style={[invoiceStyles.totalsRow, { marginTop: 10 }]}>
                                    <Text style={[invoiceStyles.totalsLabel, { color: colors.success }]}>
                                        Amount Paid
                                    </Text>
                                    <Text style={[invoiceStyles.totalsValue, { color: colors.success }]}>
                                        {formatCurrency(invoice.paidAmount, invoice.currency)}
                                    </Text>
                                </View>
                                <View style={invoiceStyles.totalsRow}>
                                    <Text style={[invoiceStyles.totalsLabel, { fontWeight: 'bold' }]}>
                                        Balance Due
                                    </Text>
                                    <Text style={[invoiceStyles.totalsValue, { fontWeight: 'bold' }]}>
                                        {formatCurrency(invoice.total - invoice.paidAmount, invoice.currency)}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Payment Information */}
                <View style={invoiceStyles.paymentBox}>
                    <Text style={invoiceStyles.paymentTitle}>Payment Information</Text>
                    <Text style={invoiceStyles.paymentDetail}>
                        Please make payment to the bank account details provided.
                    </Text>
                    <Text style={invoiceStyles.paymentDetail}>
                        For questions, contact: {brand.email}
                    </Text>
                </View>

                {/* Notes */}
                {invoice.notes && (
                    <View style={styles.notes}>
                        <Text style={styles.notesTitle}>Notes</Text>
                        <Text style={styles.notesText}>{invoice.notes}</Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>{brand.companyName} | {brand.email}</Text>
                    <Text style={styles.footerText}>{brand.termsText}</Text>
                </View>
            </Page>
        </Document>
    )
}

export default InvoicePDF
