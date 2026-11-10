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
  'Ask the place about its hours and how to get food.',
)
const schoolDirectory = link(
  'Washington school district liaison list',
  'https://ospi.k12.wa.us/student-success/access-opportunity-education/students-experiencing-homelessness/homeless-education-liaison-contact-list',
)
const familyDirectory = link(
  'Washington basic needs resource directory',
  'https://dcyf.wa.gov/services/housing-basic-needs/basic-needs-community-resource-directory',
  'This list is for all of Washington. Ask each place if it is open and has room.',
)

const travelNote = (p: Profile): string[] => {
  if (p.transport === 'help') return ['Ask if they can help with a ride before you go.']
  if (p.transport === 'no') return ['You said you cannot travel. Ask if you can do these steps without going in person.']
  return []
}

const shelterCard = (p: Profile): ActionCard => {
  const entry = p.county ? COUNTY_ENTRY_POINTS[p.county] : undefined
  const entryResource: LinkResource = entry?.url
    ? { ...link(entry.label, entry.url, entry.note), phone: entry.phone }
    : familyDirectory
  const steps: string[] = []

  if (!entry) {
    steps.push('We do not have a verified housing contact for this county yet. The list below is for all of Washington. It may not show shelters near you.')
  } else {
    steps.push(entry.url
      ? 'Open the housing page to see how to get help. We have not checked if you can sign up online.'
      : 'Open the list below. We have not checked if you can sign up online.')
  }
  if (p.urgency === 'tonight') steps.push('Ask for a safe place for tonight.')
  else if (p.urgency === 'days') steps.push('Ask for a place in the next few days. Ask what help you can get until then.')
  else if (p.urgency === 'weeks') steps.push('Ask what choices you have in the next few weeks and how to apply.')
  else if (p.urgency === 'later') steps.push('Ask about housing for later and how to apply.')
  if (p.children) steps.push('Say that your children need a place too.')
  steps.push(...travelNote(p))
  return card({
    id: 'shelter-entry',
    title: p.county && !['Other / not listed', "I'm not sure"].includes(p.county)
      ? `Find housing in ${p.county}` : 'Find housing near you',
    category: p.urgency === 'tonight' || p.urgency === 'days' ? 'immediate' : 'next',
    steps,
    usefulDocuments: {
      required: [], helpful: [], alternativesToConfirm: ['Ask what information they need and what can wait.'],
      unverified: ['Space, how to sign up, and who can get help all need to be checked.'],
    },
    resources: [entryResource],
  })
}

const foodNowCard = (p: Profile): ActionCard => card({
  id: 'food-now',
  title: 'Find food near you',
  category: 'immediate',
  steps: [
    'Use the food list to find food near you. Ask the place about its hours and how to get food.',
    ...(p.transport === 'no' ? ['We have not checked if food can be delivered.'] : travelNote(p)),
  ],
  resources: [foodDirectory],
})

const benefitResources = (): [LinkResource, ResourceLink] => [washingtonConnection, dshsPhone]

const benefitSteps = (p: Profile, benefit: string) => [
  ...(p.immigration && p.immigrationHelp === 'benefits'
    ? ['You can ask an immigration lawyer how applying could affect you.']
    : []),
  `Apply for ${benefit} on Washington Connection. You can also ask DSHS about other ways to apply.`,
  ...travelNote(p),
]

const benefitCard = (p: Profile, kind: 'food' | 'cash'): ActionCard => card({
  id: kind === 'food' ? 'dshs-food-assistance' : 'dshs-cash-assistance',
  title: kind === 'food' ? 'Apply for food help' : 'Apply for cash help',
  category: 'immediate',
  steps: [
    ...benefitSteps(p, kind === 'food' ? 'Basic Food' : 'cash assistance'),
    ...(kind === 'food' ? ['Ask DSHS about fast help. You may not get help today.'] : []),
    'Ask what proof you need and what can wait.',
  ],
  resources: benefitResources(),
})

const benefitFollowCard = (p: Profile): ActionCard | undefined => {
  if (p.waiting) return card({
    id: 'dshs-pending',
    title: 'Check on your application',
    category: 'immediate',
    steps: [
      'Check your application on Washington Connection, or ask DSHS.',
      ...(!p.pendingBenefits || p.pendingBenefits === 'unsure'
        ? ['Find out what you applied for before you apply again.'] : []),
      'Ask what to do if you can\'t safely give them something they ask for.',
      ...travelNote(p),
    ],
    resources: benefitResources(),
  })
  if (p.getsFood || p.getsCash) return card({
    id: 'dshs-update',
    title: 'Look at the help you get now',
    category: 'immediate',
    steps: [
      'Look at your case on Washington Connection, or ask DSHS about your help.',
      'Ask how to get mail and messages safely. Ask if you need to update anything.',
      ...travelNote(p),
    ],
    resources: benefitResources(),
  })
  return undefined
}

const idCard = (p: Profile): ActionCard => card({
  id: 'photo-id', title: 'Replace your photo ID', category: p.shelter ? 'next' : 'immediate',
  steps: [
    'Find out what proof and fees you need to replace your ID.',
    ...(p.transport === 'no'
      ? ['You can\'t travel. We have not checked if you can replace it without going in.']
      : ['Ask if you must go to an office.']),
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
      kids ? 'Find out where each child was born.' : 'Find out where you were born.',
      'Use that state’s birth records office. Ask what ID they take, what it costs, and other ways to get it.',
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
    'Ask if you really need a new card.',
    'Read how Social Security replaces cards, what ID they take, and if you can do it online.',
    ...(kids ? ['Ask what proof you need to show who the child is and that you are the parent.'] : []),
    ...travelNote(p),
  ],
  resources: [
    link('Start a Social Security card application', 'https://secure.ssa.gov/ossnap/public/', 'Social Security may ask for personal information. You may need to go to an office.'),
    link('SSA replacement card information', 'https://www.ssa.gov/number-card/replace-card'),
  {
    label: 'Social Security Administration', phone: '800-772-1213',
    verificationStatus: 'Verified', lastVerified: '2026-10-25',
  }],
})

const schoolCard = (p: Profile): ActionCard => {
  const wants = (option: string) => p.schoolNeeds.includes(option)
  const steps = [
    'Ask the school or school district for the help you picked.',
    ...(wants(OPT.school.stay) ? ['Ask if your child can stay in the same school.'] : []),
    ...(wants(OPT.school.rides) ? ['Ask about rides to school.'] : []),
    ...(wants(OPT.school.meals) ? ['Ask about free school meals.'] : []),
    ...(wants(OPT.school.enroll) ? ['Ask how to sign up. Ask what can wait if papers are missing.'] : []),
    ...(wants(OPT.school.records) ? ['Ask the school to send your child’s records.'] : []),
    ...((p.docAnswered('kidsSchool') && !p.hasDoc('kidsSchool')) || (p.docAnswered('kidsBirth') && !p.hasDoc('kidsBirth'))
      ? ['Tell the school which papers you don\'t have. Ask what can wait.'] : []),
    'If you do not have steady housing, ask the school district helper about extra school rights.',
    ...(wants(OPT.school.enroll)
      ? ['If you have these rights, your child should be able to start school even without all papers.']
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
    options: 'Ask about your choices.',
    forms: 'Ask for help with your forms.',
    papers: 'Ask how to find or replace your immigration papers.',
    benefits: 'Ask how applying for help could affect you.',
    unsure: 'Ask what immigration help they offer.',
  }
  return card({
    id: 'immigration-support', title: 'Find immigration legal help',
    category: p.immigrationHelp === 'benefits' ? 'immediate' : 'next',
    steps: [
      topic[p.immigrationHelp ?? 'unsure'],
      'Ask how to reach them and how to make an appointment.',
      'Before you share anything, ask what they need and how they will use it.',
      ...travelNote(p),
    ],
    resources: [
      link('Northwest Immigrant Rights Project', 'https://www.nwirp.org/', 'Check how to reach them and when they are open.'),
      link('Washington immigration legal help directory', 'https://www.immigrationlawhelp.org/search?state=WA', 'Check how to reach them and when they are open.'),
    ],
  })
}

const guidanceCard = (kids: boolean): ActionCard => card({
  id: kids ? 'children-unsure' : 'choose-priorities',
  title: kids ? 'Choose what your children need' : 'Choose where to start',
  category: 'next',
  steps: kids
    ? ['Go back and pick school or your children’s papers if they fit.', 'We do not have steps for other needs for children yet.']
    : ['Go back and pick what you want help with.', 'You can pick just one thing.'],
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
      ? ['You said you have these papers. We did not add steps to replace them.', 'Go back if you need a different paper.']
      : ['Go back and answer the documents question to see your steps.'],
    resources: p.kidsDocs
      ? [link('Washington birth record information', 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record')]
      : [link('Washington ID card information', 'https://dol.wa.gov/id-cards')],
  }))

  const order = { immediate: 0, next: 1, later: 2 }
  return cards.sort((a, b) => order[a.category] - order[b.category])
}
