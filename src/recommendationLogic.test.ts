import { describe, expect, it } from 'vitest'
import { buildVisibleQuestions, getCardsForAnswers } from './recommendationLogic'

const ids = (answers: Record<string, string[]>) => getCardsForAnswers(answers).map((card) => card.id)

describe('buildVisibleQuestions', () => {
  it('starts with only the topic question', () => {
    expect(buildVisibleQuestions({}).map((q) => q.id)).toEqual(['helpTopics', 'locationCounty'])
  })

  it('shows housing urgency only when housing is selected', () => {
    const answers = { helpTopics: ['Housing assistance'] }
    expect(buildVisibleQuestions(answers).map((q) => q.id)).toContain('housingUrgency')
  })
})

describe('getCardsForAnswers', () => {
  it('returns nothing for no answers', () => {
    expect(ids({})).toEqual([])
  })

  it('orders immediate cards before later cards', () => {
    const result = ids({ helpTopics: ['Finding a safe place to stay'] })
    expect(result.indexOf('shelter-intake')).toBeLessThan(result.indexOf('housing-follow-up'))
  })

  it('ignores children document answers when no children are involved', () => {
    expect(ids({ childrenSupport: ['No'], childrenDocs: ['I have neither'] })).not.toContain(
      'birth-records',
    )
  })

  it('adds birth records and SSA help when children documents are missing', () => {
    const result = ids({ childrenSupport: ['Yes'], childrenDocs: ['I have neither'] })
    expect(result).toEqual(expect.arrayContaining(['birth-records', 'ssa-cards']))
  })
})
