import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

// Get the database URL for the adapter
function getDatabaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL

    // If DATABASE_URL is already set, use it
    if (databaseUrl) {
        return databaseUrl
    }

    // Fallback to local dev.db for development
    const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db')
    return `file:${dbPath}`
}

// Create the adapter with the new API (Config object with url)
const adapter = new PrismaLibSql({
    url: getDatabaseUrl(),
    authToken: process.env.DATABASE_AUTH_TOKEN
})

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

