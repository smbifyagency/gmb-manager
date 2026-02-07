// Professional PDF Styles for Agency-Grade Documents
// Shared styles for Reports and Invoices

import { StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts (using default system fonts for now)
// In production, you can register custom fonts like:
// Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' })

// Color Palette - Professional & Clean
export const colors = {
    primary: '#1a365d',     // Dark blue - headers, primary text
    secondary: '#4a5568',   // Gray - secondary text
    accent: '#2b6cb0',      // Blue accent
    success: '#38a169',     // Green - positive metrics
    warning: '#d69e2e',     // Orange - warnings
    danger: '#e53e3e',      // Red - overdue, negative
    light: '#f7fafc',       // Light background
    border: '#e2e8f0',      // Border color
    white: '#ffffff',
    black: '#1a202c',
}

// Shared Styles
export const styles = StyleSheet.create({
    // Page Layout
    page: {
        flexDirection: 'column',
        backgroundColor: colors.white,
        paddingTop: 40,
        paddingBottom: 60,
        paddingHorizontal: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: colors.black,
    },

    // Header Section
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        paddingBottom: 15,
    },

    logo: {
        width: 120,
        height: 40,
        objectFit: 'contain',
    },

    companyInfo: {
        textAlign: 'right',
    },

    companyName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2,
    },

    companyDetail: {
        fontSize: 8,
        color: colors.secondary,
        marginBottom: 1,
    },

    // Document Title
    documentTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    documentSubtitle: {
        fontSize: 12,
        color: colors.secondary,
        marginBottom: 20,
    },

    // Section Styles
    section: {
        marginBottom: 20,
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    sectionContent: {
        paddingLeft: 10,
    },

    // Table Styles
    table: {
        width: '100%',
        marginBottom: 10,
    },

    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.primary,
        color: colors.white,
        padding: 8,
        fontWeight: 'bold',
        fontSize: 9,
    },

    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        padding: 8,
        fontSize: 9,
    },

    tableRowAlt: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        padding: 8,
        fontSize: 9,
        backgroundColor: colors.light,
    },

    tableCell: {
        flex: 1,
    },

    tableCellRight: {
        flex: 1,
        textAlign: 'right',
    },

    tableCellSmall: {
        width: 60,
        textAlign: 'center',
    },

    tableCellMoney: {
        width: 80,
        textAlign: 'right',
    },

    // Info Box Styles
    infoBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    infoColumn: {
        flex: 1,
    },

    infoLabel: {
        fontSize: 8,
        color: colors.secondary,
        marginBottom: 2,
        textTransform: 'uppercase',
    },

    infoValue: {
        fontSize: 10,
        color: colors.black,
        marginBottom: 8,
    },

    infoValueLarge: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },

    // Status Badges
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 3,
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    badgePaid: {
        backgroundColor: '#c6f6d5',
        color: colors.success,
    },

    badgeUnpaid: {
        backgroundColor: '#fed7d7',
        color: colors.danger,
    },

    badgePartial: {
        backgroundColor: '#fefcbf',
        color: colors.warning,
    },

    // Metric Cards
    metricsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },

    metricCard: {
        flex: 1,
        backgroundColor: colors.light,
        padding: 12,
        marginHorizontal: 3,
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: colors.accent,
    },

    metricValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 2,
    },

    metricLabel: {
        fontSize: 8,
        color: colors.secondary,
        textTransform: 'uppercase',
    },

    metricChange: {
        fontSize: 8,
        marginTop: 2,
    },

    metricChangePositive: {
        color: colors.success,
    },

    metricChangeNegative: {
        color: colors.danger,
    },

    // Summary/Totals
    summaryBox: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 5,
    },

    summaryLabel: {
        width: 100,
        textAlign: 'right',
        marginRight: 20,
        fontSize: 10,
        color: colors.secondary,
    },

    summaryValue: {
        width: 80,
        textAlign: 'right',
        fontSize: 10,
    },

    summaryTotal: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 2,
        borderTopColor: colors.primary,
    },

    summaryTotalLabel: {
        width: 100,
        textAlign: 'right',
        marginRight: 20,
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },

    summaryTotalValue: {
        width: 80,
        textAlign: 'right',
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.primary,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: colors.secondary,
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
    },

    footerText: {
        marginBottom: 2,
    },

    // Text Utilities
    bold: {
        fontWeight: 'bold',
    },

    italic: {
        fontStyle: 'italic',
    },

    textRight: {
        textAlign: 'right',
    },

    textCenter: {
        textAlign: 'center',
    },

    textSuccess: {
        color: colors.success,
    },

    textWarning: {
        color: colors.warning,
    },

    textDanger: {
        color: colors.danger,
    },

    textMuted: {
        color: colors.secondary,
    },

    // Spacing
    mb5: { marginBottom: 5 },
    mb10: { marginBottom: 10 },
    mb15: { marginBottom: 15 },
    mb20: { marginBottom: 20 },
    mt5: { marginTop: 5 },
    mt10: { marginTop: 10 },

    // Notes Section
    notes: {
        marginTop: 20,
        padding: 10,
        backgroundColor: colors.light,
        borderRadius: 4,
    },

    notesTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.secondary,
        marginBottom: 5,
    },

    notesText: {
        fontSize: 9,
        color: colors.secondary,
        lineHeight: 1.4,
    },
})

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount)
}

// Helper function to format date
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

// Helper function to format percentage change
export function formatChange(value: number): string {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value}%`
}
