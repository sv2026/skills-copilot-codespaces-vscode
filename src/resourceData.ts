export type VerificationStatus = 'Verified' | 'Needs review'

export type ResourceLink = {
  label: string
  url?: string
  phone?: string
  verificationStatus: VerificationStatus
  lastVerified: string
  note?: string
  requiresWalkthrough?: boolean
  walkthrough?: VisualWalkthrough
}

export type WalkthroughStepVerificationStatus = 'confirmed' | 'partially explored' | 'needs review'

export type WalkthroughAnnotation = {
  kind: 'highlight' | 'arrow'
  label: string
}

export type WalkthroughStep = {
  id: string
  heading: string
  instruction: string
  screenshotAlt: string
  screenshotUrl?: string
  sourceUrl?: string
  screenshotEvidence?: WalkthroughScreenshotEvidence
  verificationStatus: WalkthroughStepVerificationStatus
  annotations: WalkthroughAnnotation[]
}

export type WalkthroughScreenshotEvidence = {
  capturedAt: string
  sourceUrl: string
  viewport: {
    width: number
    height: number
  }
  reviewedByHuman: boolean
}

export type VisualWalkthrough = {
  id: string
  title: string
  userGoal: string
  serviceName: string
  officialWebsiteUrl: string
  status: 'Draft' | 'Verified' | 'Needs review'
  lastCapturedAt?: string
  checkedOn?: string
  mayBeOutdated: boolean
  outdatedReason?: string
  aiSupportNotes: string[]
  summary?: string
  steps: WalkthroughStep[]
}

export type ActionCard = {
  id: string
  title: string
  category: 'immediate' | 'next' | 'later'
  whyThisMatters: string
  steps: string[]
  usefulDocuments: {
    required: string[]
    alternativesToConfirm: string[]
    helpful: string[]
    unverified: string[]
  }
  missingDocsPlan: string
  endGoal: string
  resources: ResourceLink[]
}

export type CountyEntry = {
  label: string
  phone?: string
  url?: string
  note: string
}

const countyChecked = '2026-11-03'
export const COUNTY_CHECKED_DATE = countyChecked

// Housing access points found on official county or lead-agency pages; every entry still needs human review.
export const COUNTY_ENTRY_POINTS: Record<string, CountyEntry> = {
  'King County': {
    label: 'King County Regional Access Points',
    url: 'https://kcrha.org/find-services/for-people-experiencing-homelessness/',
    note: 'Listed on kcrha.org.',
  },
  'Pierce County': {
    label: 'Pierce County Access Pierce',
    url: 'https://www.piercecountywa.gov/4809/Find-Housing-Help',
    note: 'Listed on piercecountywa.gov.',
  },
  'Snohomish County': {
    label: 'Snohomish County coordinated entry (VOA Connect Line)',
    phone: '360-862-4357',
    url: 'https://snohomishcountywa.gov/2238/Coordinated-Entry',
    note: 'Listed on snohomishcountywa.gov.',
  },
  'Kitsap County': {
    label: 'Kitsap Housing Solutions Center',
    phone: '360-473-2035',
    url: 'https://www.kitsap.gov/hs/Pages/HH-Resources.aspx',
    note: 'Bremerton number listed on kitsap.gov.',
  },
  'Thurston County': {
    label: 'Thurston County housing and shelter line',
    phone: '844-628-7343',
    url: 'https://fscss.org/coordinated-entry/',
    note: 'Listed by the county coordinated entry lead agency.',
  },
  'Whatcom County': {
    label: 'Whatcom County coordinated entry access',
    phone: '360-734-5121',
    note: 'Listed on whatcomcounty.us.',
  },
  'Skagit County': {
    label: 'Skagit County coordinated entry (VOA Connect Line)',
    phone: '360-862-4357',
    url: 'https://www.voaww.org/connect',
    note: 'Listed by the provider, not on a county page.',
  },
  'Island County': {
    label: 'Island County Housing Support Center',
    url: 'https://www.islandcountywa.gov/890/Housing-Support-Center',
    note: 'No intake phone confirmed on the county page.',
  },
  'Clark County': {
    label: 'Clark County Housing Solutions Center',
    phone: '360-695-9677',
    url: 'https://hsc-swwa.org/partner-resources/coordinated-entry/',
    note: 'Listed by the county coordinated entry lead agency.',
  },
  'Cowlitz County': {
    label: 'Cowlitz County coordinated entry',
    url: 'https://www.co.cowlitz.wa.us/2540/Coordinated-Entry',
    note: 'Listed on co.cowlitz.wa.us.',
  },
  'Lewis County': {
    label: 'Lewis County coordinated entry (CCAP)',
    phone: '360-836-1937',
    url: 'https://lewiscountywa.gov/departments/public-health/social-services/homeless-and-housing-program/',
    note: 'Listed on lewiscountywa.gov.',
  },
  'Mason County': {
    label: 'Mason County housing and homelessness',
    url: 'https://masoncountywa.gov/departments/public_health/community_health_and_human_services/housing_homelessness.php',
    note: 'County page lists a North Mason number that looks wrong, so no phone is shown.',
  },
  'Jefferson County': {
    label: 'Jefferson County housing services (OlyCAP)',
    url: 'https://olycap.org/housing-services',
    note: 'Phone not confirmed on the provider page.',
  },
  'Clallam County': {
    label: 'Clallam County Housing Resource Center (Port Angeles)',
    phone: '360-452-7224',
    url: 'https://serenityhouseclallam.org/coordinated-entry/',
    note: 'Port Angeles number; Sequim and Forks centers are listed on the same page.',
  },
  'Pacific County': {
    label: 'Pacific County coordinated entry (CCAP)',
    phone: '360-533-5100',
    url: 'https://www.coastalcap.org/housing-and-energy-services/housing-services/',
    note: 'Number not re-confirmed on the exact page.',
  },
  'Grays Harbor County': {
    label: 'Grays Harbor coordinated entry (CCAP)',
    phone: '360-533-5100',
    url: 'https://www.coastalcap.org/',
    note: 'County website page was unavailable when checked.',
  },
  'Wahkiakum County': {
    label: 'Wahkiakum County community assistance',
    url: 'https://www.co.wahkiakum.wa.us/244/Community-Assistance',
    note: 'No phone confirmed on the county page.',
  },
}

export const REVIEW_NEEDED_ITEMS = [
  'County housing access points were found on official county or lead-agency pages on 2026-11-03. Confirm each before launch.',
  'San Juan County has no confirmed access point yet.',
  'Wait times, eligibility, and document requirements for shelters were not verified.',
  'Screenshot walkthroughs not yet reviewed by a person are labeled "needs review".',
]
