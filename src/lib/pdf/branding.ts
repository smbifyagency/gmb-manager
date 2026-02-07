// Agency Branding Configuration for PDF Documents
// Default values that can be overridden per team/agency

export interface AgencyBranding {
    // Company Information
    companyName: string
    address?: string
    city?: string
    email?: string
    phone?: string
    website?: string

    // Visual Branding
    logo?: string           // Base64 data URL or absolute path
    primaryColor: string    // Hex color for headers/accents
    secondaryColor: string  // Hex color for secondary elements

    // Footer
    footerText?: string
    termsText?: string
}

// Default branding configuration
// In production, this would come from team settings in the database
export const defaultBranding: AgencyBranding = {
    companyName: 'Local SEO Hub',
    address: '123 Marketing Street',
    city: 'Tampa, FL 33601',
    email: 'info@localseohub.com',
    phone: '(555) 123-4567',
    website: 'www.localseohub.com',

    primaryColor: '#1a365d',
    secondaryColor: '#4a5568',

    footerText: 'Thank you for your business!',
    termsText: 'Payment due within 15 days. Late fee: 1.5% per month.',
}

// Get branding for a specific team (placeholder for future database lookup)
export function getTeamBranding(teamId?: string): AgencyBranding {
    // TODO: In the future, fetch branding from database based on teamId
    // For now, return default branding
    return defaultBranding
}

// Helper to generate company address block
export function formatCompanyAddress(branding: AgencyBranding): string[] {
    const lines: string[] = []

    if (branding.address) lines.push(branding.address)
    if (branding.city) lines.push(branding.city)
    if (branding.email) lines.push(branding.email)
    if (branding.phone) lines.push(branding.phone)
    if (branding.website) lines.push(branding.website)

    return lines
}
