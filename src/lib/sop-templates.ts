// Local SEO SOP Templates
// Pre-defined workflows for common local SEO scenarios

// Define types locally (matches Prisma enums) - avoid importing from @prisma/client
type SOPType = 'NEW_LOCATION' | 'SUSPENSION_RECOVERY' | 'REBRAND' | 'MAINTENANCE'
type TaskCategory = 'GBP_SETUP' | 'GBP_OPTIMIZATION' | 'WEBSITE' | 'CITATIONS' | 'REVIEWS' | 'TRACKING' | 'CONTENT' | 'VERIFICATION' | 'DOCUMENTATION'
type EvidenceType = 'NONE' | 'URL' | 'SCREENSHOT' | 'TEXT' | 'FILE' | 'CHECKLIST'
type BusinessType = 'TRADITIONAL' | 'RANK_RENT' | 'GMB_ONLY'

export interface TaskTemplateData {
    title: string
    instructions: string
    category: TaskCategory
    evidenceType: EvidenceType
    estimatedMinutes: number
    isRequired: boolean
    requiresOwnerApproval: boolean
    applicableBusinessTypes: BusinessType[]
    order: number
    dependsOnTaskIds: number[] // References by order for initial setup
}

export interface SOPTemplateData {
    name: string
    description: string
    type: SOPType
    applicableBusinessTypes: BusinessType[]
    tasks: TaskTemplateData[]
}

// ============= NEW LOCATION SETUP SOP =============
export const newLocationSetupSOP: SOPTemplateData = {
    name: 'New Location Setup',
    description: 'Complete checklist for setting up a new business location in local SEO ecosystem',
    type: 'NEW_LOCATION',
    applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
    tasks: [
        {
            title: 'Create or Claim Google Business Profile',
            instructions: `1. Go to business.google.com
2. Search for the business name and address
3. If listing exists: Click "Claim this business" and follow verification steps
4. If no listing: Click "Add your business" and enter all details
5. Select the appropriate primary category
6. Complete the verification process (postcard, phone, or email)
7. Save the GBP URL for evidence`,
            category: 'GBP_SETUP',
            evidenceType: 'URL',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 1,
            dependsOnTaskIds: []
        },
        {
            title: 'Set Primary Business Category',
            instructions: `1. Open Google Business Profile Manager
2. Go to "Edit profile" → "Business category"
3. Choose the MOST specific primary category that matches the business
4. Tip: Search competitor top-rankers to see what category they use
5. Screenshot the selected category`,
            category: 'GBP_SETUP',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 10,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 2,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Add Secondary Categories',
            instructions: `1. Open Google Business Profile Manager
2. Go to "Edit profile" → "Business category"
3. Click "Add another category"
4. Add 2-5 relevant secondary categories
5. Prioritize categories that reflect actual services offered
6. Screenshot all selected categories`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 10,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 3,
            dependsOnTaskIds: [2]
        },
        {
            title: 'Configure Service Area',
            instructions: `1. Open Google Business Profile Manager
2. Go to "Edit profile" → "Location and areas"
3. Choose between:
   - Storefront: Customers visit your location
   - Service area: You travel to customers
   - Both: Hybrid model
4. For service area businesses, add specific cities/zip codes
5. Limit to realistic service radius (20-30 miles typical)
6. Screenshot the service area configuration`,
            category: 'GBP_SETUP',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 10,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 4,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Validate NAP Information',
            instructions: `1. Verify the following is EXACTLY consistent:
   - Business Name (no keyword stuffing)
   - Address (use USPS format)
   - Phone Number (local area code preferred)
2. Cross-check with website (if exists)
3. Document the exact NAP format to use everywhere:
   Name: [exact name]
   Address: [exact address]
   Phone: [exact phone]
4. Paste NAP details as evidence`,
            category: 'DOCUMENTATION',
            evidenceType: 'TEXT',
            estimatedMinutes: 10,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 5,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Upload Initial Photos',
            instructions: `1. Prepare at least 5-10 high-quality photos:
   - Logo (square format)
   - Cover photo (16:9 aspect ratio)
   - Interior photos (3+)
   - Exterior photos (2+)
   - Team photos if applicable
2. Go to GBP → Photos
3. Upload all photos with descriptive filenames
4. Set logo and cover photo appropriately
5. Screenshot the photo gallery`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 6,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Write Business Description',
            instructions: `1. Write a 750-character business description that includes:
   - What the business does
   - Key services offered
   - Service area/location mentions
   - Unique selling points
2. Avoid promotional language or special characters
3. Do NOT include URLs or phone numbers
4. Go to GBP → Edit profile → Description
5. Save and screenshot the published description`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 15,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 7,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Set Up Services/Products',
            instructions: `1. Go to GBP → Edit profile → Services (or Products)
2. Add ALL services the business offers
3. Include service descriptions and prices if applicable
4. Group services into logical categories
5. For products, add product photos
6. Screenshot the complete services/products list`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 8,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Configure Business Hours',
            instructions: `1. Go to GBP → Edit profile → Hours
2. Set regular business hours for each day
3. Add special hours for holidays if known
4. Enable "More hours" for specific services if applicable
5. Screenshot the hours configuration`,
            category: 'GBP_SETUP',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 5,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 9,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Submit to Top Citation Directories',
            instructions: `1. Create listings on the top 10 citation sites:
   - Yelp
   - Facebook Business
   - Apple Maps
   - Bing Places
   - Yellow Pages
   - BBB (if applicable)
   - Industry-specific directories
2. Use EXACT NAP format documented earlier
3. Add consistent description and categories
4. Document submission URLs`,
            category: 'CITATIONS',
            evidenceType: 'TEXT',
            estimatedMinutes: 60,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 10,
            dependsOnTaskIds: [5]
        },
        {
            title: 'Set Up Rank Tracking',
            instructions: `1. Choose rank tracking tool (LocalFalcon, BrightLocal, etc.)
2. Add the business location
3. Configure tracking for:
   - 5-10 primary keywords
   - Local pack results
   - Organic results
4. Set up grid tracking if using LocalFalcon
5. Screenshot the tracking dashboard setup`,
            category: 'TRACKING',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 11,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Request Initial Reviews',
            instructions: `1. Generate a Google review link:
   - Go to GBP → Share review form
   - Copy the short URL
2. Create a review request template message
3. Send to 5-10 initial customers/contacts
4. Document the review request process
5. Note: Skip for Rank & Rent without real customers yet`,
            category: 'REVIEWS',
            evidenceType: 'TEXT',
            estimatedMinutes: 15,
            isRequired: false,
            requiresOwnerApproval: true,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 12,
            dependsOnTaskIds: [1]
        }
    ]
}

// ============= GBP SUSPENSION RECOVERY SOP =============
export const suspensionRecoverySOP: SOPTemplateData = {
    name: 'GBP Suspension Recovery',
    description: 'Step-by-step process to recover from a Google Business Profile suspension',
    type: 'SUSPENSION_RECOVERY',
    applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
    tasks: [
        {
            title: 'Identify Suspension Type',
            instructions: `1. Log into Google Business Profile Manager
2. Check the suspension notice/message
3. Identify the type:
   - SOFT suspension: Profile disabled, can still access
   - HARD suspension: Profile removed, cannot access
4. Note any specific reason mentioned
5. Check email for any Google communications
6. Document the suspension type and any messages`,
            category: 'DOCUMENTATION',
            evidenceType: 'TEXT',
            estimatedMinutes: 10,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 1,
            dependsOnTaskIds: []
        },
        {
            title: 'Complete Risk Factor Checklist',
            instructions: `Review and document each potential issue:
□ NAP inconsistencies across the web
□ Keyword stuffing in business name
□ Virtual office or PO Box address
□ Multiple listings for same business
□ Fake reviews or review manipulation
□ Incorrect business category
□ Stock photos or scraped images
□ Thin or duplicate website content
□ Spammy link building
□ Recent edits that may have triggered

Mark which issues apply and need to be fixed.`,
            category: 'DOCUMENTATION',
            evidenceType: 'CHECKLIST',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 2,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Gather Evidence Documents',
            instructions: `Collect documentation proving business legitimacy:
1. Business license or registration
2. Utility bill showing address
3. Bank statement with business name
4. Photos of physical location (storefront, signage)
5. Photos of team/employees at location
6. Lease agreement (if applicable)
7. Vehicle wraps or branded equipment photos

Compile into a single PDF or folder.`,
            category: 'DOCUMENTATION',
            evidenceType: 'FILE',
            estimatedMinutes: 30,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 3,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Fix Identified Issues',
            instructions: `Before requesting reinstatement, fix all issues:
1. Clean up business name (remove keywords)
2. Update address to physical location
3. Remove duplicate listings
4. Request removal of fake reviews
5. Update NAP on all citation sites
6. Remove stock photos, add authentic images
7. Fix website issues if applicable

Document each fix made.`,
            category: 'VERIFICATION',
            evidenceType: 'TEXT',
            estimatedMinutes: 60,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 4,
            dependsOnTaskIds: [2]
        },
        {
            title: 'Submit Reinstatement Request',
            instructions: `1. Go to the GBP Support page:
   support.google.com/business/gethelp
2. Select "Disabled listing" or "Suspended profile"
3. Fill out the reinstatement form completely
4. Include:
   - Clear business description
   - Why the listing should be reinstated
   - What corrective actions were taken
5. Attach evidence documents
6. Screenshot the submission confirmation`,
            category: 'VERIFICATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 5,
            dependsOnTaskIds: [3, 4]
        },
        {
            title: 'Submit Video Verification (if required)',
            instructions: `If Google requests video verification:
1. Record a video showing:
   - Walk from public road to business entrance
   - Business signage clearly visible
   - Interior of the business
   - Business license/documents on wall
   - Staff working if applicable
2. Keep video under 30 seconds
3. Upload to the verification link provided
4. Note the date and time of submission`,
            category: 'VERIFICATION',
            evidenceType: 'TEXT',
            estimatedMinutes: 30,
            isRequired: false,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 6,
            dependsOnTaskIds: [5]
        },
        {
            title: 'Post-Reinstatement Cleanup',
            instructions: `Once reinstated:
1. Re-verify all GBP information is correct
2. Re-upload photos if they were removed
3. Update hours and services
4. Do NOT make major changes for 30 days
5. Monitor for any new issues
6. Screenshot the restored live listing`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 7,
            dependsOnTaskIds: [5]
        },
        {
            title: '30-Day Monitoring Period',
            instructions: `For 30 days after reinstatement:
1. Check GBP status daily
2. Do not edit business name or address
3. Monitor for negative SEO attacks
4. Keep documentation of any issues
5. Respond to any new reviews promptly
6. After 30 days, document stable status`,
            category: 'TRACKING',
            evidenceType: 'TEXT',
            estimatedMinutes: 10,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 8,
            dependsOnTaskIds: [7]
        }
    ]
}

// ============= REBRAND SOP =============
export const rebrandSOP: SOPTemplateData = {
    name: 'Rebrand / Business Update',
    description: 'Complete checklist for handling business name changes, moves, or major updates',
    type: 'REBRAND',
    applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
    tasks: [
        {
            title: 'Document New Brand Information',
            instructions: `Collect and document all new business information:
1. New business name (if changing)
2. New address (if moving)
3. New phone number (if changing)
4. New website URL (if applicable)
5. New logo files
6. New brand colors
7. Updated service offerings

Create a "New NAP" document with exact formatting`,
            category: 'DOCUMENTATION',
            evidenceType: 'TEXT',
            estimatedMinutes: 15,
            isRequired: true,
            requiresOwnerApproval: true,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 1,
            dependsOnTaskIds: []
        },
        {
            title: 'Update Google Business Profile Name',
            instructions: `1. Go to GBP Manager → Edit profile → Business name
2. Change to the new business name
3. IMPORTANT: Use only the legal business name
4. Do not add keywords, locations, or taglines
5. You may need to re-verify if name change is significant
6. Screenshot before and after`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 10,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 2,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Update GBP Address',
            instructions: `1. Go to GBP Manager → Edit profile → Location
2. Update to the new address
3. Ensure exact formatting matches USPS standards
4. You will likely need to re-verify via postcard
5. Update service area if applicable
6. Screenshot the new location settings`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 10,
            isRequired: false,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 3,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Update GBP Phone Number',
            instructions: `1. Go to GBP Manager → Edit profile → Contact
2. Update the primary phone number
3. Ensure call tracking still works if applicable
4. Update any additional phone numbers
5. Screenshot the new contact information`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 5,
            isRequired: false,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 4,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Re-evaluate Categories',
            instructions: `1. Review if the rebrand affects services offered
2. Check if primary category is still optimal
3. Add or remove secondary categories as needed
4. Research competitor categories if business focus changed
5. Screenshot updated categories`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 15,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 5,
            dependsOnTaskIds: [2]
        },
        {
            title: 'Update Website Branding',
            instructions: `1. Update logo on all pages
2. Update business name in title tags
3. Update NAP in footer and contact page
4. Update any embedded maps
5. Create/update about page with new info
6. Update schema markup (LocalBusiness)
7. Screenshot key updated pages`,
            category: 'WEBSITE',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 60,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL'],
            order: 6,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Update Schema Markup',
            instructions: `1. Update LocalBusiness schema with new NAP
2. Ensure schema types match new business focus
3. Test with Google Rich Results Test
4. Include:
   - New name
   - New address
   - New phone
   - sameAs links to social profiles
5. Screenshot validation results`,
            category: 'WEBSITE',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL'],
            order: 7,
            dependsOnTaskIds: [6]
        },
        {
            title: 'Update All Citation Sites',
            instructions: `1. Export current citation list
2. Prioritize major directories:
   - Yelp, Facebook, Apple Maps, Bing Places
   - Industry-specific directories
3. Update NAP on each platform
4. Remove duplicate or old listings
5. Document each updated citation
6. Allow 2-4 weeks for changes to propagate`,
            category: 'CITATIONS',
            evidenceType: 'TEXT',
            estimatedMinutes: 120,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 8,
            dependsOnTaskIds: [1]
        },
        {
            title: 'Monitor Review Impact',
            instructions: `1. Set up alerts for new reviews
2. Check if any reviews mention confusion about new name
3. Respond to reviews mentioning the change professionally
4. Consider posting GBP update explaining the rebrand
5. Monitor review velocity for any changes
6. Document review trends weekly for 1 month`,
            category: 'REVIEWS',
            evidenceType: 'TEXT',
            estimatedMinutes: 15,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 9,
            dependsOnTaskIds: [2]
        },
        {
            title: 'Track Ranking Impact',
            instructions: `1. Update rank tracking with new business name
2. Take baseline ranking snapshot before changes
3. Monitor weekly for ranking changes
4. Document any drops or gains
5. After 30 days, create ranking impact report
6. Compare before/after keyword positions`,
            category: 'TRACKING',
            evidenceType: 'TEXT',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['TRADITIONAL', 'GMB_ONLY'],
            order: 10,
            dependsOnTaskIds: [2]
        }
    ]
}

// ============= ONGOING MAINTENANCE SOP =============
export const maintenanceSOP: SOPTemplateData = {
    name: 'Monthly Local SEO Maintenance',
    description: 'Recurring monthly tasks to maintain and improve local SEO presence',
    type: 'MAINTENANCE',
    applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
    tasks: [
        {
            title: 'Create GBP Post',
            instructions: `1. Create at least 1 Google Business Profile post
2. Options:
   - What\'s New: General updates
   - Offer: Promotions or specials
   - Event: Upcoming events
3. Include:
   - Engaging image or video
   - Clear call-to-action
   - Relevant keywords naturally
4. Schedule posts weekly if possible
5. Screenshot the published post`,
            category: 'CONTENT',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 15,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 1,
            dependsOnTaskIds: []
        },
        {
            title: 'Upload New Photos',
            instructions: `1. Add 2-5 new photos to GBP
2. Ideas for photos:
   - Recent completed projects
   - Team photos
   - Seasonal updates
   - Behind-the-scenes
3. Use geo-tagged photos if possible
4. Add descriptive alt text
5. Screenshot the updated photo gallery`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 15,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 2,
            dependsOnTaskIds: []
        },
        {
            title: 'Monitor Q&A Section',
            instructions: `1. Go to GBP → Q&A section
2. Check for any new questions
3. Answer all pending questions promptly
4. Add your own Q&As for common questions
5. Report any spam or competitor questions
6. Screenshot any new Q&A activity`,
            category: 'GBP_OPTIMIZATION',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 10,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 3,
            dependsOnTaskIds: []
        },
        {
            title: 'Check Review Velocity',
            instructions: `1. Review total reviews vs. last month
2. Calculate monthly review velocity:
   New reviews this month ÷ 30 = daily velocity
3. Compare to competitor velocity
4. Identify any review gaps
5. Document:
   - Total reviews
   - New reviews this month
   - Average rating
   - Any negative reviews needing attention`,
            category: 'REVIEWS',
            evidenceType: 'TEXT',
            estimatedMinutes: 10,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 4,
            dependsOnTaskIds: []
        },
        {
            title: 'Respond to New Reviews',
            instructions: `1. Identify all unresponded reviews
2. Respond to EVERY review:
   - Positive: Thank them, mention specifics
   - Neutral: Thank them, address concerns
   - Negative: Apologize, offer resolution
3. Use owner responses strategically
4. Include keywords naturally
5. Screenshot responses to negative reviews`,
            category: 'REVIEWS',
            evidenceType: 'SCREENSHOT',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 5,
            dependsOnTaskIds: [4]
        },
        {
            title: 'Check Competitor Rankings',
            instructions: `1. Search top 3-5 target keywords
2. Document who appears in local pack
3. Note any new competitors
4. Check competitor:
   - Review count/rating
   - Recent posts
   - New photos
5. Document competitive position changes`,
            category: 'TRACKING',
            evidenceType: 'TEXT',
            estimatedMinutes: 20,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 6,
            dependsOnTaskIds: []
        },
        {
            title: 'Audit Citations',
            instructions: `1. Spot-check 5 major citation sites
2. Verify NAP is still accurate
3. Check for any duplicate listings
4. Look for new opportunities
5. Note any citations needing updates
6. Document findings`,
            category: 'CITATIONS',
            evidenceType: 'TEXT',
            estimatedMinutes: 20,
            isRequired: false,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 7,
            dependsOnTaskIds: []
        },
        {
            title: 'Generate Monthly Report',
            instructions: `Create monthly performance report including:
1. Ranking changes (local pack + organic)
2. GBP insights:
   - Search views
   - Map views
   - Website clicks
   - Direction requests
   - Phone calls
3. Review summary
4. Actions taken this month
5. Recommendations for next month
6. Screenshot or export report`,
            category: 'TRACKING',
            evidenceType: 'FILE',
            estimatedMinutes: 30,
            isRequired: true,
            requiresOwnerApproval: false,
            applicableBusinessTypes: ['RANK_RENT', 'TRADITIONAL', 'GMB_ONLY'],
            order: 8,
            dependsOnTaskIds: [4, 6]
        }
    ]
}

// All SOP Templates
export const allSOPTemplates: SOPTemplateData[] = [
    newLocationSetupSOP,
    suspensionRecoverySOP,
    rebrandSOP,
    maintenanceSOP
]

// Helper function to filter tasks by business type
export function filterTasksForBusinessType(
    tasks: TaskTemplateData[],
    businessType: BusinessType
): TaskTemplateData[] {
    return tasks.filter(task =>
        task.applicableBusinessTypes.includes(businessType)
    )
}

// Helper to check if a task requires website (for GMB-only filtering)
export function isWebsiteTask(task: TaskTemplateData): boolean {
    return task.category === 'WEBSITE'
}
