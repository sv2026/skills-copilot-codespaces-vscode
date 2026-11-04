import type { ActionCard } from './resourceData'
import { OPT } from './options'
import { buildCards } from './planBuilder'

export { OPT }

export type Question = {
  id: string
  prompt: string
  helperText?: string
  multiSelect: boolean
  options?: string[]
}

export type AnswerMap = Record<string, string[]>


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

const values = (group: Record<string, string>) => Object.values(group)

export const QUESTIONS: Question[] = [
  {
    id: 'needs',
    prompt: 'What do you need help with?',
    helperText: 'Pick all that apply.',
    multiSelect: true,
    options: values(OPT.needs),
  },
  {
    id: 'children',
    prompt: 'Do children need to be included in your plan?',
    multiSelect: false,
    options: values(OPT.children),
  },
  {
    id: 'county',
    prompt: 'Which county are you in?',
    helperText: 'This version covers Western Washington.',
    multiSelect: false,
    options: COUNTY_OPTIONS,
  },
  {
    id: 'urgency',
    prompt: 'When do you need a safe place to stay?',
    multiSelect: false,
    options: values(OPT.urgency),
  },
  {
    id: 'contact',
    prompt: 'How can you safely contact services?',
    multiSelect: false,
    options: values(OPT.contact),
  },
  {
    id: 'transport',
    prompt: 'Can you get to an office or shelter in person?',
    multiSelect: false,
    options: values(OPT.transport),
  },
  {
    id: 'benefits',
    prompt: 'Do you already get, or have you applied for, any of these?',
    helperText: 'Pick all that apply.',
    multiSelect: true,
    options: values(OPT.benefits),
  },
  {
    id: 'docs',
    prompt: 'Which of these do you have or can safely get?',
    helperText: 'Pick all that apply.',
    multiSelect: true,
    options: values(OPT.docs),
  },
  {
    id: 'schoolNeeds',
    prompt: 'What do your children need for school?',
    helperText: 'Pick all that apply.',
    multiSelect: true,
    options: values(OPT.school),
  },
  {
    id: 'immigrationHelp',
    prompt: 'What kind of immigration help do you need?',
    multiSelect: false,
    options: values(OPT.immigration),
  },
]

const question = (id: string): Question => QUESTIONS.find((item) => item.id === id) as Question

export const buildVisibleQuestions = (answers: AnswerMap): Question[] => {
  const needs = answers.needs ?? []
  const has = (need: string) => needs.includes(need)
  const visible: Question[] = [question('needs')]

  if (needs.length === 0) {
    return visible
  }

  const wantsSchool = has(OPT.needs.school)
  const hasChildren = wantsSchool || answers.children?.[0] === OPT.children.yes
  const wantsShelter = has(OPT.needs.shelter) || has(OPT.needs.unsure)

  if (!wantsSchool) {
    visible.push(question('children'))
  }

  visible.push(question('county'))

  if (wantsShelter) {
    visible.push(question('urgency'))
  }

  visible.push(question('contact'), question('transport'))

  if (has(OPT.needs.food) || has(OPT.needs.cash) || has(OPT.needs.unsure)) {
    visible.push(question('benefits'))
  }

  if (has(OPT.needs.docs) || wantsSchool) {
    const docs = question('docs')
    const childDocs: string[] = [OPT.docs.kidsBirth, OPT.docs.kidsSsn, OPT.docs.kidsSchool]
    visible.push({
      ...docs,
      options: docs.options?.filter((option) => {
        if (childDocs.includes(option)) {
          return hasChildren
        }
        return option !== OPT.docs.immigration || has(OPT.needs.immigration)
      }),
    })
  }

  if (wantsSchool) {
    visible.push(question('schoolNeeds'))
  }

  if (has(OPT.needs.immigration)) {
    visible.push(question('immigrationHelp'))
  }

  return visible
}

export type Profile = {
  shelter: boolean
  food: boolean
  cash: boolean
  docs: boolean
  school: boolean
  immigration: boolean
  unsure: boolean
  children: boolean
  county?: string
  urgency?: 'tonight' | 'days' | 'weeks' | 'later'
  contact?: 'phone' | 'online' | 'inPerson' | 'unsure'
  transport?: 'ok' | 'help' | 'no'
  getsFood: boolean
  getsCash: boolean
  waiting: boolean
  hasDoc: (doc: keyof typeof OPT.docs) => boolean
  schoolNeeds: string[]
  immigrationHelp?: keyof typeof OPT.immigration
}

const keyOf = <T extends Record<string, string>>(group: T, value?: string) =>
  (Object.keys(group) as (keyof T)[]).find((key) => group[key] === value)

export const toProfile = (answers: AnswerMap): Profile => {
  const needs = answers.needs ?? []
  const owned = answers.docs ?? []
  const benefits = answers.benefits ?? []
  const school = needs.includes(OPT.needs.school)

  return {
    shelter: needs.includes(OPT.needs.shelter),
    food: needs.includes(OPT.needs.food),
    cash: needs.includes(OPT.needs.cash),
    docs: needs.includes(OPT.needs.docs),
    school,
    immigration: needs.includes(OPT.needs.immigration),
    unsure: needs.includes(OPT.needs.unsure),
    children: school || answers.children?.[0] === OPT.children.yes,
    county: COUNTY_OPTIONS.includes(answers.county?.[0] ?? '') ? answers.county?.[0] : undefined,
    urgency: keyOf(OPT.urgency, answers.urgency?.[0]),
    contact: keyOf(OPT.contact, answers.contact?.[0]),
    transport: keyOf(OPT.transport, answers.transport?.[0]),
    getsFood: benefits.includes(OPT.benefits.food),
    getsCash: benefits.includes(OPT.benefits.cash),
    waiting: benefits.includes(OPT.benefits.waiting),
    hasDoc: (doc) => owned.includes(OPT.docs[doc]),
    schoolNeeds: answers.schoolNeeds ?? [],
    immigrationHelp: keyOf(OPT.immigration, answers.immigrationHelp?.[0]),
  }
}

export const getCardsForAnswers = (answers: AnswerMap): ActionCard[] => {
  if ((answers.needs ?? []).length === 0) {
    return []
  }
  return buildCards(toProfile(answers))
}
