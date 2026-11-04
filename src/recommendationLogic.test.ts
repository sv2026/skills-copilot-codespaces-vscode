import { describe, expect, it } from 'vitest'
import { OPT } from './options'
import { buildVisibleQuestions, COUNTY_OPTIONS, getCardsForAnswers, type AnswerMap } from './recommendationLogic'

const qIds = (a: AnswerMap) => buildVisibleQuestions(a).map((q) => q.id)
const cards = (a: AnswerMap) => getCardsForAnswers(a)
const ids = (a: AnswerMap) => cards(a).map((c) => c.id)
const steps = (a: AnswerMap, id: string) => cards(a).find((c) => c.id === id)?.steps.join(' ') ?? ''

describe('questions', () => {
  it('asks only the needs question first', () => {
    expect(qIds({})).toEqual(['needs'])
  })

  it('asks about the children needs, not a yes/no, when care for children is selected', () => {
    const ask = qIds({ needs: [OPT.needs.kids] })
    expect(ask).toContain('kidsNeeds')
    expect(ask).not.toContain('children')
    expect(ask).not.toContain('schoolNeeds')
    expect(qIds({ needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.school] })).toContain('schoolNeeds')
  })

  it('shows only relevant follow-ups', () => {
    const ask = qIds({ needs: [OPT.needs.food] })
    expect(ask).toContain('benefits')
    expect(ask).not.toContain('children')
    expect(ask).not.toContain('kidsNeeds')
    expect(ask).not.toContain('contact')
    expect(ask).not.toEqual(expect.arrayContaining(['urgency']))
    expect(ask).not.toContain('docs')
  })

  it('offers children and immigration documents only when relevant', () => {
    const docs = (a: AnswerMap) => buildVisibleQuestions(a).find((q) => q.id === 'docs')?.options ?? []
    expect(docs({ needs: [OPT.needs.docs] })).not.toContain(OPT.docs.kidsBirth)
    expect(docs({ needs: [OPT.needs.docs], children: ['Yes'] })).not.toContain(OPT.docs.kidsBirth)
    expect(docs({ needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.docs] })).toContain(OPT.docs.kidsBirth)
    expect(docs({ needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.docs] })).not.toContain(OPT.docs.kidsSchool)
    expect(docs({ needs: [OPT.needs.docs] })).not.toContain(OPT.docs.immigration)
    expect(docs({ needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.docs] })).toContain(OPT.docs.none)
  })

  it('only asks what is pending when an application is pending', () => {
    expect(qIds({ needs: [OPT.needs.food], benefits: [OPT.benefits.waiting] })).toContain('pendingBenefits')
    expect(qIds({ needs: [OPT.needs.food], benefits: [OPT.benefits.none] })).not.toContain('pendingBenefits')
  })

  describe('scenario coverage', () => {
    const scenarios: { name: string; answers: AnswerMap; expected: string[]; absent?: string[] }[] = [
      { name: '1 Clark: tonight, food, online and transport help', answers: {
        needs: [OPT.needs.shelter, OPT.needs.food, OPT.needs.kids], kidsNeeds: [OPT.kids.unsure], county: ['Clark County'],
        urgency: [OPT.urgency.tonight], transport: [OPT.transport.help], benefits: [OPT.benefits.none],
      }, expected: ['shelter-entry', 'food-now', 'dshs-food-assistance', 'children-unsure'] },
      { name: '2 Snohomish: housing and enrollment', answers: {
        needs: [OPT.needs.shelter, OPT.needs.kids], kidsNeeds: [OPT.kids.school], county: ['Snohomish County'],
        urgency: [OPT.urgency.days], transport: [OPT.transport.ok],
        docs: [OPT.docs.none], schoolNeeds: [OPT.school.enroll, OPT.school.records],
      }, expected: ['shelter-entry', 'school-liaison'], absent: ['birth-records-children'] },
      { name: '3 King: school with records', answers: {
        needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.school], county: ['King County'],
        transport: [OPT.transport.no], docs: [OPT.docs.kidsBirth, OPT.docs.kidsSchool],
        schoolNeeds: [OPT.school.stay, OPT.school.rides, OPT.school.meals],
      }, expected: ['school-support'], absent: ['shelter-entry', 'birth-records-children'] },
      { name: '4 Whatcom: food benefits already received', answers: {
        needs: [OPT.needs.food], county: ['Whatcom County'],
        transport: [OPT.transport.ok], benefits: [OPT.benefits.food],
      }, expected: ['food-now', 'dshs-update'], absent: ['dshs-food-assistance'] },
      { name: '5 Pierce: cash application pending, type unknown', answers: {
        needs: [OPT.needs.cash, OPT.needs.kids], kidsNeeds: [OPT.kids.unsure], county: ['Pierce County'],
        transport: [OPT.transport.ok], benefits: [OPT.benefits.waiting], pendingBenefits: [OPT.pending.unsure],
      }, expected: ['dshs-pending'], absent: ['dshs-cash-assistance'] },
      { name: '6 Thurston: food benefit and cash', answers: {
        needs: [OPT.needs.food, OPT.needs.cash], county: ['Thurston County'],
        transport: [OPT.transport.help], benefits: [OPT.benefits.food],
      }, expected: ['food-now', 'dshs-update', 'dshs-cash-assistance'], absent: ['dshs-food-assistance'] },
      { name: '7 Kitsap: ID and personal SS card', answers: {
        needs: [OPT.needs.docs], county: ['Kitsap County'],
        transport: [OPT.transport.no], docs: [OPT.docs.birth],
      }, expected: ['photo-id', 'ssa-cards-self'], absent: ['birth-records-self'] },
      { name: '8 Island: children’s SS cards only', answers: {
        needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.docs], county: ['Island County'],
        transport: [OPT.transport.ok], docs: [OPT.docs.kidsBirth],
      }, expected: ['ssa-cards-children'], absent: ['birth-records-children', 'school-support', 'photo-id'] },
      { name: '9 Mason: housing and unavailable documents', answers: {
        needs: [OPT.needs.shelter, OPT.needs.docs, OPT.needs.kids], kidsNeeds: [OPT.kids.docs], county: ['Mason County'],
        urgency: [OPT.urgency.weeks], transport: [OPT.transport.help], docs: [OPT.docs.none],
      }, expected: ['shelter-entry', 'photo-id', 'birth-records-self', 'ssa-cards-self', 'birth-records-children', 'ssa-cards-children'] },
      { name: '10 Skagit: immigration options online', answers: {
        needs: [OPT.needs.immigration], county: ['Skagit County'],
        transport: [OPT.transport.no], immigrationHelp: [OPT.immigration.options],
      }, expected: ['immigration-support'] },
      { name: '11 Grays Harbor: immigration forms and cash', answers: {
        needs: [OPT.needs.immigration, OPT.needs.cash, OPT.needs.kids], kidsNeeds: [OPT.kids.unsure], county: ['Grays Harbor County'],
        transport: [OPT.transport.ok], benefits: [OPT.benefits.none], immigrationHelp: [OPT.immigration.forms],
      }, expected: ['immigration-support', 'dshs-cash-assistance'] },
      { name: '12 Jefferson: immigration papers, in person', answers: {
        needs: [OPT.needs.immigration, OPT.needs.kids], kidsNeeds: [OPT.kids.unsure], county: ['Jefferson County'],
        transport: [OPT.transport.help], immigrationHelp: [OPT.immigration.papers],
      }, expected: ['immigration-support'] },
      { name: '13 Whatcom: immigration benefits concern', answers: {
        needs: [OPT.needs.food, OPT.needs.cash, OPT.needs.immigration], county: ['Whatcom County'],
        transport: [OPT.transport.no], benefits: [OPT.benefits.none], immigrationHelp: [OPT.immigration.benefits],
      }, expected: ['food-now', 'immigration-support', 'dshs-food-assistance', 'dshs-cash-assistance'] },
      { name: '14 San Juan: explicit housing and pending benefit', answers: {
        needs: [OPT.needs.unsure, OPT.needs.shelter, OPT.needs.food], county: ['San Juan County'],
        urgency: [OPT.urgency.tonight], transport: [OPT.transport.no], benefits: [OPT.benefits.waiting],
      }, expected: ['shelter-entry', 'food-now', 'dshs-pending', 'choose-priorities'], absent: ['dshs-food-assistance'] },
      { name: '15 unknown: children’s needs uncertain', answers: {
        needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.unsure], county: ["I'm not sure"],
        transport: [OPT.transport.no],
      }, expected: ['children-unsure'], absent: ['school-support', 'birth-records-children'] },
    ]

    it.each(scenarios)('$name', ({ answers, expected, absent }) => {
      expect(ids(answers)).toEqual(expect.arrayContaining(expected))
      for (const id of absent ?? []) expect(ids(answers)).not.toContain(id)
      expect(new Set(ids(answers)).size).toBe(ids(answers).length)
      expect(cards(answers).every((item) => item.resources.some((resource) => resource.url))).toBe(true)
    })

    it('does not assume unavailable personal ID from a child-only checklist', () => {
      const answers = { needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.docs], docs: [OPT.docs.none] }
      expect(ids(answers)).toEqual(['birth-records-children', 'ssa-cards-children'])
      expect(steps(answers, 'birth-records-children')).not.toContain('Get your photo ID first')
    })

    it('ignores document answers hidden after changing needs', () => {
      const answers = {
        needs: [OPT.needs.docs],
        docs: [OPT.docs.kidsBirth],
      }
      expect(ids(answers)).not.toContain('photo-id')
      expect(ids(answers)).toContain('documents-available')
      expect(steps(answers, 'documents-available')).toContain('answer the documents question')
    })

    it('does not create unrelated cards for uncertainty', () => {
      expect(ids({ needs: [OPT.needs.unsure] })).toEqual(['choose-priorities'])
      expect(qIds({ needs: [OPT.needs.unsure] })).not.toContain('urgency')
    })

    it('allows a new benefit application when the other benefit is pending', () => {
      const base = { needs: [OPT.needs.food, OPT.needs.cash], benefits: [OPT.benefits.waiting] }
      expect(ids({ ...base, pendingBenefits: [OPT.pending.food] })).toContain('dshs-cash-assistance')
      expect(ids({ ...base, pendingBenefits: [OPT.pending.food] })).not.toContain('dshs-food-assistance')
      expect(ids({ ...base, pendingBenefits: [OPT.pending.unsure] })).not.toContain('dshs-cash-assistance')
    })

    it('ignores a stale contact answer when generating recommendations', () => {
      const base = { needs: [OPT.needs.food], benefits: [OPT.benefits.none] }
      expect(cards({ ...base, contact: ['Online only; phone is not safe'] })).toEqual(cards(base))
    })

    it('recognizes the lack of a confirmed San Juan housing contact', () => {
      const a = { needs: [OPT.needs.shelter], county: ['San Juan County'], urgency: [OPT.urgency.tonight] }
      expect(steps(a, 'shelter-entry')).toContain('do not have a verified housing contact')
      expect(cards(a)[0].resources[0].url).toContain('dcyf.wa.gov')
    })

    it('provides a web link on housing slides for every county option', () => {
      for (const county of COUNTY_OPTIONS) {
        const [housing] = cards({ needs: [OPT.needs.shelter], county: [county], urgency: [OPT.urgency.tonight] })
        expect(housing.resources.some((resource) => resource.url?.startsWith('https://')), county).toBe(true)
      }
    })

    it('provides links on guidance and available-document slides', () => {
      const inputs: AnswerMap[] = [
        { needs: [OPT.needs.unsure] },
        { needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.unsure] },
        { needs: [OPT.needs.docs], docs: [OPT.docs.photoId, OPT.docs.birth, OPT.docs.ssn] },
        { needs: [OPT.needs.kids], kidsNeeds: [OPT.kids.docs], docs: [OPT.docs.kidsBirth, OPT.docs.kidsSsn] },
      ]
      for (const answers of inputs) {
        expect(cards(answers).every((item) => item.resources.some((resource) => resource.url?.startsWith('https://')))).toBe(true)
      }
    })
  })
})

describe('personas', () => {
  it('returns no plan before any need is chosen', () => {
    expect(ids({})).toEqual([])
  })

  it('tonight shelter, King County: provides an online resource', () => {
    const a = {
      needs: [OPT.needs.shelter],
      county: ['King County'],
      urgency: [OPT.urgency.tonight],
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
      transport: [OPT.transport.ok],
    }
    expect(steps({ ...base, needs: [OPT.needs.shelter, OPT.needs.kids], kidsNeeds: [OPT.kids.unsure] }, 'shelter-entry')).toContain('children')
    expect(steps({ ...base, children: ['Yes'] }, 'shelter-entry')).not.toContain('children')
    expect(cards(base)[0].resources[0].phone).toBe('360-862-4357')
  })

  it('later-stage shelter need is not marked immediate', () => {
    const a = {
      needs: [OPT.needs.shelter],
      county: ['Clark County'],
      urgency: [OPT.urgency.weeks],
    }
    expect(cards(a)[0].category).toBe('next')
  })

  it('unknown county falls back without a made-up contact', () => {
    const a = { needs: [OPT.needs.shelter], county: ['Other / not listed'], urgency: [OPT.urgency.days] }
    const card = cards(a)[0]
    expect(card.resources[0].url).toContain('dcyf.wa.gov')
    expect(card.steps[0]).toContain('do not have a verified housing contact')
  })

  it('already receiving food assistance gets an update step, not a new application', () => {
    const a = { needs: [OPT.needs.food], benefits: [OPT.benefits.food] }
    expect(ids(a)).toContain('dshs-update')
    expect(ids(a)).not.toContain('dshs-food-assistance')
  })

  it('pending application gets a status step, not a new application', () => {
    const a = { needs: [OPT.needs.food, OPT.needs.cash], benefits: [OPT.benefits.waiting] }
    expect(ids(a)).toEqual(['food-now', 'dshs-pending'])
  })

  it('food only: no cash, shelter, or school cards', () => {
    expect(ids({ needs: [OPT.needs.food], benefits: [OPT.benefits.none] })).toEqual(['food-now', 'dshs-food-assistance'])
  })

  it('offers an online application without requiring a phone call', () => {
    const a = { needs: [OPT.needs.food], benefits: [OPT.benefits.none] }
    const resource = cards(a).find((card) => card.id === 'dshs-food-assistance')?.resources[0]
    expect(resource?.url).toBe('https://www.washingtonconnection.org/')
    expect(steps(a, 'dshs-food-assistance')).not.toMatch(/call/i)
  })

  it('transport answers change the steps', () => {
    const a = (transport: string) =>
      steps({ needs: [OPT.needs.food], benefits: [OPT.benefits.none], transport: [transport] }, 'dshs-food-assistance')
    expect(a(OPT.transport.help)).toContain('transportation help')
    expect(a(OPT.transport.no)).toContain('cannot travel')
    expect(a(OPT.transport.ok)).not.toContain('transportation help')
  })

  it('documents: only missing documents get cards', () => {
    const a = {
      needs: [OPT.needs.docs, OPT.needs.kids],
      kidsNeeds: [OPT.kids.docs],
      docs: [OPT.docs.photoId, OPT.docs.birth, OPT.docs.kidsSsn],
    }
    expect(ids(a).sort()).toEqual(['birth-records-children', 'ssa-cards-self'].sort())
  })

  it('no documents and no children: ID, birth certificate, and SSN only', () => {
    const a = { needs: [OPT.needs.docs], docs: [OPT.docs.none] }
    expect(ids(a).sort()).toEqual(['birth-records-self', 'photo-id', 'ssa-cards-self'].sort())
  })

  it('school need tailors steps to the chosen school needs', () => {
    const a = {
      needs: [OPT.needs.kids],
      kidsNeeds: [OPT.kids.school],
      docs: [OPT.docs.kidsBirth, OPT.docs.kidsSchool],
      schoolNeeds: [OPT.school.rides, OPT.school.meals],
    }
    const text = steps(a, 'school-support')
    expect(text).toContain('transportation')
    expect(text).toContain('meals')
    expect(text).not.toContain('immediate enrollment')
  })

  it('school plus housing crisis routes to the liaison with immediate enrollment', () => {
    const a = {
      needs: [OPT.needs.kids, OPT.needs.shelter],
      kidsNeeds: [OPT.kids.school],
      urgency: [OPT.urgency.days],
      schoolNeeds: [OPT.school.enroll],
    }
    expect(ids(a)).toContain('school-liaison')
    expect(steps(a, 'school-liaison')).toContain('If eligible')
    expect(steps(a, 'school-liaison')).toContain('enrollment should not wait')
  })

  it('immigration help type changes the plan', () => {
    const t = (kind: string) => steps({ needs: [OPT.needs.immigration], immigrationHelp: [kind] }, 'immigration-support')
    expect(t(OPT.immigration.papers)).toContain('find or replace')
    expect(t(OPT.immigration.forms)).toContain('forms')
    expect(t(OPT.immigration.papers)).not.toEqual(t(OPT.immigration.forms))
  })

  it('benefit worries come before applying', () => {
    const a = {
      needs: [OPT.needs.food, OPT.needs.immigration],
      benefits: [OPT.benefits.none],
      immigrationHelp: [OPT.immigration.benefits],
    }
    expect(steps(a, 'dshs-food-assistance')).toContain('You can ask an immigration legal provider')
    expect(ids(a).indexOf('immigration-support')).toBeLessThan(ids(a).indexOf('dshs-food-assistance'))
  })

  it('every card has steps and no card is duplicated', () => {
    const a = {
      needs: Object.values(OPT.needs),
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
