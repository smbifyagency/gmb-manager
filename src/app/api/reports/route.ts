import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/reports - List reports with filtering
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const clientId = searchParams.get('clientId')
        const locationId = searchParams.get('locationId')
        const type = searchParams.get('type')
        const status = searchParams.get('status')
        const period = searchParams.get('period')
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Build where clause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {}

        if (clientId) where.clientId = clientId
        if (locationId) where.locationId = locationId
        if (type) where.type = type
        if (status) where.status = status
        if (period) where.period = period

        // TODO: Add team-based filtering from auth context
        // where.client = { teamId: currentTeam.id }

        const [reports, total] = await Promise.all([
            prisma.report.findMany({
                where,
                include: {
                    client: {
                        select: { id: true, name: true }
                    },
                    location: {
                        select: { id: true, name: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset
            }),
            prisma.report.count({ where })
        ])

        return NextResponse.json({
            reports,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + reports.length < total
            }
        })
    } catch (error) {
        console.error('Failed to fetch reports:', error)
        return NextResponse.json(
            { error: 'Failed to fetch reports' },
            { status: 500 }
        )
    }
}

// POST /api/reports - Create/Generate a new report
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { clientId, locationId, type, period } = body

        // Validate required fields
        if (!clientId) {
            return NextResponse.json(
                { error: 'clientId is required' },
                { status: 400 }
            )
        }
        if (!type) {
            return NextResponse.json(
                { error: 'type is required' },
                { status: 400 }
            )
        }

        // Generate period if not provided (current month)
        const reportPeriod = period || new Date().toISOString().slice(0, 7)

        // Check if report already exists
        const existingReport = await prisma.report.findUnique({
            where: {
                clientId_type_period: {
                    clientId,
                    type,
                    period: reportPeriod
                }
            }
        })

        if (existingReport) {
            return NextResponse.json(
                { error: 'Report already exists for this period', report: existingReport },
                { status: 409 }
            )
        }

        // Generate mock report data (in production, fetch from APIs)
        const reportData = {
            gbpStats: {
                views: Math.floor(Math.random() * 5000) + 1000,
                searches: Math.floor(Math.random() * 2000) + 500,
                calls: Math.floor(Math.random() * 100) + 10,
                directions: Math.floor(Math.random() * 200) + 20,
                websiteClicks: Math.floor(Math.random() * 300) + 50,
                changeFromLast: {
                    views: Math.floor(Math.random() * 20) - 10,
                    calls: Math.floor(Math.random() * 10) - 5
                }
            },
            rankings: [
                { keyword: 'plumber near me', position: 3, change: 2, city: 'Tampa' },
                { keyword: 'emergency plumber', position: 5, change: -1, city: 'Tampa' },
                { keyword: 'water heater repair', position: 2, change: 1, city: 'Tampa' }
            ],
            citations: {
                total: 45,
                consistent: 38,
                inconsistent: 5,
                missing: 2
            },
            reviews: {
                total: 87,
                average: 4.7,
                newThisPeriod: 12,
                responseRate: 95
            },
            workflowProgress: {
                completed: 8,
                inProgress: 2,
                overdue: 1
            }
        }

        // Create the report
        const report = await prisma.report.create({
            data: {
                clientId,
                locationId: locationId || null,
                type,
                period: reportPeriod,
                status: 'READY',
                dataJson: JSON.stringify(reportData)
            },
            include: {
                client: { select: { id: true, name: true } },
                location: { select: { id: true, name: true } }
            }
        })

        return NextResponse.json({ report }, { status: 201 })
    } catch (error) {
        console.error('Failed to create report:', error)
        return NextResponse.json(
            { error: 'Failed to create report' },
            { status: 500 }
        )
    }
}
