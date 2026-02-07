import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/reports/[id] - Get report details
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params

        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        businessType: true
                    }
                },
                location: {
                    select: {
                        id: true,
                        name: true,
                        address: true,
                        city: true,
                        state: true
                    }
                }
            }
        })

        if (!report) {
            return NextResponse.json(
                { error: 'Report not found' },
                { status: 404 }
            )
        }

        // Parse the JSON data
        const parsedReport = {
            ...report,
            data: JSON.parse(report.dataJson)
        }

        return NextResponse.json({ report: parsedReport })
    } catch (error) {
        console.error('Failed to fetch report:', error)
        return NextResponse.json(
            { error: 'Failed to fetch report' },
            { status: 500 }
        )
    }
}

// DELETE /api/reports/[id] - Delete a report
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params

        // TODO: Add permission check

        await prisma.report.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete report:', error)
        return NextResponse.json(
            { error: 'Failed to delete report' },
            { status: 500 }
        )
    }
}

// PATCH /api/reports/[id] - Update report (e.g., regenerate)
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status, pdfUrl } = body

        const report = await prisma.report.update({
            where: { id },
            data: {
                ...(status && { status }),
                ...(pdfUrl && { pdfUrl })
            },
            include: {
                client: { select: { id: true, name: true } },
                location: { select: { id: true, name: true } }
            }
        })

        return NextResponse.json({ report })
    } catch (error) {
        console.error('Failed to update report:', error)
        return NextResponse.json(
            { error: 'Failed to update report' },
            { status: 500 }
        )
    }
}
