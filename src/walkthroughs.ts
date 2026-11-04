import type { VisualWalkthrough } from './resourceData'

const walkthroughCaptureDate = '2026-11-01'
const birthRecordCheckDate = '2026-10-26'

export const WA_CONNECTION_WALKTHROUGH: VisualWalkthrough = {
id: 'wa-connection-basic-food-application',
title: 'Washington Connection Basic Food application walkthrough (draft)',
userGoal: 'Walk through the public application guidance and Basic Food selection before entering personal information.',
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
  'The walkthrough stops before names, birthdates, addresses, Social Security numbers, documents, payment, and submission.',
],
summary:
  'This draft covers the public application introduction, the official application guidance page, and the Basic Food selection step. Continue on the official site for personal-information fields and final submission.',
steps: [
  {
    id: 'wa-connection-application-introduction',
    heading: 'Read the application introduction',
    instruction:
      'Review the information categories the application may request, then use the visible Next control to continue through the public guidance.',
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
    id: 'wa-connection-about-application',
    heading: 'Review application timing and requirements',
    instruction:
      'Read the visible food and cash processing information, identity guidance, and Social Security number instructions before continuing.',
    screenshotAlt:
      'Annotated Washington Connection About this Application page showing timing and identity guidance.',
    screenshotUrl: '/washington-connection-about-application-annotated.png',
    sourceUrl: 'https://www.washingtonconnection.org/eapplication/home.go',
    screenshotEvidence: {
      capturedAt: walkthroughCaptureDate,
      sourceUrl: 'https://www.washingtonconnection.org/eapplication/home.go',
      viewport: { width: 1440, height: 2200 },
      reviewedByHuman: false,
    },
    verificationStatus: 'needs review',
    annotations: [
      { kind: 'highlight', label: 'The page explains how to apply and gives visible food and cash processing timelines.' },
      { kind: 'arrow', label: 'The identity and Social Security number guidance appears before the data-entry screens.' },
    ],
  },
  {
    id: 'wa-connection-basic-food-selection',
    heading: 'Select the benefit need',
    instruction:
      'On Your Needs, select Basic Food under Food Assistance if that is the benefit you need, then use Next to continue. Do not copy synthetic test values from this draft.',
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
  {
    id: 'wa-connection-resources',
    heading: 'Understand what counts as a resource',
    instruction:
      'Review the visible examples of resources, such as cash, accounts, investments, property, and life insurance. The site asks about annuities separately.',
    screenshotAlt:
      'Annotated Washington Connection Resources page showing examples of assets and the separate annuities note.',
    screenshotUrl: '/washington-connection-resources-annotated.png',
    sourceUrl: 'https://www.washingtonconnection.org/',
    screenshotEvidence: {
      capturedAt: walkthroughCaptureDate,
      sourceUrl: 'https://www.washingtonconnection.org/eapplication/resource.go',
      viewport: { width: 1440, height: 2200 },
      reviewedByHuman: true,
    },
    verificationStatus: 'confirmed',
    annotations: [
      { kind: 'highlight', label: 'The page lists the asset categories Washington Connection treats as resources.' },
      { kind: 'arrow', label: 'The visible note explains that annuities are handled on a separate page.' },
    ],
  },
  {
    id: 'wa-connection-your-rights',
    heading: 'Read rights and responsibilities before signing',
    instruction:
      'Review the official rights, responsibilities, verification rules, processing timelines, EBT guidance, and the acknowledgment that appears before the final application stage.',
    screenshotAlt:
      'Annotated Washington Connection Rights and Responsibilities page for cash and food programs.',
    screenshotUrl: '/washington-connection-your-rights-annotated.png',
    sourceUrl: 'https://www.washingtonconnection.org/',
    screenshotEvidence: {
      capturedAt: walkthroughCaptureDate,
      sourceUrl: 'https://www.washingtonconnection.org/eapplication/yourrights.go',
      viewport: { width: 1440, height: 2200 },
      reviewedByHuman: true,
    },
    verificationStatus: 'confirmed',
    annotations: [
      { kind: 'highlight', label: 'Review the responsibilities, verification rules, timelines, and EBT guidance.' },
      { kind: 'arrow', label: 'The acknowledgment and Next control mark the transition toward signing and submission.' },
    ],
  },
],
}

export const BIRTH_RECORD_WALKTHROUGH: VisualWalkthrough = {
id: 'wa-doh-birth-record-ordering',
title: 'Washington birth certificate ordering process',
userGoal: 'Understand the public requirements and entry point before ordering a Washington birth certificate.',
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
}
