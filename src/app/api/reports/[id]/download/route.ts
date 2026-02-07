// Report PDF Download Endpoint
// GET /api/reports/[id]/download - Stream report as downloadable PDF

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { prisma } from '@/lib/db'
import { ReportPDF, type ReportData } from '@/lib/pdf'
import React from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderPDF = renderToBuffer as (element: React.ReactElement) => Promise<Buffer>

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Fetch report with client and location
        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                        address: true
                    }
                }
            }
        })

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 })
        }

        // TODO: Add team-based access control from auth context

        // Parse report data JSON
        let parsedData: Record<string, unknown> = {}
        try {
            parsedData = JSON.parse(report.dataJson || '{}')
        } catch {
            parsedData = {}
        }

        // Transform to ReportData format
        const reportData: ReportData = {
            id: report.id,
            type: report.type,
            period: report.period,
            generatedAt: report.createdAt,
            client: {
                name: report.client.name
            },
            location: report.location ? {
                name: report.location.name,
                address: report.location.address || undefined
            } : undefined,

            // Map parsed data - cast to appropriate types
            gbpStats: parsedData.gbpStats as ReportData['gbpStats'],
            rankings: parsedData.rankings as ReportData['rankings'],
            reviews: parsedData.reviews as ReportData['reviews'],
            citations: parsedData.citations as ReportData['citations'],
            workflowProgress: parsedData.workflowProgress as ReportData['workflowProgress'],
            executiveSummary: parsedData.executiveSummary as string[] | undefined
        }

        // Generate PDF using react-pdf
        const pdfElement = React.createElement(ReportPDF, { report: reportData })
        const pdfBuffer = await renderPDF(pdfElement)

        // Generate filename
        const clientSlug = report.client.name.toLowerCase().replace(/\s+/g, '-').slice(0, 20)
        const filename = `Report-${clientSlug}-${report.period}.pdf`

        // Return PDF as downloadable file
        return new NextResponse(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Length': pdfBuffer.length.toString(),
            }
        })

    } catch (error) {
        console.error('Error generating report PDF:', error)
        return NextResponse.json(
            { error: 'Failed to generate PDF' },
            { status: 500 }
        )
    }
}
