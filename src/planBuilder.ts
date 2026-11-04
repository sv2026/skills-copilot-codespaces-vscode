import type { ActionCard, ResourceLink } from './resourceData'
import { COUNTY_CHECKED_DATE, COUNTY_ENTRY_POINTS } from './resourceData'
import { OPT } from './options'
import type { Profile } from './recommendationLogic'
import { BIRTH_RECORD_WALKTHROUGH, WA_CONNECTION_WALKTHROUGH } from './walkthroughs'

const previouslyVerified = '2026-10-25'
const researchDate = COUNTY_CHECKED_DATE
const NEEDS_REVIEW = 'Needs review' as const
const VERIFIED = 'Verified' as const

type CardInput = Partial<ActionCard> & Pick<ActionCard, 'id' | 'title' | 'category' | 'steps'>

const card = (input: CardInput): ActionCard => ({
  whyThisMatters: '',
  usefulDocuments: { required: [], alternativesToConfirm: [], helpful: [], unverified: [] },
  missingDocsPlan: '',
  endGoal: '',
  resources: [],
  ...input,
})

const WASHINGTON_CONNECTION: ResourceLink = {
  label: 'Washington Connection',
  url: 'https://www.washingtonconnection.org/',
  verificationStatus: VERIFIED,
  lastVerified: previouslyVerified,
  requiresWalkthrough: true,
  walkthrough: WA_CONNECTION_WALKTHROUGH,
}

const DSHS_PHONE: ResourceLink = {
  label: 'DSHS Customer Service Contact Center',
  phone: '877-501-2233',
  verificationStatus: NEEDS_REVIEW,
  lastVerified: researchDate,
  note: 'Listed on dshs.wa.gov. Confirm before relying on it.',
}

const DSHS_OFFICES: ResourceLink = {
  label: 'How to apply for DSHS services',
  url: 'https://www.dshs.wa.gov/family-food-and-housing-services/community-services-offices/how-apply-services',
  verificationStatus: NEEDS_REVIEW,
  lastVerified: researchDate,
}

const trip = (p: Profile) => {
  if (p.transport === 'help') {
    return ['Ask if they can help with transportation, such as a bus pass.']
  }
  if (p.transport === 'no') {
    return ['Tell them you cannot travel and ask for phone or online options.']
  }
  return []
}

const applySteps = (p: Profile, benefit: string): string[] => {
  const steps: string[] = []
  if (p.immigration && p.immigrationHelp === 'benefits') {
    steps.push('You said you are worried about applying. Talk to an immigration legal provider first (see your immigration step).')
  }
  if (p.contact === 'online') {
    steps.push(`Apply for ${benefit} online at Washington Connection. Do not use the phone.`)
  } else if (p.contact === 'inPerson') {
    steps.push(`Go to a DSHS Community Services Office and ask to apply for ${benefit}.`)
  } else if (p.contact === 'phone') {
    steps.push(`Call DSHS at 877-501-2233 and say you want to apply for ${benefit}.`)
    steps.push('Or apply online at Washington Connection.')
  } else {
    steps.push(`Apply for ${benefit} online at Washington Connection, or call DSHS at 877-501-2233.`)
  }
  return [...steps, ...trip(p)]
}

const applyResources = (p: Profile): ResourceLink[] => {
  const links: ResourceLink[] = [WASHINGTON_CONNECTION]
  if (p.contact !== 'online') {
    links.push(DSHS_PHONE)
  }
  if (p.contact === 'inPerson' || p.contact === 'unsure' || !p.contact) {
    links.push(DSHS_OFFICES)
  }
  return links
}

const countyEntry = (county: string | undefined): ResourceLink[] => {
  const entry = county ? COUNTY_ENTRY_POINTS[county] : undefined
  if (!entry) {
    return []
  }
  return [
    {
      label: entry.label,
      url: entry.url,
      phone: entry.phone,
      verificationStatus: NEEDS_REVIEW,
      lastVerified: researchDate,
      note: entry.note,
    },
  ]
}

const shelterCard = (p: Profile): ActionCard => {
  const entry = p.county ? COUNTY_ENTRY_POINTS[p.county] : undefined
  const urgent = p.urgency === 'tonight' || p.urgency === 'days'
  const steps: string[] = []

  if (entry?.phone && p.contact === 'online') {
    steps.push('Phone is not safe for you. Ask a trusted provider to call for you, or go in person.')
  } else if (entry?.phone) {
    steps.push(`Call ${entry.phone} (${entry.label}).`)
  } else if (entry) {
    steps.push(`Open the ${entry.label} page and use the contact details listed there.`)
  } else {
    steps.push('Search your county name plus "coordinated entry" to find its housing access point.')
  }

  switch (p.urgency) {
    case 'tonight':
      steps.push('Say you need a safe place to stay tonight.')
      break
    case 'days':
      steps.push('Say you need a safe place within a few days. Ask what interim options exist.')
      break
    case 'weeks':
      steps.push('Ask to be added to the housing list now. Waits can be long.')
      break
    default:
      steps.push('Ask to be added to the housing list and about rent help.')
  }

  if (p.children) {
    steps.push('Say children are included so they match you to family-appropriate options.')
  }
  if (p.contact === 'inPerson') {
    steps.push('Ask where to go in person.')
  }
  steps.push(...trip(p))

  return card({
    id: 'shelter-entry',
    title: p.county ? `Contact the ${p.county} housing access point` : 'Contact your county housing access point',
    category: urgent ? 'immediate' : 'next',
    steps,
    usefulDocuments: {
      alternativesToConfirm: ['Ask what ID or paperwork is needed and what can wait.'],
      unverified: ['Wait times and eligibility were not verified.'],
      required: [],
      helpful: [],
    },
    resources: countyEntry(p.county),
  })
}

const dshsFollowCard = (p: Profile): ActionCard | undefined => {
  if (p.waiting) {
    return card({
      id: 'dshs-pending',
      title: 'Check on your pending DSHS application',
      category: 'immediate',
      steps: [
        'Open any DSHS letter and note the deadline.',
        p.contact === 'online'
          ? 'Check your case on Washington Connection.'
          : 'Ask DSHS for the status of your application and what they still need.',
        'Report a changed address or phone if it changed.',
      ],
      resources: applyResources(p),
    })
  }
  if (p.getsFood || p.getsCash) {
    return card({
      id: 'dshs-update',
      title: 'Update your DSHS case',
      category: 'immediate',
      steps: [
        'Report your current address and contact details to DSHS.',
        'Ask how DSHS sends mail and notices to you.',
        ...trip(p),
      ],
      resources: applyResources(p),
    })
  }
  return undefined
}

const foodCard = (p: Profile): ActionCard =>
  card({
    id: 'dshs-food-assistance',
    title: 'Apply for food assistance',
    category: 'immediate',
    steps: [
      ...applySteps(p, 'Basic Food'),
      'Ask if you qualify for expedited (faster) service.',
    ],
    usefulDocuments: {
      required: [],
      alternativesToConfirm: ['Ask what proof can wait until after you apply.'],
      helpful: [],
      unverified: [],
    },
    resources: [
      ...applyResources(p),
      {
        label: 'DSHS expedited Basic Food rules',
        url: 'https://www.dshs.wa.gov/expedited-service-basic-food',
        verificationStatus: NEEDS_REVIEW,
        lastVerified: researchDate,
      },
    ],
  })

const cashCard = (p: Profile): ActionCard =>
  card({
    id: 'dshs-cash-assistance',
    title: 'Apply for cash assistance',
    category: 'immediate',
    steps: applySteps(p, 'cash assistance'),
    usefulDocuments: {
      required: [],
      alternativesToConfirm: ['Ask what proof can wait until after you apply.'],
      helpful: [],
      unverified: [],
    },
    resources: applyResources(p),
  })

const idCard = (p: Profile): ActionCard =>
  card({
    id: 'photo-id',
    title: 'Get a replacement photo ID',
    category: p.shelter ? 'next' : 'immediate',
    steps: [
      'Go to any Washington driver licensing office. No appointment is listed as required.',
      'Ask if you qualify for the free or reduced-fee ID for people without stable housing.',
      ...(p.contact === 'online' ? ['This is in person only. Plan a safe trip.'] : []),
      ...trip(p),
    ],
    resources: [
      {
        label: 'WA Department of Licensing: ID help for the unhoused',
        url: 'https://dol.wa.gov/id-cards/id-help-unhoused',
        verificationStatus: NEEDS_REVIEW,
        lastVerified: researchDate,
      },
    ],
  })

const birthCard = (p: Profile, kids: boolean): ActionCard =>
  card({
    id: kids ? 'birth-records-children' : 'birth-records-self',
    title: kids ? "Get your children's birth certificates" : 'Get your birth certificate',
    category: 'next',
    steps: [
      kids ? "Find each child's birth state." : 'Find your birth state.',
      'If born in Washington, use the Department of Health page below.',
      'If born elsewhere, use that state\'s vital records office.',
      p.shelter || p.urgency === 'tonight' || p.urgency === 'days'
        ? 'Ask a shelter or service provider to request a no-fee copy for you. DOH lists this option.'
        : 'Check DOH for no-fee options before you pay.',
      ...(!p.hasDoc('photoId') ? ['You will need ID. Get your photo ID first if you can.'] : []),
    ],
    usefulDocuments: {
      required: ['Proof of identity and your relationship to the person on the record.'],
      alternativesToConfirm: ['Ask what is accepted if you have no photo ID.'],
      helpful: [],
      unverified: [],
    },
    resources: [
      {
        label: 'WA Department of Health birth records',
        url: 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record',
        verificationStatus: VERIFIED,
        lastVerified: '2026-10-26',
        requiresWalkthrough: true,
        walkthrough: BIRTH_RECORD_WALKTHROUGH,
      },
      {
        label: 'DOH no-fee birth certificates',
        url: 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/vital-records-no-fee-specific-circumstances',
        verificationStatus: NEEDS_REVIEW,
        lastVerified: researchDate,
      },
    ],
  })

const ssnCard = (p: Profile, kids: boolean): ActionCard =>
  card({
    id: kids ? 'ssa-cards-children' : 'ssa-cards-self',
    title: kids ? "Replace your children's Social Security cards" : 'Replace your Social Security card',
    category: 'next',
    steps: [
      'Ask DSHS first if you need the card for your application.',
      'Open the SSA replacement page to see what you can do online.',
      p.contact === 'online' ? 'Use online options only.' : 'Call SSA before going to an office.',
      ...trip(p),
    ],
    usefulDocuments: {
      required: ['SSA identity requirements apply.'],
      alternativesToConfirm: ['Ask which proof SSA accepts if you have no photo ID.'],
      helpful: [],
      unverified: [],
    },
    resources: [
      {
        label: 'SSA replace Social Security card',
        url: 'https://www.ssa.gov/number-card/replace-card',
        verificationStatus: VERIFIED,
        lastVerified: previouslyVerified,
      },
      ...(p.contact === 'online'
        ? []
        : [
            {
              label: 'Social Security Administration phone',
              phone: '800-772-1213',
              verificationStatus: VERIFIED,
              lastVerified: previouslyVerified,
            } as ResourceLink,
          ]),
    ],
  })

const OSPI_LIAISON: ResourceLink[] = [
  {
    label: 'OSPI students experiencing homelessness',
    url: 'https://ospi.k12.wa.us/student-success/access-opportunity-education/students-experiencing-homelessness',
    verificationStatus: VERIFIED,
    lastVerified: previouslyVerified,
  },
  {
    label: 'OSPI homeless education liaison contact list',
    url: 'https://ospi.k12.wa.us/student-success/access-opportunity-education/students-experiencing-homelessness/homeless-education-liaison-contact-list',
    verificationStatus: VERIFIED,
    lastVerified: previouslyVerified,
  },
]

const schoolCard = (p: Profile): ActionCard => {
  const unstable = p.urgency === 'tonight' || p.urgency === 'days' || p.urgency === 'weeks' || p.shelter
  const wants = (key: string) => p.schoolNeeds.includes(key)
  const steps: string[] = []

  steps.push(
    unstable
      ? 'Find your district on the OSPI liaison list and contact the homeless education liaison.'
      : "Contact your district's enrollment or attendance office.",
  )
  if (wants(OPT.school.stay)) {
    steps.push('Ask to keep your children in their current school.')
  }
  if (wants(OPT.school.rides)) {
    steps.push('Ask about rides to school.')
  }
  if (wants(OPT.school.meals)) {
    steps.push('Ask how to get free school meals.')
  }
  if (wants(OPT.school.enroll)) {
    steps.push(
      unstable
        ? 'Ask for immediate enrollment, even if records are missing.'
        : 'Ask what is needed to enroll and what can wait.',
    )
  }
  if (wants(OPT.school.records)) {
    steps.push('Ask the current school to send records to the new school.')
  }
  if (!p.hasDoc('kidsSchool') || !p.hasDoc('kidsBirth')) {
    steps.push('Tell the school which records are missing and ask what can be accepted for now.')
  }

  return card({
    id: unstable ? 'school-liaison' : 'school-support',
    title: unstable ? 'Contact your school district liaison' : 'Contact your school district',
    category: unstable ? 'immediate' : 'next',
    steps,
    resources: unstable
      ? OSPI_LIAISON
      : [
          {
            label: 'OSPI access and opportunity education',
            url: 'https://www.k12.wa.us/student-success/access-opportunity-education',
            verificationStatus: VERIFIED,
            lastVerified: previouslyVerified,
          },
        ],
  })
}

const immigrationCard = (p: Profile): ActionCard => {
  const steps: string[] = []
  switch (p.immigrationHelp) {
    case 'options':
      steps.push('Ask for a consultation. Say you want to understand your options as a survivor.')
      break
    case 'forms':
      steps.push('Bring forms you already received and ask which ones you need.')
      break
    case 'papers':
      steps.push('Ask how to replace or find your papers before contacting any government office.')
      break
    case 'benefits':
      steps.push('Ask how applying for food or cash help could affect you before you apply.')
      break
    default:
      steps.push('Ask what kind of help they offer and what they need from you.')
  }
  if (p.contact === 'online') {
    steps.push('Use email or the online contact form if the provider offers one.')
  }
  steps.push('Write down who you spoke with and the next deadline.')

  return card({
    id: 'immigration-support',
    title: 'Talk to an immigration legal provider',
    category: p.immigrationHelp === 'benefits' ? 'immediate' : 'next',
    steps,
    usefulDocuments: {
      required: [],
      alternativesToConfirm: ['Ask which papers they need and which can wait.'],
      helpful: [],
      unverified: ['Do not rely on online forms alone.'],
    },
    resources: [
      {
        label: 'Washington Immigration Resource Center',
        url: 'https://www.washingtonimmigration.org/',
        verificationStatus: VERIFIED,
        lastVerified: previouslyVerified,
      },
      {
        label: 'Northwest Immigrant Rights Project',
        url: 'https://www.nwirp.org/',
        verificationStatus: VERIFIED,
        lastVerified: previouslyVerified,
      },
    ],
  })
}

const followUpCard = (p: Profile): ActionCard =>
  card({
    id: 'housing-follow-up',
    title: 'Keep track of housing and address privacy',
    category: 'later',
    steps: [
      'Write down each program, the date you contacted it, and who to call back.',
      'Ask a shelter or advocate if you qualify for the Address Confidentiality Program.',
      ...(p.children ? ['Tell the school if your address or phone changes.'] : []),
    ],
    resources: [
      {
        label: 'WA Address Confidentiality Program',
        url: 'https://www.sos.wa.gov/statewide-programs/address-confidentiality-program-acp',
        verificationStatus: NEEDS_REVIEW,
        lastVerified: researchDate,
      },
    ],
  })

export const buildCards = (p: Profile): ActionCard[] => {
  const cards: ActionCard[] = []
  const add = (next: ActionCard | undefined) => {
    if (next && !cards.some((existing) => existing.id === next.id)) {
      cards.push(next)
    }
  }

  if (p.shelter || p.unsure) {
    add(shelterCard(p))
  }

  const wantsBenefits = p.food || p.cash || p.unsure
  if (wantsBenefits) {
    add(dshsFollowCard(p))
    if (!p.waiting) {
      if ((p.food || p.unsure) && !p.getsFood) {
        add(foodCard(p))
      }
      if ((p.cash || p.unsure) && !p.getsCash) {
        add(cashCard(p))
      }
    }
  }

  if (p.school) {
    add(schoolCard(p))
  }

  if (p.docs) {
    if (!p.hasDoc('photoId')) {
      add(idCard(p))
    }
    if (!p.hasDoc('birth')) {
      add(birthCard(p, false))
    }
    if (!p.hasDoc('ssn')) {
      add(ssnCard(p, false))
    }
  }

  if (p.docs || p.kidsDocs) {
    if (p.children && !p.hasDoc('kidsBirth')) {
      add(birthCard(p, true))
    }
    if (p.children && !p.hasDoc('kidsSsn')) {
      add(ssnCard(p, true))
    }
  }

  if (p.immigration) {
    add(immigrationCard(p))
  }

  if (p.shelter) {
    add(followUpCard(p))
  }

  const order = { immediate: 0, next: 1, later: 2 }
  return cards.sort((a, b) => order[a.category] - order[b.category])
}
