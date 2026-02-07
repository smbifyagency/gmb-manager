// Professional Report PDF Component
// Agency-grade SEO report suitable for client delivery

import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { styles, colors, formatDate, formatChange } from './pdf-styles'
import { AgencyBranding, getTeamBranding, formatCompanyAddress } from './branding'

// Report Data Structures
export interface GBPStats {
    views: number
    searches: number
    calls: number
    directions: number
    websiteClicks: number
    changeFromLast?: {
        views?: number
        searches?: number
        calls?: number
        directions?: number
        websiteClicks?: number
    }
}

export interface KeywordRanking {
    keyword: string
    position: number
    change: number
    city?: string
}

export interface ReviewsSummary {
    total: number
    average: number
    newThisPeriod: number
    responseRate: number
}

export interface CitationsData {
    total: number
    consistent: number
    inconsistent: number
    missing: number
}

export interface WorkflowProgress {
    completed: number
    inProgress: number
    overdue: number
}

export interface ReportData {
    id: string
    type: string
    period: string
    generatedAt: Date | string

    // Client/Location Info
    client: {
        name: string
    }
    location?: {
        name: string
        address?: string
    }

    // Report Data
    gbpStats?: GBPStats
    rankings?: KeywordRanking[]
    reviews?: ReviewsSummary
    citations?: CitationsData
    workflowProgress?: WorkflowProgress

    // Executive Summary (optional - can be auto-generated)
    executiveSummary?: string[]
}

// Custom styles for reports
const reportStyles = StyleSheet.create({
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },

    reportTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    reportSubtitle: {
        fontSize: 11,
        color: colors.secondary,
        marginBottom: 3,
    },

    periodBadge: {
        backgroundColor: colors.primary,
        color: colors.white,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 'bold',
    },

    summaryBox: {
        backgroundColor: colors.light,
        padding: 15,
        borderRadius: 4,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
    },

    summaryTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 10,
        textTransform: 'uppercase',
    },

    summaryItem: {
        fontSize: 10,
        color: colors.black,
        marginBottom: 5,
        paddingLeft: 10,
    },

    summaryBullet: {
        color: colors.accent,
        marginRight: 5,
    },

    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },

    metricBox: {
        width: '48%',
        backgroundColor: colors.light,
        padding: 12,
        marginBottom: 8,
        marginRight: '2%',
        borderRadius: 4,
        borderLeftWidth: 3,
        borderLeftColor: colors.accent,
    },

    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },

    metricLabel: {
        fontSize: 9,
        color: colors.secondary,
        textTransform: 'uppercase',
        marginTop: 2,
    },

    metricChange: {
        fontSize: 9,
        marginTop: 4,
    },

    rankingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    rankPosition: {
        width: 35,
        height: 35,
        backgroundColor: colors.primary,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },

    rankPositionText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: 'bold',
    },

    rankKeyword: {
        flex: 1,
    },

    rankKeywordText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.black,
    },

    rankCity: {
        fontSize: 8,
        color: colors.secondary,
    },

    rankChange: {
        fontSize: 10,
        fontWeight: 'bold',
    },

    reviewsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    starRating: {
        fontSize: 14,
        color: '#f59e0b',
        marginRight: 8,
    },

    ratingValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginRight: 5,
    },

    reviewDetail: {
        fontSize: 10,
        color: colors.secondary,
    },

    progressRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },

    progressItem: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.light,
        marginHorizontal: 3,
        borderRadius: 4,
    },

    progressValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },

    progressLabel: {
        fontSize: 8,
        color: colors.secondary,
        textTransform: 'uppercase',
        marginTop: 4,
    },
})

// Helper to generate executive summary
function generateExecutiveSummary(data: ReportData): string[] {
    const summary: string[] = []

    if (data.gbpStats?.changeFromLast) {
        const viewChange = data.gbpStats.changeFromLast.views || 0
        if (viewChange !== 0) {
            const direction = viewChange > 0 ? 'up' : 'down'
            summary.push(`GBP views ${direction} ${Math.abs(viewChange)}% (${data.gbpStats.views.toLocaleString()} total views)`)
        }

        const callChange = data.gbpStats.changeFromLast.calls || 0
        if (callChange !== 0) {
            const direction = callChange > 0 ? 'increased' : 'decreased'
            summary.push(`Phone calls ${direction} ${Math.abs(callChange)}% (${data.gbpStats.calls} calls)`)
        }
    }

    if (data.reviews) {
        if (data.reviews.newThisPeriod > 0) {
            summary.push(`${data.reviews.newThisPeriod} new reviews received this period`)
        }
    }

    if (data.rankings && data.rankings.length > 0) {
        const improved = data.rankings.filter(r => r.change > 0).length
        if (improved > 0) {
            summary.push(`Ranking improved for ${improved}/${data.rankings.length} tracked keywords`)
        }
    }

    if (data.workflowProgress) {
        summary.push(`${data.workflowProgress.completed} tasks completed this period`)
    }

    return summary.length > 0 ? summary : ['Report generated with current metrics']
}

// Format report type for display
function formatReportType(type: string): string {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Report PDF Component
interface ReportPDFProps {
    report: ReportData
    branding?: AgencyBranding
}

export function ReportPDF({ report, branding }: ReportPDFProps) {
    const brand = branding || getTeamBranding()
    const addressLines = formatCompanyAddress(brand)
    const summary = report.executiveSummary || generateExecutiveSummary(report)

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={reportStyles.reportHeader}>
                    <View>
                        <Text style={styles.companyName}>{brand.companyName}</Text>
                        {addressLines.slice(0, 2).map((line, i) => (
                            <Text key={i} style={styles.companyDetail}>{line}</Text>
                        ))}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={reportStyles.periodBadge}>{report.period}</Text>
                        <Text style={[styles.companyDetail, { marginTop: 5 }]}>
                            Generated: {formatDate(report.generatedAt)}
                        </Text>
                    </View>
                </View>

                {/* Report Title */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={reportStyles.reportTitle}>
                        {formatReportType(report.type)} Report
                    </Text>
                    <Text style={reportStyles.reportSubtitle}>
                        Client: {report.client.name}
                    </Text>
                    {report.location && (
                        <Text style={reportStyles.reportSubtitle}>
                            Location: {report.location.name}
                        </Text>
                    )}
                </View>

                {/* Executive Summary */}
                <View style={reportStyles.summaryBox}>
                    <Text style={reportStyles.summaryTitle}>Executive Summary</Text>
                    {summary.map((item, i) => (
                        <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
                            <Text style={reportStyles.summaryBullet}>•</Text>
                            <Text style={reportStyles.summaryItem}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* GBP Performance */}
                {report.gbpStats && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>GBP Performance</Text>
                        <View style={reportStyles.metricsGrid}>
                            <View style={reportStyles.metricBox}>
                                <Text style={reportStyles.metricValue}>
                                    {report.gbpStats.views.toLocaleString()}
                                </Text>
                                <Text style={reportStyles.metricLabel}>Profile Views</Text>
                                {report.gbpStats.changeFromLast?.views !== undefined && (
                                    <Text style={[
                                        reportStyles.metricChange,
                                        report.gbpStats.changeFromLast.views >= 0
                                            ? { color: colors.success }
                                            : { color: colors.danger }
                                    ]}>
                                        {formatChange(report.gbpStats.changeFromLast.views)} vs last period
                                    </Text>
                                )}
                            </View>

                            <View style={reportStyles.metricBox}>
                                <Text style={reportStyles.metricValue}>
                                    {report.gbpStats.searches.toLocaleString()}
                                </Text>
                                <Text style={reportStyles.metricLabel}>Searches</Text>
                                {report.gbpStats.changeFromLast?.searches !== undefined && (
                                    <Text style={[
                                        reportStyles.metricChange,
                                        report.gbpStats.changeFromLast.searches >= 0
                                            ? { color: colors.success }
                                            : { color: colors.danger }
                                    ]}>
                                        {formatChange(report.gbpStats.changeFromLast.searches)} vs last period
                                    </Text>
                                )}
                            </View>

                            <View style={reportStyles.metricBox}>
                                <Text style={reportStyles.metricValue}>{report.gbpStats.calls}</Text>
                                <Text style={reportStyles.metricLabel}>Phone Calls</Text>
                                {report.gbpStats.changeFromLast?.calls !== undefined && (
                                    <Text style={[
                                        reportStyles.metricChange,
                                        report.gbpStats.changeFromLast.calls >= 0
                                            ? { color: colors.success }
                                            : { color: colors.danger }
                                    ]}>
                                        {formatChange(report.gbpStats.changeFromLast.calls)} vs last period
                                    </Text>
                                )}
                            </View>

                            <View style={reportStyles.metricBox}>
                                <Text style={reportStyles.metricValue}>{report.gbpStats.directions}</Text>
                                <Text style={reportStyles.metricLabel}>Direction Requests</Text>
                                {report.gbpStats.changeFromLast?.directions !== undefined && (
                                    <Text style={[
                                        reportStyles.metricChange,
                                        report.gbpStats.changeFromLast.directions >= 0
                                            ? { color: colors.success }
                                            : { color: colors.danger }
                                    ]}>
                                        {formatChange(report.gbpStats.changeFromLast.directions)} vs last period
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                {/* Keyword Rankings */}
                {report.rankings && report.rankings.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Keyword Rankings</Text>
                        {report.rankings.slice(0, 8).map((ranking, i) => (
                            <View key={i} style={reportStyles.rankingRow}>
                                <View style={reportStyles.rankPosition}>
                                    <Text style={reportStyles.rankPositionText}>#{ranking.position}</Text>
                                </View>
                                <View style={reportStyles.rankKeyword}>
                                    <Text style={reportStyles.rankKeywordText}>{ranking.keyword}</Text>
                                    {ranking.city && (
                                        <Text style={reportStyles.rankCity}>{ranking.city}</Text>
                                    )}
                                </View>
                                <Text style={[
                                    reportStyles.rankChange,
                                    ranking.change > 0 ? { color: colors.success } :
                                        ranking.change < 0 ? { color: colors.danger } :
                                            { color: colors.secondary }
                                ]}>
                                    {ranking.change > 0 ? `▲${ranking.change}` :
                                        ranking.change < 0 ? `▼${Math.abs(ranking.change)}` : '—'}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Reviews Summary */}
                {report.reviews && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Reviews Summary</Text>
                        <View style={reportStyles.reviewsRow}>
                            <Text style={reportStyles.starRating}>⭐</Text>
                            <Text style={reportStyles.ratingValue}>{report.reviews.average.toFixed(1)}</Text>
                            <Text style={reportStyles.reviewDetail}>
                                avg rating | {report.reviews.total} total reviews | {report.reviews.newThisPeriod} new this period
                            </Text>
                        </View>
                        <Text style={[styles.textMuted, { marginTop: 5 }]}>
                            Response Rate: {report.reviews.responseRate}%
                        </Text>
                    </View>
                )}

                {/* Work Completed */}
                {report.workflowProgress && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Work Completed</Text>
                        <View style={reportStyles.progressRow}>
                            <View style={reportStyles.progressItem}>
                                <Text style={[reportStyles.progressValue, { color: colors.success }]}>
                                    {report.workflowProgress.completed}
                                </Text>
                                <Text style={reportStyles.progressLabel}>Completed</Text>
                            </View>
                            <View style={reportStyles.progressItem}>
                                <Text style={[reportStyles.progressValue, { color: colors.accent }]}>
                                    {report.workflowProgress.inProgress}
                                </Text>
                                <Text style={reportStyles.progressLabel}>In Progress</Text>
                            </View>
                            <View style={reportStyles.progressItem}>
                                <Text style={[reportStyles.progressValue, { color: colors.warning }]}>
                                    {report.workflowProgress.overdue}
                                </Text>
                                <Text style={reportStyles.progressLabel}>Overdue</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Citations */}
                {report.citations && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Citation Health</Text>
                        <View style={reportStyles.metricsGrid}>
                            <View style={[reportStyles.metricBox, { borderLeftColor: colors.success }]}>
                                <Text style={reportStyles.metricValue}>{report.citations.consistent}</Text>
                                <Text style={reportStyles.metricLabel}>Consistent</Text>
                            </View>
                            <View style={[reportStyles.metricBox, { borderLeftColor: colors.warning }]}>
                                <Text style={reportStyles.metricValue}>{report.citations.inconsistent}</Text>
                                <Text style={reportStyles.metricLabel}>Inconsistent</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>{brand.companyName} | {brand.email}</Text>
                    <Text style={styles.footerText}>Generated by Local SEO Hub</Text>
                </View>
            </Page>
        </Document>
    )
}

export default ReportPDF
