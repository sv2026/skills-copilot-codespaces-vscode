/**
 * Public-page capture plans for reusable visual walkthroughs.
 * Capture runners should honor the safety boundaries before visiting each target.
 */
export const WALKTHROUGH_CAPTURE_CONFIGS = [
  {
    resourceId: 'wa-doh-birth-record-ordering',
    userGoal:
      'Understand the public requirements and entry point before ordering a Washington birth certificate.',
    viewport: { width: 1440, height: 2200 },
    selectionPolicy: {
      captureCandidatesThroughoutExploration: true,
      chooseFinalScreensAfterFullFlowReview: true,
      minFinalScreens: 3,
      maxFinalScreens: 5,
    },
    safety: {
      publicPagesOnly: true,
      allowSyntheticNavigationData: true,
      enterRealPersonalInformation: false,
      submitForms: false,
      createAccounts: false,
      uploadDocuments: false,
      completeIdentityVerification: false,
      excludedFromScreenshots: [
        'Certificate holder name',
        'State of birth',
        'City of birth',
        'Birthdate',
        'Routine personal-information fields',
      ],
      stopBefore: 'Identity verification, document upload, payment, or final submission.',
    },
    checkpoints: [
      {
        id: 'doh-birth-record-overview',
        filename: 'wa-doh-birth-record-landing.png',
        url: 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record',
        waitForText: ['Who Qualifies?', 'What Do I Need to Provide?'],
        purpose: 'Show the official public requirements and eligibility information.',
      },
      {
        id: 'vitalchek-public-entry',
        filename: 'vitalchek-public-homepage.png',
        url: 'https://www.vitalchek.com/',
        waitForText: ['Vital Records, the Easy Way', 'ORDER CERTIFICATE', 'How VitalChek Works'],
        purpose: 'Show the public ordering-service entry point without entering private information.',
      },
      {
        id: 'vitalchek-birth-certificates-guide',
        filename: 'vitalchek-birth-certificates-guide.png',
        url: 'https://www.vitalchek.com/v/birth-certificates',
        waitForText: ['START YOUR ORDER NOW', 'What Do You Need?', 'How VitalChek Works'],
        purpose: 'Show the public birth-certificate preparation guidance before the order form.',
      },
      {
        id: 'vitalchek-order-subject-choice',
        filename: 'vitalchek-order-subject-choice.png',
        url: 'https://www.vitalchek.com/order_main.aspx?eventtype=BIRTH',
        waitForText: [
          'Whose Birth certificate are you ordering?',
          'My Birth Certificate',
          "Another Person's Birth Certificate",
        ],
        purpose: 'Show the non-sensitive choice between ordering your own record or another person’s record.',
        stopBefore: 'Selecting the other-person path reveals name fields; do not enter or capture personal information.',
      },
    ],
  },
]
