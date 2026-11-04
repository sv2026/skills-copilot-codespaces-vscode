import type { ActionCard, ResourceLink } from './resourceData'
import { COUNTY_CHECKED_DATE, COUNTY_ENTRY_POINTS } from './resourceData'
import { OPT } from './options'
import type { Profile } from './recommendationLogic'
import { BIRTH_RECORD_WALKTHROUGH, WA_CONNECTION_WALKTHROUGH } from './walkthroughs'

type LinkResource = ResourceLink & { url: string }
type CardInput = Omit<Partial<ActionCard>, 'resources'> &
  Pick<ActionCard, 'id' | 'title' | 'category' | 'steps'> & { resources: [LinkResource, ...ResourceLink[]] }

const card = (input: CardInput): ActionCard => ({
  whyThisMatters: '',
  usefulDocuments: { required: [], alternativesToConfirm: [], helpful: [], unverified: [] },
  missingDocsPlan: '',
  endGoal: '',
  ...input,
})

const link = (label: string, url: string, note?: string): LinkResource => ({
  label, url, note, verificationStatus: 'Needs review', lastVerified: COUNTY_CHECKED_DATE,
})

const washingtonConnection: LinkResource = {
  label: 'Washington Connection',
  url: 'https://www.washingtonconnection.org/',
  verificationStatus: 'Verified',
  lastVerified: '2026-10-25',
  requiresWalkthrough: true,
  walkthrough: WA_CONNECTION_WALKTHROUGH,
}

const dshsPhone: ResourceLink = {
  label: 'DSHS customer service',
  phone: '877-501-2233',
  verificationStatus: 'Needs review',
  lastVerified: COUNTY_CHECKED_DATE,
}

const foodDirectory = link(
  'Washington food access directory',
  'https://agr.wa.gov/services/food-access/access-food-near-you',
  'Check hours, access and delivery with the provider.',
)
const schoolDirectory = link(
  'Washington school district liaison list',
  'https://ospi.k12.wa.us/student-success/access-opportunity-education/students-experiencing-homelessness/homeless-education-liaison-contact-list',
)
const familyDirectory = link(
  'Washington basic needs resource directory',
  'https://dcyf.wa.gov/services/housing-basic-needs/basic-needs-community-resource-directory',
  'Includes statewide resources; local services and availability need confirmation.',
)

const travelNote = (p: Profile): string[] => {
  if (p.transport === 'help') return ['Ask whether transportation help is available before making a trip.']
  if (p.transport === 'no') return ['You said you cannot travel. Check whether the next steps can be completed without a trip.']
  return []
}

const shelterCard = (p: Profile): ActionCard => {
  const entry = p.county ? COUNTY_ENTRY_POINTS[p.county] : undefined
  const entryResource: LinkResource = entry?.url
    ? { ...link(entry.label, entry.url, entry.note), phone: entry.phone }
    : familyDirectory
  const steps: string[] = []

  if (!entry) {
    steps.push('We do not have a verified housing contact for this county yet. The directory below lists statewide resources, not confirmed local shelter.')
  } else {
    steps.push(entry.url
      ? 'Check the housing page for available ways to get help. Online intake has not been confirmed.'
      : 'Check the statewide directory below. An online county intake has not been confirmed.')
  }
  if (p.urgency === 'tonight') steps.push('Ask about a safe place for tonight.')
  else if (p.urgency === 'days') steps.push('Ask about a place within a few days and what is available in the meantime.')
  else if (p.urgency === 'weeks') steps.push('Ask about options in the next few weeks and how to apply.')
  else if (p.urgency === 'later') steps.push('Ask about future housing options and their application steps.')
  if (p.children) steps.push('Mention that children need to be included.')
  steps.push(...travelNote(p))
  return card({
    id: 'shelter-entry',
    title: p.county && !['Other / not listed', "I'm not sure"].includes(p.county)
      ? `Find housing in ${p.county}` : 'Find housing near you',
    category: p.urgency === 'tonight' || p.urgency === 'days' ? 'immediate' : 'next',
    steps,
    usefulDocuments: {
      required: [], helpful: [], alternativesToConfirm: ['Ask what information is needed and what can wait.'],
      unverified: ['Availability, intake methods and eligibility need confirmation.'],
    },
    resources: [entryResource],
  })
}

const foodNowCard = (p: Profile): ActionCard => card({
  id: 'food-now',
  title: 'Find food near you',
  category: 'immediate',
  steps: [
    'Use the food directory to find local food. Check hours and access with the provider.',
    ...(p.transport === 'no' ? ['Delivery or another no-travel option has not been confirmed.'] : travelNote(p)),
  ],
  resources: [foodDirectory],
})

const benefitResources = (): [LinkResource, ResourceLink] => [washingtonConnection, dshsPhone]

const benefitSteps = (p: Profile, benefit: string) => [
  ...(p.immigration && p.immigrationHelp === 'benefits'
    ? ['You can ask an immigration legal provider how applying may affect your situation.']
    : []),
  `Use Washington Connection to apply for ${benefit}, or ask DSHS about other ways to apply.`,
  ...travelNote(p),
]

const benefitCard = (p: Profile, kind: 'food' | 'cash'): ActionCard => card({
  id: kind === 'food' ? 'dshs-food-assistance' : 'dshs-cash-assistance',
  title: kind === 'food' ? 'Apply for food assistance' : 'Apply for cash assistance',
  category: 'immediate',
  steps: [
    ...benefitSteps(p, kind === 'food' ? 'Basic Food' : 'cash assistance'),
    ...(kind === 'food' ? ['Ask DSHS about expedited service. Benefits may not be available today.'] : []),
    'Ask what proof is needed and what can wait.',
  ],
  resources: benefitResources(),
})

const benefitFollowCard = (p: Profile): ActionCard | undefined => {
  if (p.waiting) return card({
    id: 'dshs-pending',
    title: 'Check your pending application',
    category: 'immediate',
    steps: [
      'Check the application status and any requests in Washington Connection, or ask DSHS.',
      ...(!p.pendingBenefits || p.pendingBenefits === 'unsure'
        ? ['Check which benefits the application covers before applying again.'] : []),
      'Ask what to do if you cannot safely provide something requested.',
      ...travelNote(p),
    ],
    resources: benefitResources(),
  })
  if (p.getsFood || p.getsCash) return card({
    id: 'dshs-update',
    title: 'Review your existing benefits',
    category: 'immediate',
    steps: [
      'Review your case in Washington Connection, or ask DSHS about your current benefits.',
      'Ask how to receive notices safely and whether any updates are needed.',
      ...travelNote(p),
    ],
    resources: benefitResources(),
  })
  return undefined
}

const idCard = (p: Profile): ActionCard => card({
  id: 'photo-id', title: 'Replace your photo ID', category: p.shelter ? 'next' : 'immediate',
  steps: [
    'Check what proof and fees apply before replacing your ID.',
    ...(p.transport === 'no'
      ? ['You cannot travel. A no-travel replacement option has not been confirmed.']
      : ['Ask whether an office visit is required.']),
    ...travelNote(p),
  ],
  resources: [link('Washington DOL ID information', 'https://dol.wa.gov/id-cards/id-help-unhoused', 'Check eligibility for reduced-fee ID.')],
})

const birthCard = (p: Profile, kids: boolean): ActionCard => {
  const birthResource: LinkResource = {
    label: 'Washington birth records',
    url: 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record',
    verificationStatus: 'Verified', lastVerified: '2026-10-26',
    requiresWalkthrough: true, walkthrough: BIRTH_RECORD_WALKTHROUGH,
  }
  return card({
    id: kids ? 'birth-records-children' : 'birth-records-self',
    title: kids ? "Replace children's birth certificates" : 'Replace your birth certificate',
    category: 'next',
    steps: [
      kids ? 'Check where each child was born.' : 'Check where you were born.',
      'Use that state’s vital records office. Ask about accepted ID, fees and alternatives.',
      ...travelNote(p),
    ],
    resources: [
      birthResource,
      link('Washington no-fee birth certificates', 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/vital-records-no-fee-specific-circumstances'),
    ],
  })
}

const ssnCard = (p: Profile, kids: boolean): ActionCard => card({
  id: kids ? 'ssa-cards-children' : 'ssa-cards-self',
  title: kids ? "Replace children's Social Security cards" : 'Replace your Social Security card',
  category: 'next',
  steps: [
    'Ask whether a replacement card is needed for your purpose.',
    'Check SSA’s replacement process, accepted identity documents and online options.',
    ...(kids ? ['Ask what proof of identity and relationship is needed for a child.'] : []),
    ...travelNote(p),
  ],
  resources: [
    link('Start a Social Security card application', 'https://secure.ssa.gov/ossnap/public/', 'SSA may ask for personal information. Some applications require an office visit.'),
    link('SSA replacement card information', 'https://www.ssa.gov/number-card/replace-card'),
  {
    label: 'Social Security Administration', phone: '800-772-1213',
    verificationStatus: 'Verified', lastVerified: '2026-10-25',
  }],
})

const schoolCard = (p: Profile): ActionCard => {
  const wants = (option: string) => p.schoolNeeds.includes(option)
  const steps = [
    'Ask the school or district about the support you selected.',
    ...(wants(OPT.school.stay) ? ['Ask about staying in the same school.'] : []),
    ...(wants(OPT.school.rides) ? ['Ask about transportation to school.'] : []),
    ...(wants(OPT.school.meals) ? ['Ask about school meals.'] : []),
    ...(wants(OPT.school.enroll) ? ['Ask how to enroll and what can wait if records are missing.'] : []),
    ...(wants(OPT.school.records) ? ['Ask the school to help transfer records.'] : []),
    ...((p.docAnswered('kidsSchool') && !p.hasDoc('kidsSchool')) || (p.docAnswered('kidsBirth') && !p.hasDoc('kidsBirth'))
      ? ['Tell the school which records are unavailable and ask what can wait.'] : []),
    'If housing is unstable, ask the district liaison whether additional school protections apply.',
    ...(wants(OPT.school.enroll)
      ? ['If eligible for homelessness-related school protections, enrollment should not wait for missing records.']
      : []),
  ]
  return card({
    id: p.shelter ? 'school-liaison' : 'school-support',
    title: 'Get school support',
    category: p.shelter ? 'immediate' : 'next',
    steps,
    resources: [schoolDirectory],
  })
}

const immigrationCard = (p: Profile): ActionCard => {
  const topic: Record<NonNullable<Profile['immigrationHelp']>, string> = {
    options: 'Ask to understand your immigration options.',
    forms: 'Ask for help understanding or completing your forms.',
    papers: 'Ask how to find or replace your immigration papers.',
    benefits: 'Ask how applying for benefits may affect your situation.',
    unsure: 'Ask what kind of immigration help is available.',
  }
  return card({
    id: 'immigration-support', title: 'Find immigration legal help',
    category: p.immigrationHelp === 'benefits' ? 'immediate' : 'next',
    steps: [
      topic[p.immigrationHelp ?? 'unsure'],
      'Check which contact options and appointments the provider offers.',
      'Ask what information they need and how it will be used before sharing it.',
      ...travelNote(p),
    ],
    resources: [
      link('Northwest Immigrant Rights Project', 'https://www.nwirp.org/', 'Confirm contact options and availability.'),
      link('Washington immigration legal help directory', 'https://www.immigrationlawhelp.org/search?state=WA', 'Confirm contact options and availability.'),
    ],
  })
}

const guidanceCard = (kids: boolean): ActionCard => card({
  id: kids ? 'children-unsure' : 'choose-priorities',
  title: kids ? 'Choose what your children need' : 'Choose where to start',
  category: 'next',
  steps: kids
    ? ['Go back to choose school or children’s documents if either fits.', 'Other children’s needs do not yet have a tailored plan here.']
    : ['Go back and choose any topics you would like help with.', 'You can choose one topic at a time.'],
  resources: [familyDirectory],
})

export const buildCards = (p: Profile): ActionCard[] => {
  const cards: ActionCard[] = []
  if (p.shelter) cards.push(shelterCard(p))
  if (p.food) cards.push(foodNowCard(p))
  if (p.immigration && p.immigrationHelp === 'benefits') cards.push(immigrationCard(p))

  if (p.food || p.cash) {
    const follow = benefitFollowCard(p)
    if (follow) cards.push(follow)
    const pendingUnknown = p.waiting && (!p.pendingBenefits || p.pendingBenefits === 'unsure')
    const pendingFood = p.waiting && (p.pendingBenefits === 'food' || p.pendingBenefits === 'both')
    const pendingCash = p.waiting && (p.pendingBenefits === 'cash' || p.pendingBenefits === 'both')
    if (p.food && !p.getsFood && !pendingUnknown && !pendingFood) cards.push(benefitCard(p, 'food'))
    if (p.cash && !p.getsCash && !pendingUnknown && !pendingCash) cards.push(benefitCard(p, 'cash'))
  }
  if (p.school) cards.push(schoolCard(p))
  if (p.docs) {
    if (p.docAnswered('photoId') && !p.hasDoc('photoId')) cards.push(idCard(p))
    if (p.docAnswered('birth') && !p.hasDoc('birth')) cards.push(birthCard(p, false))
    if (p.docAnswered('ssn') && !p.hasDoc('ssn')) cards.push(ssnCard(p, false))
  }
  if (p.kidsDocs) {
    if (p.docAnswered('kidsBirth') && !p.hasDoc('kidsBirth')) cards.push(birthCard(p, true))
    if (p.docAnswered('kidsSsn') && !p.hasDoc('kidsSsn')) cards.push(ssnCard(p, true))
  }
  if (p.immigration && p.immigrationHelp !== 'benefits') cards.push(immigrationCard(p))
  if (p.kidsUnsure && !p.school && !p.kidsDocs) cards.push(guidanceCard(true))
  if (p.unsure) cards.push(guidanceCard(false))
  if (!cards.length && (p.docs || p.kidsDocs)) cards.push(card({
    id: 'documents-available',
    title: 'Your documents',
    category: 'next',
    steps: p.docsAnswered
      ? ['You said the listed documents are available. No replacement steps were added.', 'Go back if you need help with a different document.']
      : ['Go back and answer the documents question to see relevant steps.'],
    resources: p.kidsDocs
      ? [link('Washington birth record information', 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record')]
      : [link('Washington ID card information', 'https://dol.wa.gov/id-cards')],
  }))

  const order = { immediate: 0, next: 1, later: 2 }
  return cards.sort((a, b) => order[a.category] - order[b.category])
}
