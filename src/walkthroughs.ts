import type { VisualWalkthrough } from './resourceData'

const walkthroughCaptureDate = '2026-11-01'
const ssaCaptureDate = '2026-11-09'
const birthRecordCheckDate = '2026-10-26'

export const WA_CONNECTION_WALKTHROUGH: VisualWalkthrough = {
id: 'wa-connection-basic-food-application',
title: 'Where to start: Washington Connection food help',
userGoal: 'See where to start your Basic Food application.',
serviceName: 'Washington Connection Public Benefits Online',
officialWebsiteUrl: 'https://www.washingtonconnection.org/',
status: 'Draft',
lastCapturedAt: walkthroughCaptureDate,
checkedOn: walkthroughCaptureDate,
mayBeOutdated: true,
outdatedReason:
  'The official application can change. Review these screenshots against the live website before relying on them.',
aiSupportNotes: [
  'These screenshots were captured from public Washington Connection pages and annotated with visible labels.',
  'The images are draft evidence, not a claim that the full application was completed or AI-generated.',
  'These pictures stop before any personal information, documents, payment, or sending the application.',
],
summary:
  'These pictures show where to start. The first picture is the page that tells you what to get ready. The second is where you pick Basic Food. Finish the rest on the official website.',
beforeYouStart: [
  'Name and date of birth for each person in your home',
  'Social Security number for each person who has one',
  'Citizenship or immigration status',
  'Income, such as pay or other money you get',
  'Savings and other things you own that are worth money',
  'Rent or housing costs, utilities, and child care costs',
  'The application takes about 60 minutes. You can save and finish later.',
],
steps: [
  {
    id: 'wa-connection-application-introduction',
    heading: 'Read what to get ready',
    instruction:
      'This page lists the information the application may ask for. Read it, then click Next.',
    screenshotAlt:
      'Annotated Washington Connection application introduction page showing the preparation list and Next control.',
    screenshotUrl: '/washington-connection-application-introduction-annotated.png',
    sourceUrl: 'https://www.washingtonconnection.org/eapplication/home.go?action=Introduction&source=',
    screenshotEvidence: {
      capturedAt: walkthroughCaptureDate,
      sourceUrl: 'https://www.washingtonconnection.org/eapplication/home.go?action=Introduction&source=',
      viewport: { width: 1440, height: 2200 },
      reviewedByHuman: false,
    },
    verificationStatus: 'needs review',
    annotations: [
      { kind: 'highlight', label: 'The page lists information categories that may be needed during the application.' },
      { kind: 'arrow', label: 'The visible Next control advances through the application guidance.' },
    ],
  },
  {
    id: 'wa-connection-basic-food-selection',
    heading: 'Pick Basic Food',
    instruction:
      'Under Food Assistance, pick Basic Food if you need food help. Then click Next.',
    screenshotAlt:
      'Annotated Washington Connection Your Needs page showing Basic Food selected under Food Assistance.',
    screenshotUrl: '/washington-connection-your-needs-basic-food-annotated.png',
    sourceUrl: 'https://www.washingtonconnection.org/eapplication/yourneeds.go',
    screenshotEvidence: {
      capturedAt: walkthroughCaptureDate,
      sourceUrl: 'https://www.washingtonconnection.org/eapplication/yourneeds.go',
      viewport: { width: 1440, height: 2200 },
      reviewedByHuman: false,
    },
    verificationStatus: 'needs review',
    annotations: [
      { kind: 'highlight', label: 'Basic Food is visibly listed under Food Assistance.' },
      { kind: 'arrow', label: 'The visible Next control continues after the relevant benefit selection.' },
    ],
  },
],
}

export const BIRTH_RECORD_WALKTHROUGH: VisualWalkthrough = {
id: 'wa-doh-birth-record-ordering',
title: 'Where to start: Washington birth certificate',
userGoal: 'See where to start ordering a Washington birth certificate.',
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
  'These pictures show where to start. First read the Washington Department of Health page. Then open the VitalChek page to order. The order form asks for personal information, so we do not show it.',
beforeYouStart: [
  'The full name of the person on the birth certificate (first, middle, last)',
  'Their date of birth',
  'The city or county where they were born in Washington',
  'The first and last names of all parents on the record',
  'Your ID: a valid government ID, or another kind the state accepts',
  'Proof of how you are related, if you are not ordering your own',
  'A way to pay. Fees start at $25. Some people can get one for free.',
],
steps: [
  {
    id: 'doh-birth-record-overview',
    heading: 'Read who can order',
    instruction:
      'Open the Department of Health page. Check who can order and what you need to give.',
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
    heading: 'Open the order page',
    instruction:
      'Washington uses VitalChek for online orders. Open this page to start. Do not type personal information until you are ready to order.',
    screenshotAlt: 'Public VitalChek landing page showing online order entry for vital records.',
    screenshotUrl: '/vitalchek-public-homepage.png',
    sourceUrl: 'https://www.vitalchek.com/',
    verificationStatus: 'confirmed',
    annotations: [
      { kind: 'highlight', label: 'Highlight the public “Order Certificate” entry area and the birth certificate options.' },
      { kind: 'arrow', label: 'Point to the publicly visible order flow, not the restricted form fields that require personal information.' },
    ],
  },
],
}

const SSA_START_URL = 'https://secure.ssa.gov/ossnap/public/'

const ssaStep = (id: string, heading: string, instruction: string, image: string, alt: string, note: string) => ({
  id,
  heading,
  instruction,
  screenshotAlt: alt,
  screenshotUrl: image,
  sourceUrl: SSA_START_URL,
  screenshotEvidence: {
    capturedAt: ssaCaptureDate,
    sourceUrl: SSA_START_URL,
    viewport: { width: 1280, height: 900 },
    reviewedByHuman: true,
  },
  verificationStatus: 'confirmed' as const,
  annotations: [{ kind: 'highlight' as const, label: note }],
})

export const SSA_CARD_WALKTHROUGH: VisualWalkthrough = {
  id: 'ssa-replacement-card-start',
  title: 'Where to start: Social Security card',
  userGoal: 'See where to start asking for a Social Security card.',
  serviceName: 'Social Security Administration',
  officialWebsiteUrl: SSA_START_URL,
  status: 'Draft',
  lastCapturedAt: ssaCaptureDate,
  checkedOn: ssaCaptureDate,
  mayBeOutdated: true,
  outdatedReason: 'The official website can change. Check it before you rely on these pictures.',
  aiSupportNotes: [
    'These pictures come from the public start page. The orange box shows where to look.',
    'We did not type anything or send anything. We stopped before the application and any identity check.',
  ],
  summary:
    'This page tells you which papers to have before you apply. Read it first. Apply Now starts the real application and asks for personal information.',
  beforeYouStart: [
    'Papers must be originals or certified copies.',
    'Papers must not be expired.',
    'Papers must show your name and date of birth.',
    'Click "Check which documents you need before applying" on the official page to see the full list.',
  ],
  steps: [
    ssaStep(
      'ssa-card-start-page',
      'Open the start page',
      'Open the official page. Read the three sections before you click Apply Now.',
      '/ssa-card-start.webp',
      'Social Security card start page with the Document requirements section outlined.',
      'The three sections explain who needs a card, how to ask, and which papers to bring.',
    ),
    ssaStep(
      'ssa-card-document-requirements',
      'Check your papers first',
      'Click Document requirements. Papers must be originals or certified copies. They must not be expired, and must show your name and birth date.',
      '/ssa-card-documents.webp',
      'Document requirements section opened, saying papers must be original or certified copies.',
      'This tells you what kind of papers they accept.',
    ),
  ],
}
