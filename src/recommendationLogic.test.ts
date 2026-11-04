import { describe, expect, it } from 'vitest'
import { OPT } from './options'
import { buildVisibleQuestions, getCardsForAnswers, type AnswerMap } from './recommendationLogic'

const qIds = (a: AnswerMap) => buildVisibleQuestions(a).map((q) => q.id)
const cards = (a: AnswerMap) => getCardsForAnswers(a)
const ids = (a: AnswerMap) => cards(a).map((c) => c.id)
const steps = (a: AnswerMap, id: string) => cards(a).find((c) => c.id === id)?.steps.join(' ') ?? ''

describe('questions', () => {
  it('asks only the needs question first', () => {
    expect(qIds({})).toEqual(['needs'])
  })

  it('skips the children question when school is selected', () => {
    expect(qIds({ needs: [OPT.needs.school] })).not.toContain('children')
  })

  it('shows only relevant follow-ups', () => {
    const ask = qIds({ needs: [OPT.needs.food] })
    expect(ask).toContain('benefits')
    expect(ask).not.toEqual(expect.arrayContaining(['urgency']))
    expect(ask).not.toContain('docs')
  })

  it('offers children and immigration documents only when relevant', () => {
    const docs = (a: AnswerMap) => buildVisibleQuestions(a).find((q) => q.id === 'docs')?.options ?? []
    expect(docs({ needs: [OPT.needs.docs], children: [OPT.children.no] })).not.toContain(OPT.docs.kidsBirth)
    expect(docs({ needs: [OPT.needs.docs], children: [OPT.children.yes] })).toContain(OPT.docs.kidsBirth)
    expect(docs({ needs: [OPT.needs.docs] })).not.toContain(OPT.docs.immigration)
  })
})

describe('personas', () => {
  it('returns no plan before any need is chosen', () => {
    expect(ids({})).toEqual([])
  })

  it('tonight shelter, phone unsafe, King County: no phone call is suggested', () => {
    const a = {
      needs: [OPT.needs.shelter],
      children: [OPT.children.no],
      county: ['King County'],
      urgency: [OPT.urgency.tonight],
      contact: [OPT.contact.online],
      transport: [OPT.transport.ok],
    }
    expect(cards(a)[0].id).toBe('shelter-entry')
    expect(cards(a)[0].category).toBe('immediate')
    expect(steps(a, 'shelter-entry')).toContain('tonight')
    expect(steps(a, 'shelter-entry')).not.toMatch(/Call \d/)
  })

  it('shelter with children mentions children; without children does not', () => {
    const base = {
      needs: [OPT.needs.shelter],
      county: ['Snohomish County'],
      urgency: [OPT.urgency.days],
      contact: [OPT.contact.phone],
      transport: [OPT.transport.ok],
    }
    expect(steps({ ...base, children: [OPT.children.yes] }, 'shelter-entry')).toContain('children')
    expect(steps({ ...base, children: [OPT.children.no] }, 'shelter-entry')).not.toContain('children')
    expect(steps({ ...base, children: [OPT.children.no] }, 'shelter-entry')).toContain('360-862-4357')
  })

  it('later-stage shelter need is not marked immediate', () => {
    const a = {
      needs: [OPT.needs.shelter],
      children: [OPT.children.no],
      county: ['Clark County'],
      urgency: [OPT.urgency.weeks],
    }
    expect(cards(a)[0].category).toBe('next')
  })

  it('unknown county falls back without a made-up contact', () => {
    const a = { needs: [OPT.needs.shelter], county: ['Other / not listed'], urgency: [OPT.urgency.days] }
    const card = cards(a)[0]
    expect(card.resources).toEqual([])
    expect(card.steps[0]).toContain('coordinated entry')
  })

  it('already receiving food assistance gets an update step, not a new application', () => {
    const a = { needs: [OPT.needs.food], benefits: [OPT.benefits.food], contact: [OPT.contact.phone] }
    expect(ids(a)).toContain('dshs-update')
    expect(ids(a)).not.toContain('dshs-food-assistance')
  })

  it('pending application gets a status step, not a new application', () => {
    const a = { needs: [OPT.needs.food, OPT.needs.cash], benefits: [OPT.benefits.waiting] }
    expect(ids(a)).toEqual(['dshs-pending'])
  })

  it('food only: no cash, shelter, or school cards', () => {
    expect(ids({ needs: [OPT.needs.food], benefits: [OPT.benefits.none] })).toEqual(['dshs-food-assistance'])
  })

  it('apply path follows the safe contact method', () => {
    const food = (contact: string) =>
      steps({ needs: [OPT.needs.food], benefits: [OPT.benefits.none], contact: [contact] }, 'dshs-food-assistance')
    expect(food(OPT.contact.online)).not.toContain('877-501-2233')
    expect(food(OPT.contact.phone)).toContain('877-501-2233')
    expect(food(OPT.contact.inPerson)).toContain('Community Services Office')
  })

  it('transport answers change the steps', () => {
    const a = (transport: string) =>
      steps({ needs: [OPT.needs.food], benefits: [OPT.benefits.none], transport: [transport] }, 'dshs-food-assistance')
    expect(a(OPT.transport.help)).toContain('bus pass')
    expect(a(OPT.transport.no)).toContain('cannot travel')
    expect(a(OPT.transport.ok)).not.toContain('bus pass')
  })

  it('documents: only missing documents get cards', () => {
    const a = {
      needs: [OPT.needs.docs],
      children: [OPT.children.yes],
      docs: [OPT.docs.photoId, OPT.docs.birth, OPT.docs.kidsSsn],
    }
    expect(ids(a).sort()).toEqual(['birth-records-children', 'ssa-cards-self'].sort())
  })

  it('no documents and no children: ID, birth certificate, and SSN only', () => {
    const a = { needs: [OPT.needs.docs], children: [OPT.children.no], docs: [OPT.docs.none] }
    expect(ids(a).sort()).toEqual(['birth-records-self', 'photo-id', 'ssa-cards-self'].sort())
  })

  it('school need tailors steps to the chosen school needs', () => {
    const a = {
      needs: [OPT.needs.school],
      docs: [OPT.docs.kidsBirth, OPT.docs.kidsSchool],
      schoolNeeds: [OPT.school.rides, OPT.school.meals],
    }
    const text = steps(a, 'school-support')
    expect(text).toContain('rides')
    expect(text).toContain('meals')
    expect(text).not.toContain('immediate enrollment')
  })

  it('school plus housing crisis routes to the liaison with immediate enrollment', () => {
    const a = {
      needs: [OPT.needs.school, OPT.needs.shelter],
      urgency: [OPT.urgency.days],
      schoolNeeds: [OPT.school.enroll],
    }
    expect(ids(a)).toContain('school-liaison')
    expect(steps(a, 'school-liaison')).toContain('immediate enrollment')
  })

  it('immigration help type changes the plan', () => {
    const t = (kind: string) => steps({ needs: [OPT.needs.immigration], immigrationHelp: [kind] }, 'immigration-support')
    expect(t(OPT.immigration.papers)).toContain('replace or find')
    expect(t(OPT.immigration.forms)).toContain('forms')
    expect(t(OPT.immigration.papers)).not.toEqual(t(OPT.immigration.forms))
  })

  it('benefit worries come before applying', () => {
    const a = {
      needs: [OPT.needs.food, OPT.needs.immigration],
      benefits: [OPT.benefits.none],
      immigrationHelp: [OPT.immigration.benefits],
    }
    expect(steps(a, 'dshs-food-assistance')).toContain('Talk to an immigration legal provider first')
  })

  it('every card has steps and no card is duplicated', () => {
    const a = {
      needs: Object.values(OPT.needs),
      children: [OPT.children.yes],
      county: ['Pierce County'],
      urgency: [OPT.urgency.tonight],
      docs: [OPT.docs.none],
      schoolNeeds: Object.values(OPT.school),
      immigrationHelp: [OPT.immigration.unsure],
    }
    const result = cards(a)
    expect(new Set(result.map((c) => c.id)).size).toBe(result.length)
    expect(result.every((c) => c.steps.length > 0)).toBe(true)
  })
})
