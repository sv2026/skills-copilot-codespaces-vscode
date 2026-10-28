import { ACTION_CARDS, type ActionCard } from './resourceData'

export type Question = {
  id: string
  prompt: string
  helperText?: string
  multiSelect: boolean
  options?: string[]
  type?: 'choice' | 'text'
  placeholder?: string
  optional?: boolean
}

export type AnswerMap = Record<string, string[]>

export const HELP_TOPIC_OPTIONS = [
  'Finding a safe place to stay',
  'Housing assistance',
  'Food and basic needs',
  'Cash or financial assistance',
  'Replacing or obtaining documents',
  'Help understanding immigration-related paperwork or finding immigration-aware services',
  'School or education support for my children',
  'Something else / I\'m not sure',
]

export const HOUSING_URGENCY_OPTIONS = [
  'Tonight',
  'Within the next few days',
  'I am safe for now but need long-term housing',
  'I do not need housing help right now',
]

export const FINANCE_OPTIONS = [
  'I have almost no money available',
  'I have some money but cannot cover my basic needs',
  'I have income but need help with housing costs',
  'I do not need financial help right now; I just need paperwork or school support',
  'I prefer not to answer',
]

export const COUNTY_OPTIONS = [
  'King County',
  'Pierce County',
  'Snohomish County',
  'Kitsap County',
  'Thurston County',
  'Whatcom County',
  'Skagit County',
  'Island County',
  'San Juan County',
  'Clark County',
  'Cowlitz County',
  'Lewis County',
  'Mason County',
  'Jefferson County',
  'Clallam County',
  'Pacific County',
  'Grays Harbor County',
  'Wahkiakum County',
  'Other / not listed',
  "I'm not sure",
]

export const CHILDREN_OPTIONS = ['Yes', 'No', 'Prefer not to say']
export const IMMIGRATION_OPTIONS = ['Yes', 'No', 'Prefer not to say']

export const QUESTIONS: Question[] = [
  {
    id: 'helpTopics',
    prompt: 'What would you like help with?',
    multiSelect: true,
    options: HELP_TOPIC_OPTIONS,
  },
  {
    id: 'childrenSupport',
    prompt: 'Are you looking for support for any children in your care?',
    helperText: 'This is optional and helps us decide whether child-specific resources are relevant.',
    multiSelect: false,
    options: CHILDREN_OPTIONS,
  },
  {
    id: 'locationCounty',
    prompt: 'Which county are you currently in?',
    helperText: 'This version focuses on Western Washington counties. If your county is not listed, choose “Other / not listed.”',
    multiSelect: false,
    options: COUNTY_OPTIONS,
  },
  {
    id: 'housingUrgency',
    prompt: 'When do you need a safe place to stay?',
    multiSelect: false,
    options: HOUSING_URGENCY_OPTIONS,
  },
  {
    id: 'finances',
    prompt: 'Which statement best describes your current finances?',
    helperText: 'You do not need to share exact account balances.',
    multiSelect: false,
    options: FINANCE_OPTIONS,
  },
  {
    id: 'userIdDocs',
    prompt: 'Which of these documents can you access right now?',
    multiSelect: false,
    options: [
      'My own government-issued photo ID',
      'Other documents that might help establish my identity',
      'No identification documents',
      "I'm not sure",
    ],
  },
  {
    id: 'childrenDocs',
    prompt: "Do you have access to your children's birth certificates or Social Security numbers?",
    multiSelect: false,
    options: [
      'I have both',
      'I have their birth certificates but not their Social Security numbers',
      'I have their Social Security numbers but not their birth certificates',
      'I have neither',
      "I'm not sure",
    ],
  },
  {
    id: 'schoolSupport',
    prompt: 'What school or education support would be most helpful?',
    multiSelect: true,
    options: [
      'Staying in their current school',
      'Transportation to school',
      'Free school meals',
      'Enrolling in a different school',
      "I'm not sure yet",
    ],
  },
  {
    id: 'schoolDistrict',
    prompt: 'If you want, which school district are you thinking about?',
    helperText: 'This is optional. If you are not sure, leave it blank and we can still suggest next steps.',
    multiSelect: false,
    type: 'text',
    placeholder: 'Optional: school district name or district code',
    optional: true,
  },
  {
    id: 'immigrationHelp',
    prompt: 'Would you like help with immigration-related paperwork or finding services that understand immigration-related concerns?',
    helperText: 'This is optional. You do not need to share your status or citizenship details.',
    multiSelect: false,
    options: IMMIGRATION_OPTIONS,
  },
]

export const buildVisibleQuestions = (answers: AnswerMap): Question[] => {
  const helpTopics = answers.helpTopics ?? []
  const childrenSupport = answers.childrenSupport?.[0]
  const wantsSchoolSupport =
    helpTopics.includes('School or education support for my children') ||
    (childrenSupport === 'Yes' && helpTopics.includes("Something else / I'm not sure"))
  const needsHousing =
    helpTopics.includes('Finding a safe place to stay') || helpTopics.includes('Housing assistance')
  const needsFoodOrCash =
    helpTopics.includes('Food and basic needs') || helpTopics.includes('Cash or financial assistance')
  const needsDocs = helpTopics.includes('Replacing or obtaining documents')
  const needsImmigration =
    helpTopics.includes('Help understanding immigration-related paperwork or finding immigration-aware services')

  const visibleQuestions: Question[] = [QUESTIONS[0]]

  if (helpTopics.length > 0) {
    visibleQuestions.push(QUESTIONS[1])
  }

  visibleQuestions.push(QUESTIONS[2])

  if (needsHousing) {
    visibleQuestions.push(QUESTIONS[3])
  }

  if (needsFoodOrCash || helpTopics.includes("Something else / I'm not sure")) {
    visibleQuestions.push(QUESTIONS[4])
  }

  if (needsDocs || helpTopics.includes("Something else / I'm not sure")) {
    visibleQuestions.push(QUESTIONS[5])
  }

  if (childrenSupport === 'Yes' && (needsDocs || wantsSchoolSupport)) {
    visibleQuestions.push(QUESTIONS[6])
  }

  if (childrenSupport === 'Yes' && wantsSchoolSupport) {
    visibleQuestions.push(QUESTIONS[7])
    visibleQuestions.push(QUESTIONS[8])
  }

  if (needsImmigration) {
    visibleQuestions.push(QUESTIONS[9])
  }

  return visibleQuestions
}

export const getCardsForAnswers = (answers: AnswerMap): ActionCard[] => {
  const selected = new Set<string>()
  const helpTopics = answers.helpTopics ?? []
  const schoolNeeds = answers.schoolSupport ?? []
  const housingUrgency = answers.housingUrgency?.[0]
  const childrenSupport = answers.childrenSupport?.[0]
  const childrenDocs = answers.childrenDocs?.[0]
  const userIdDocs = answers.userIdDocs?.[0]
  const finances = answers.finances?.[0]
  const schoolSupportSelected = schoolNeeds.length > 0

  const needsSchoolSupport =
    helpTopics.includes('School or education support for my children') ||
    (childrenSupport === 'Yes' && schoolSupportSelected)

  const needsHousing =
    helpTopics.includes('Finding a safe place to stay') ||
    helpTopics.includes('Housing assistance') ||
    housingUrgency === 'Tonight' ||
    housingUrgency === 'Within the next few days' ||
    housingUrgency === 'I am safe for now but need long-term housing'

  const needsFood = helpTopics.includes('Food and basic needs')
  const needsCash = helpTopics.includes('Cash or financial assistance')
  const needsDocs =
    helpTopics.includes('Replacing or obtaining documents') ||
    userIdDocs === 'No identification documents' ||
    userIdDocs === "I'm not sure" ||
    childrenDocs === 'I have neither' ||
    childrenDocs === "I'm not sure"

  const needsImmigration =
    helpTopics.includes('Help understanding immigration-related paperwork or finding immigration-aware services') ||
    answers.immigrationHelp?.[0] === 'Yes'

  if (needsFood) {
    selected.add('dshs-food-assistance')
  }

  if (needsCash) {
    selected.add('dshs-cash-assistance')
  }

  if (needsHousing) {
    selected.add('shelter-intake')
    selected.add('housing-follow-up')
    if (needsSchoolSupport) {
      selected.add('school-liaison')
    }
  }

  if (needsSchoolSupport) {
    selected.add('school-support')
  }

  if (needsDocs) {
    selected.add('birth-records')
    if (userIdDocs === 'No identification documents' || childrenDocs === 'I have neither') {
      selected.add('ssa-cards')
    }
  }

  if (needsImmigration) {
    selected.add('immigration-support')
  }

  if (
    finances &&
    finances !== 'I prefer not to answer' &&
    finances !== 'I do not need financial help right now; I just need paperwork or school support'
  ) {
    if (
      finances === 'I have almost no money available' ||
      finances === 'I have some money but cannot cover my basic needs' ||
      finances === 'I have income but need help with housing costs'
    ) {
      if (!needsCash && !needsFood) {
        selected.add('dshs-cash-assistance')
      }
    }
  }

  const cards = ACTION_CARDS.filter((card) => selected.has(card.id)).sort((a, b) => {
    const categoryOrder = { immediate: 0, next: 1, later: 2 }
    return categoryOrder[a.category] - categoryOrder[b.category]
  })

  return cards
}
