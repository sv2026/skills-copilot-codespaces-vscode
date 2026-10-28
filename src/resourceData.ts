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
  verificationStatus: WalkthroughStepVerificationStatus
  annotations: WalkthroughAnnotation[]
}

export type VisualWalkthrough = {
  id: string
  title: string
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

const today = '2026-10-25'
const birthRecordCheckDate = '2026-10-26'

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
    id: 'dshs-food-assistance',
    title: 'Contact Washington DSHS about food assistance',
    category: 'immediate',
    whyThisMatters:
      'Food assistance can help cover groceries while you work through other paperwork or school-related needs.',
    steps: [
      'Open Washington Connection and start the Basic Food application if you need help with groceries right now.',
      'Tell DSHS whether you need help with groceries only or if you are also applying for other supports.',
      'Ask what documents are required now and what can be submitted later if you do not have them on hand.',
    ],
    usefulDocuments: {
      required: ['Program requirements vary; ask DSHS for the exact list tied to your application.'],
      alternativesToConfirm: ['Ask whether temporary or alternative verification can be used while records are missing.'],
      helpful: ['Any prior benefit letters, shelter notes, or school-related paperwork.'],
      unverified: ['Do not assume a decision before DSHS confirms the information required.'],
    },
    missingDocsPlan:
      'Ask DSHS what information they can take now and what can be completed later without delaying the food application.',
    endGoal:
      'End goal: confirm the right food-assistance path and complete the next step without unnecessary delays.',
    resources: [
      {
        label: 'Washington Connection',
        url: 'https://www.washingtonconnection.org/',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
      {
        label: 'Washington DSHS Basic Food',
        url: 'https://www.dshs.wa.gov/family-food-and-housing-services/food-assistance/basic-food-benefits',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
    ],
  },
  {
    id: 'dshs-cash-assistance',
    title: 'Contact Washington DSHS about cash assistance',
    category: 'immediate',
    whyThisMatters:
      'Cash assistance can help with urgent household expenses when your income is not covering basic needs.',
    steps: [
      'Open Washington Connection and begin the cash-assistance application if this is a need you have selected.',
      'Ask DSHS what documents are required now and which ones can be provided later if your records are incomplete.',
      'Keep a written checklist of deadlines, case numbers, and next steps so you can follow up clearly.',
    ],
    usefulDocuments: {
      required: ['Program requirements vary; ask DSHS for the exact list tied to your application.'],
      alternativesToConfirm: ['Ask whether temporary or alternative verification can be used while records are missing.'],
      helpful: ['Any prior benefit letters, pay stubs, or school or housing paperwork that may help explain your situation.'],
      unverified: ['Do not assume a final decision before DSHS confirms the information required.'],
    },
    missingDocsPlan:
      'Tell DSHS which records are missing and ask what can be submitted now versus later so your application can move forward.',
    endGoal:
      'End goal: clarify the cash-assistance path and complete the next step with a clear list of requirements.',
    resources: [
      {
        label: 'Washington Connection',
        url: 'https://www.washingtonconnection.org/',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
      {
        label: 'DSHS Social Security number guidance',
        url: 'https://www.dshs.wa.gov/social-security-numbers-ssn',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
    ],
  },
  {
    id: 'school-support',
    title: 'Contact your school district about staying in your current school',
    category: 'next',
    whyThisMatters:
      'School stability support can help families keep students in their current school while they work through paperwork, enrollment, or attendance concerns.',
    steps: [
      'Contact the school district attendance or enrollment office and explain that you want to keep your child in their current school.',
      'Ask what records are needed right now and which records can be submitted later.',
      'Request any transportation, enrollment, or attendance support that may be available without a housing crisis.',
    ],
    usefulDocuments: {
      required: ['School requirements vary by district.'],
      alternativesToConfirm: ['Ask what can be accepted temporarily while documents are being replaced.'],
      helpful: ['Current school name, student name, and any existing student ID or school records.'],
      unverified: ['Specific district procedures may vary and should be confirmed directly.'],
    },
    missingDocsPlan:
      'Ask the school district what can be completed now so the student can stay in school while other records are recovered.',
    endGoal:
      'End goal: keep the student attached to their current school and get clear next steps for records or enrollment.',
    resources: [
      {
        label: 'Washington school district enrollment support',
        url: 'https://www.k12.wa.us/student-success/access-opportunity-education',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
    ],
  },
  {
    id: 'school-liaison',
    title: 'Contact the school district support team for housing-related school stability',
    category: 'immediate',
    whyThisMatters:
      'When a family is moving or temporarily housed, school districts may have extra supports for enrollment, attendance, transportation, and school continuity.',
    steps: [
      'Open the OSPI homelessness page, then open the liaison contact list for your district.',
      'Call or email the liaison and explain your family is in temporary housing or is moving between placements.',
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
        lastVerified: birthRecordCheckDate,
        walkthrough: {
          id: 'wa-doh-birth-record-ordering',
          title: 'Washington birth certificate ordering process',
          serviceName: 'Washington State Department of Health Vital Records',
          officialWebsiteUrl: 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record',
          status: 'Verified',
          lastCapturedAt: birthRecordCheckDate,
          checkedOn: birthRecordCheckDate,
          mayBeOutdated: false,
          aiSupportNotes: [
            'The public Department of Health page confirms the official product categories, eligibility, required information, and fee starting point.',
            'The public VitalChek landing page is the public entry point for online ordering but the actual form requires personal information, identity validation, and payment.',
            'The restricted identity-check and payment screens were not visited because they require real personal information and access controls.',
          ],
          summary:
            'The public process starts on the Washington Department of Health (DOH) birth record page and then routes users to a public VitalChek ordering entry page. The actual application, identity checks, and payment remain restricted and were not explored with real data.',
          steps: [
            {
              id: 'doh-birth-record-overview',
              heading: 'Confirm the official service and public requirements',
              instruction:
                'Open the Washington Department of Health birth record page and confirm the record products, who qualifies, and the required information before ordering.',
              screenshotAlt: 'Washington State Department of Health birth-record page showing the official record products and who qualifies.',
              screenshotUrl: '/wa-doh-birth-record-landing.png',
              sourceUrl: 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record',
              verificationStatus: 'confirmed',
              annotations: [
                { kind: 'highlight', label: 'Highlight the main eligibility and information requirements section.' },
                { kind: 'arrow', label: 'Point to the public “Who Qualifies?” and “What Do I Need to Provide?” sections.' },
              ],
            },
            {
              id: 'vitalchek-public-entry',
              heading: 'Open the public order entry page',
              instruction:
                'Use the public VitalChek ordering landing page to confirm that the state partners with an online ordering service for Washington birth certificates. Do not enter personal information beyond public browsing.',
              screenshotAlt: 'Public VitalChek landing page showing online order entry for vital records.',
              screenshotUrl: '/vitalchek-public-homepage.png',
              sourceUrl: 'https://www.vitalchek.com/',
              verificationStatus: 'confirmed',
              annotations: [
                { kind: 'highlight', label: 'Highlight the public “Order Certificate” entry area and the birth certificate options.' },
                { kind: 'arrow', label: 'Point to the publicly visible order flow, not the restricted form fields that require personal information.' },
              ],
            },
            {
              id: 'restricted-order-form',
              heading: 'Prepare for the restricted application step',
              instruction:
                'The DOH page says the order requires submitting the application, identity documentation, proof of qualifying relationship, and payment. That part was not safely explored because it requires real personal information and access controls.',
              screenshotAlt: 'No screenshot captured because the actual identity, relationship, and payment pages are restricted and require personal information.',
              sourceUrl: 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record',
              verificationStatus: 'partially explored',
              annotations: [
                { kind: 'highlight', label: 'Note that the public page lists the required information, but the actual form and payment screens remain restricted.' },
                { kind: 'arrow', label: 'Mark the remaining steps as needing verified data and authentication before they can be confirmed.' },
              ],
            },
          ],
        },
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
    id: 'immigration-support',
    title: 'Get help with immigration-related paperwork and referrals',
    category: 'next',
    whyThisMatters:
      'Immigration-related paperwork and service matching can be time-sensitive, and the right follow-up depends on whether you need document help, eligibility questions, or referrals to trusted services.',
    steps: [
      'Start by asking whether you need help with forms, identification, family-based paperwork, or referrals to an immigration-aware service.',
      'Use a trusted legal aid or community-organizing service to understand what documents may be required and what alternatives may be accepted.',
      'Write down the office name, phone number, and next deadline so you can follow up without losing track of the process.',
    ],
    usefulDocuments: {
      required: ['The exact papers needed depend on the immigration question and the service provider.'],
      alternativesToConfirm: ['Ask which documents can be submitted or summarized if original records are missing or incomplete.'],
      helpful: ['Any letters, notices, prior applications, or family documents that may explain the issue.'],
      unverified: ['Do not rely on online forms alone before a trusted provider confirms the right next steps.'],
    },
    missingDocsPlan:
      'Call or email an immigration-aware service and ask exactly which records they need from you before you submit anything.',
    endGoal:
      'End goal: identify the correct service or legal aid pathway and get a clear next step for your paperwork.',
    resources: [
      {
        label: 'Washington Immigration Resource Center',
        url: 'https://www.washingtonimmigration.org/',
        verificationStatus: 'Verified',
        lastVerified: today,
      },
      {
        label: 'Northwest Immigrant Rights Project',
        url: 'https://www.nwirp.org/',
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
