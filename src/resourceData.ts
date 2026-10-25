export type VerificationStatus = 'Verified' | 'Needs review'

export type ResourceLink = {
  label: string
  url?: string
  phone?: string
  verificationStatus: VerificationStatus
  lastVerified: string
  note?: string
  walkthrough?: VisualWalkthrough
}

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
  annotations: WalkthroughAnnotation[]
}

export type VisualWalkthrough = {
  id: string
  title: string
  officialWebsiteUrl: string
  status: 'Draft' | 'Verified' | 'Needs recapture'
  lastCapturedAt?: string
  mayBeOutdated: boolean
  outdatedReason?: string
  aiSupportNotes: string[]
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

const today = '2026-10-25'

export const ACTION_CARDS: ActionCard[] = [
  {
    id: 'shelter-intake',
    title: 'Contact family emergency shelter intake',
    category: 'immediate',
    whyThisMatters:
      'A shelter intake team can help with urgent safe placement, transportation options, and referrals for longer-term housing support.',
    steps: [
      'Call 206-245-1026 and say you are a domestic violence survivor with two school-age children who needs safe placement within the next few days.',
      'Ask specifically about emergency family shelter openings, safe placement, transportation, and longer-term housing referrals.',
      'Write down the person you spoke with, callback instructions, and next steps in case no bed is available right away.',
    ],
    usefulDocuments: {
      required: ['Requirements vary by provider and were not fully verified for this prototype.'],
      alternativesToConfirm: ['Ask whether a referral letter, shelter note, or verbal screening can be used when documents are missing.'],
      helpful: ['Any photo of existing records, school paperwork, or benefit letters may help but may not be required.'],
      unverified: ['Exact intake eligibility and placement rules need manual verification before launch.'],
    },
    missingDocsPlan:
      'If you do not have documents, still call. Ask what can be started now and what can be submitted later.',
    endGoal:
      'End goal: secure a safe short-term placement plan and clear next contacts for ongoing housing support.',
    resources: [
      {
        label: 'King County emergency family shelter intake',
        phone: '206-245-1026',
        verificationStatus: 'Needs review',
        lastVerified: today,
        note: 'Phone number is listed for prototype use and must be manually verified before public launch.',
      },
    ],
  },
  {
    id: 'dshs-benefits',
    title: 'Contact Washington DSHS about food and cash benefits',
    category: 'immediate',
    whyThisMatters:
      'You may be able to begin parts of Basic Food and cash assistance applications even while replacing missing records.',
    steps: [
      'Open Washington Connection and start the application for Basic Food and cash assistance.',
      'Select the benefits you need, then call DSHS to explain that children\'s Social Security numbers and birth certificates are currently unavailable.',
      'Ask DSHS which verification steps can be completed now, which documents are required later, and whether alternatives apply in your case.',
    ],
    usefulDocuments: {
      required: ['Program requirements vary; ask DSHS for the exact list tied to your application.'],
      alternativesToConfirm: ['Ask DSHS what temporary or alternate verification may be accepted while records are missing.'],
      helpful: ['Any prior case numbers, school records, or shelter paperwork.'],
      unverified: ['Do not assume exemptions; confirm each requirement directly with DSHS.'],
    },
    missingDocsPlan:
      'Tell DSHS right away which records are missing and ask them to note that in your case so you can keep moving forward safely.',
    endGoal:
      'End goal: submit what you can now and leave with a checklist of remaining verification steps from DSHS.',
    resources: [
      {
        label: 'Washington Connection',
        url: 'https://www.washingtonconnection.org/',
        verificationStatus: 'Verified',
        lastVerified: today,
        walkthrough: {
          id: 'wa-connection-basic-food',
          title: 'Washington Connection navigation walkthrough (draft)',
          officialWebsiteUrl: 'https://www.washingtonconnection.org/',
          status: 'Draft',
          mayBeOutdated: true,
          outdatedReason:
            'Screenshot capture and step-by-step verification are still pending and must be completed before relying on this guide.',
          aiSupportNotes: [
            'This prototype only stores walkthrough metadata and annotations.',
            'To generate real screenshots, connect an external browsing/screenshot service (for example Playwright running in secure infrastructure).',
            'To generate or update annotations, connect an AI service that can process captured screenshots and requires human review before publishing.',
          ],
          steps: [
            {
              id: 'open-homepage',
              heading: 'Open the official homepage',
              instruction:
                'Visit the official Washington Connection homepage and manually confirm the visible page title before using this guide.',
              screenshotAlt:
                'Placeholder for a verified screenshot of the Washington Connection homepage.',
              annotations: [{ kind: 'highlight', label: 'Capture the main navigation area after verification.' }],
            },
            {
              id: 'find-application-entry',
              heading: 'Find where to begin an application',
              instruction:
                'After confirming the live page content, capture the section that starts the benefits application flow and add numbered annotations for each click.',
              screenshotAlt:
                'Placeholder for a verified screenshot showing where users begin the application flow.',
              annotations: [
                { kind: 'arrow', label: 'Point to the verified entry action for starting an application.' },
              ],
            },
          ],
        },
      },
      {
        label: 'Washington DSHS Basic Food',
        url: 'https://www.dshs.wa.gov/family-food-and-housing-services/food-assistance/basic-food-benefits',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
      {
        label: 'DSHS Social Security number guidance',
        url: 'https://www.dshs.wa.gov/social-security-numbers-ssn',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
      {
        label: 'DSHS customer service',
        phone: '877-501-2233',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
    ],
  },
  {
    id: 'school-liaison',
    title: 'Contact the school district McKinney-Vento liaison',
    category: 'immediate',
    whyThisMatters:
      'Students experiencing homelessness may have protections for immediate enrollment, school stability, transportation support, and meal access.',
    steps: [
      'Open the OSPI homelessness page, then open the liaison contact list for your district.',
      'Call or email the liaison and explain your family is in a shelter or temporary housing.',
      'Ask about staying in the current school, transportation, free school meals, and how to proceed if records are missing.',
    ],
    usefulDocuments: {
      required: ['Specific school paperwork requirements vary by district.'],
      alternativesToConfirm: ['Ask what can be accepted temporarily if birth certificates or school records are not available right now.'],
      helpful: ['Current school name, student names, and any existing school ID numbers if available.'],
      unverified: ['District-level procedures may change and should be confirmed with the liaison.'],
    },
    missingDocsPlan:
      'Request immediate enrollment and support pathways while missing documents are being recovered.',
    endGoal:
      'End goal: establish a school continuity plan that supports attendance, meals, and transportation.',
    resources: [
      {
        label: 'OSPI students experiencing homelessness',
        url: 'https://ospi.k12.wa.us/student-success/access-opportunity-education/students-experiencing-homelessness',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
      {
        label: 'OSPI homeless education liaison contact list',
        url: 'https://ospi.k12.wa.us/student-success/access-opportunity-education/students-experiencing-homelessness/homeless-education-liaison-contact-list',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
    ],
  },
  {
    id: 'birth-records',
    title: 'Find the children\'s birth records',
    category: 'next',
    whyThisMatters:
      'Birth records are often requested during school, benefits, and identity-related processes.',
    steps: [
      'List each child\'s birth state first.',
      'If born in Washington, open the WA Department of Health birth record page and review eligibility and identity instructions before paying.',
      'If born outside Washington, use that state\'s official vital records office and confirm equivalent requirements.',
    ],
    usefulDocuments: {
      required: ['Identity and qualifying-relationship documentation is required for certified copies.'],
      alternativesToConfirm: ['When no photo ID is available, confirm official alternate identification instructions with the vital records office.'],
      helpful: ['Any prior hospital paperwork, immunization records, or school records with birth details.'],
      unverified: ['Do not assume records can be issued without further verification.'],
    },
    missingDocsPlan:
      'Contact the office first to avoid paying for an order that cannot be completed without additional identity evidence.',
    endGoal:
      'End goal: understand exact birth-record requirements and complete the correct request path for each child.',
    resources: [
      {
        label: 'Washington State Department of Health birth records',
        url: 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
    ],
  },
  {
    id: 'ssa-cards',
    title: 'Find out how to replace Social Security cards',
    category: 'next',
    whyThisMatters:
      'Some programs may request Social Security information, and replacement card steps can take time.',
    steps: [
      'Ask DSHS first what is required for your current benefits application.',
      'If replacement cards are needed, open the SSA replace-card page and review identity evidence rules.',
      'Call SSA before appointments to confirm acceptable alternatives when documents are missing.',
    ],
    usefulDocuments: {
      required: ['SSA identity and evidence requirements apply.'],
      alternativesToConfirm: ['Ask which alternatives are acceptable before traveling to an office.'],
      helpful: ['Any previous SSA letters, case references, or related state agency notes.'],
      unverified: ['Do not assume replacement approval until SSA confirms documentation.'],
    },
    missingDocsPlan:
      'Use DSHS guidance to prioritize what is truly needed now versus what can be completed later.',
    endGoal:
      'End goal: decide whether card replacement is needed now and confirm exactly which evidence to bring.',
    resources: [
      {
        label: 'SSA replace Social Security card',
        url: 'https://www.ssa.gov/number-card/replace-card',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
      {
        label: 'Social Security Administration phone',
        phone: '800-772-1213',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
    ],
  },
  {
    id: 'housing-follow-up',
    title: 'Follow up on housing and financial assistance',
    category: 'later',
    whyThisMatters:
      'Longer-term housing and financial supports often require multiple follow-ups and referrals over time.',
    steps: [
      'Ask shelter intake staff or an advocate for referrals to transitional housing, rapid rehousing, and financial assistance programs.',
      'Track each referral date and who to contact if you do not hear back.',
      'Continue checking on pending benefit applications and remaining verification requests.',
    ],
    usefulDocuments: {
      required: ['Referral and application requirements vary by program.'],
      alternativesToConfirm: ['Ask each program which alternatives can be used while records are still being replaced.'],
      helpful: ['A written list of application IDs, deadlines, and callback names.'],
      unverified: ['Referrals do not guarantee placement or payment.'],
    },
    missingDocsPlan:
      'Keep moving with available referrals and ask every program what can be started before all documents are recovered.',
    endGoal:
      'End goal: build a steady follow-up plan for housing placement and financial stability.',
    resources: [],
  },
]

export const REVIEW_NEEDED_ITEMS = [
  'King County emergency family shelter intake phone number (206-245-1026) needs manual verification before public launch.',
  'Shelter-specific document requirements and intake eligibility rules must be confirmed with current providers.',
]
