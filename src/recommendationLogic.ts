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
    id: 'kidsNeeds',
    prompt: 'What do your children need help with?',
    helperText: 'Pick all that apply.',
    multiSelect: true,
    options: values(OPT.kids),
  },
  {
    id: 'county',
    prompt: 'Which county are you in?',
    helperText: 'This site covers Western Washington.',
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
    id: 'benefits',
    prompt: 'Do you get any of these, or have you applied?',
    helperText: 'Pick all that apply.',
    multiSelect: true,
    options: values(OPT.benefits),
  },
  {
    id: 'pendingBenefits',
    prompt: 'What did you apply for?',
    multiSelect: false,
    options: values(OPT.pending),
  },
  {
    id: 'docs',
    prompt: 'Which of these do you have, or can you get safely?',
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
    prompt: 'What immigration help do you need?',
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

  const wantsKids = has(OPT.needs.kids)
  const kidsNeeds = answers.kidsNeeds ?? []
  const wantsSchool = wantsKids && kidsNeeds.includes(OPT.kids.school)
  const kidsDocs = wantsKids && kidsNeeds.includes(OPT.kids.docs)
  const wantsShelter = has(OPT.needs.shelter)

  if (wantsKids) {
    visible.push(question('kidsNeeds'))
  }

  visible.push(question('county'))

  if (wantsShelter) {
    visible.push(question('urgency'))
  }

  if (has(OPT.needs.food) || has(OPT.needs.cash)) {
    visible.push(question('benefits'))
    if (answers.benefits?.includes(OPT.benefits.waiting)) {
      visible.push(question('pendingBenefits'))
    }
  }

  if (has(OPT.needs.docs) || kidsDocs || wantsSchool) {
    const docs = question('docs')
    visible.push({
      ...docs,
      options: docs.options?.filter((option) => {
        if (option === OPT.docs.none) {
          return true
        }
        if (option === OPT.docs.kidsBirth) return kidsDocs || wantsSchool
        if (option === OPT.docs.kidsSsn) return kidsDocs
        if (option === OPT.docs.kidsSchool) return wantsSchool
        if (option === OPT.docs.immigration) {
          return has(OPT.needs.immigration)
        }
        return has(OPT.needs.docs)
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
  kidsDocs: boolean
  school: boolean
  immigration: boolean
  unsure: boolean
  children: boolean
  county?: string
  urgency?: 'tonight' | 'days' | 'weeks' | 'later'
  getsFood: boolean
  getsCash: boolean
  waiting: boolean
  pendingBenefits?: keyof typeof OPT.pending
  kidsUnsure: boolean
  docsAnswered: boolean
  hasDoc: (doc: keyof typeof OPT.docs) => boolean
  docAnswered: (doc: keyof typeof OPT.docs) => boolean
  schoolNeeds: string[]
  immigrationHelp?: keyof typeof OPT.immigration
}

const keyOf = <T extends Record<string, string>>(group: T, value?: string) =>
  (Object.keys(group) as (keyof T)[]).find((key) => group[key] === value)

export const toProfile = (answers: AnswerMap): Profile => {
  const needs = answers.needs ?? []
  const owned = answers.docs ?? []
  const benefits = answers.benefits ?? []
  const kids = needs.includes(OPT.needs.kids)
  const kidsNeeds = kids ? (answers.kidsNeeds ?? []) : []

  return {
    shelter: needs.includes(OPT.needs.shelter),
    food: needs.includes(OPT.needs.food),
    cash: needs.includes(OPT.needs.cash),
    docs: needs.includes(OPT.needs.docs),
    kidsDocs: kidsNeeds.includes(OPT.kids.docs),
    school: kidsNeeds.includes(OPT.kids.school),
    immigration: needs.includes(OPT.needs.immigration),
    unsure: needs.includes(OPT.needs.unsure),
    children: kids,
    county: COUNTY_OPTIONS.includes(answers.county?.[0] ?? '') ? answers.county?.[0] : undefined,
    urgency: keyOf(OPT.urgency, answers.urgency?.[0]),
    getsFood: benefits.includes(OPT.benefits.food),
    getsCash: benefits.includes(OPT.benefits.cash),
    waiting: benefits.includes(OPT.benefits.waiting),
    pendingBenefits: benefits.includes(OPT.benefits.waiting)
      ? keyOf(OPT.pending, answers.pendingBenefits?.[0])
      : undefined,
    kidsUnsure: kidsNeeds.includes(OPT.kids.unsure),
    docsAnswered: owned.length > 0,
    hasDoc: (doc) => owned.includes(OPT.docs[doc]),
    docAnswered: (doc) => {
      const docs = buildVisibleQuestions(answers).find((item) => item.id === 'docs')
      return Boolean(owned.length && docs?.options?.includes(OPT.docs[doc]))
    },
    schoolNeeds: answers.schoolNeeds ?? [],
    immigrationHelp: keyOf(OPT.immigration, answers.immigrationHelp?.[0]),
  }
}

export const getCardsForAnswers = (answers: AnswerMap): ActionCard[] => {
  const activeAnswers: AnswerMap = Object.fromEntries(
    buildVisibleQuestions(answers).map((item) => [
      item.id,
      (answers[item.id] ?? []).filter((answer) => item.options?.includes(answer)),
    ]),
  )
  if ((activeAnswers.needs ?? []).length === 0) {
    return []
  }
  return buildCards(toProfile(activeAnswers))
}
