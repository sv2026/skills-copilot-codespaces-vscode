import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { REVIEW_NEEDED_ITEMS, type ActionCard } from './resourceData'
import { VisualWalkthrough } from './components/VisualWalkthrough'
import {
  buildVisibleQuestions,
  getCardsForAnswers,
  type AnswerMap,
} from './recommendationLogic'

const PLAN_TITLE = 'Your next steps'
const RESULTS_INTRO =
  'You can begin seeking help even if you do not have every document. Start with the step that feels most urgent, and ask each agency what information or alternatives they can accept.'

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [showResults, setShowResults] = useState(false)
  const [showSafetyDetails, setShowSafetyDetails] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  const headingRef = useRef<HTMLHeadingElement>(null)

  const visibleQuestions = useMemo(() => buildVisibleQuestions(answers), [answers])
  const safeQuestionIndex = Math.min(currentQuestionIndex, Math.max(visibleQuestions.length - 1, 0))
  const question = visibleQuestions[safeQuestionIndex]
  const selectedOptions = answers[question?.id] ?? []

  // Answers to questions that are no longer shown must not influence the plan.
  const activeAnswers = useMemo(() => {
    const visibleIds = new Set(visibleQuestions.map((item) => item.id))
    return Object.fromEntries(
      Object.entries(answers).filter(([id]) => visibleIds.has(id)),
    ) as AnswerMap
  }, [answers, visibleQuestions])

  const planCards = useMemo(() => getCardsForAnswers(activeAnswers), [activeAnswers])
  const safeSlideIndex = Math.min(currentSlideIndex, Math.max(planCards.length - 1, 0))
  const activeCard: ActionCard | undefined = planCards[safeSlideIndex]

  useEffect(() => {
    headingRef.current?.focus()
  }, [safeQuestionIndex, safeSlideIndex, showResults])

  const onToggleOption = (option: string) => {
    setAnswers((previous) => {
      const previousForQuestion = previous[question.id] ?? []

      if (!question.multiSelect) {
        return { ...previous, [question.id]: [option] }
      }

      if (previousForQuestion.includes(option)) {
        return {
          ...previous,
          [question.id]: previousForQuestion.filter((item) => item !== option),
        }
      }

      return { ...previous, [question.id]: [...previousForQuestion, option] }
    })
  }

  const onTextChange = (value: string) => {
    setAnswers((previous) => {
      const nextValue = value.trim()
      return {
        ...previous,
        [question.id]: nextValue ? [nextValue] : [],
      }
    })
  }

  const onContinue = () => {
    if (!question) {
      setShowResults(true)
      return
    }

    if (question.type === 'text' && !selectedOptions.length && !question.optional) {
      return
    }

    if (safeQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(safeQuestionIndex + 1)
      return
    }

    setShowResults(true)
  }

  const onBack = () => {
    if (showResults) {
      setShowResults(false)
      return
    }

    setCurrentQuestionIndex(Math.max(safeQuestionIndex - 1, 0))
  }

  const onStartOver = () => {
    setAnswers({})
    setCurrentQuestionIndex(0)
    setShowResults(false)
    setCurrentSlideIndex(0)
    setShowSafetyDetails(false)
  }

  const canContinue =
    question?.type === 'text' ? true : selectedOptions.length > 0 || Boolean(question?.optional)
  const progress = visibleQuestions.length
    ? Math.round(((safeQuestionIndex + 1) / visibleQuestions.length) * 100)
    : 0

  return (
    <div className="app-shell">
      <header className="top-bar">
        <h1>Washington Support Steps</h1>
        <p>
          A calm, simple starting point for finding local support with housing, food, documents,
          school needs, and other next steps.
        </p>
        <div className="safety-actions">
          <button
            type="button"
            className="leave-button"
            onClick={() => window.location.replace('https://www.weather.gov/')}
          >
            Leave this page
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setShowSafetyDetails((value) => !value)}
          >
            Privacy and safety explanation
          </button>
        </div>
        {showSafetyDetails && (
          <div className="notice" role="note">
            <p>
              This button does not erase browser history. A shared device may still show visited
              pages. Consider using private browsing and clearing history when it is safe to do so.
            </p>
            <p>
              This tool does not store your answers in accounts, analytics, cookies, or local
              storage.
            </p>
          </div>
        )}
      </header>

      {!showResults ? (
        <main className="wizard-card">
          {question && (
            <>
              <div className="progress-row">
                <p>
                  Question {safeQuestionIndex + 1} of {visibleQuestions.length}
                </p>
                <p>{progress}%</p>
              </div>
              <div
                className="progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label="Question progress"
              >
                <span style={{ width: `${progress}%` }}></span>
              </div>
              <h2 ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
              {question.helperText && <p className="helper-text">{question.helperText}</p>}
              {question.type === 'text' ? (
                <div className="text-question">
                  <label className="sr-only" htmlFor={question.id}>
                    {question.prompt}
                  </label>
                  <input
                    id={question.id}
                    type="text"
                    value={selectedOptions[0] ?? ''}
                    placeholder={question.placeholder ?? 'Type here'}
                    onChange={(event) => onTextChange(event.target.value)}
                  />
                  {question.optional && <p className="optional-note">Optional</p>}
                </div>
              ) : (
                <ul className="option-list" role={question.multiSelect ? 'group' : 'radiogroup'} aria-label={question.prompt}>
                  {question.options?.map((option) => {
                    const isSelected = selectedOptions.includes(option)
                    return (
                      <li key={option}>
                        <button
                          type="button"
                          className={`option-button${isSelected ? ' selected' : ''}`}
                          role={question.multiSelect ? 'checkbox' : 'radio'}
                          aria-checked={isSelected}
                          onClick={() => onToggleOption(option)}
                        >
                          <span className="check" aria-hidden="true">
                            {isSelected ? '✓' : question.multiSelect ? '○' : '◯'}
                          </span>
                          <span>{option}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
              <div className="wizard-actions">
                <button
                  type="button"
                  onClick={onBack}
                  disabled={safeQuestionIndex === 0}
                  className="secondary"
                >
                  ← Back
                </button>
                <button type="button" onClick={onContinue} disabled={!canContinue}>
                  {safeQuestionIndex === visibleQuestions.length - 1
                    ? 'View my plan'
                    : 'Continue →'}
                </button>
              </div>
            </>
          )}
        </main>
      ) : (
        <main className="results-shell">
          <h2 ref={headingRef} tabIndex={-1}>{PLAN_TITLE}</h2>
          <p className="intro">{RESULTS_INTRO}</p>
          <p className="encouragement">
            You do not need to do everything in one day. Start with what feels most urgent and ask
            each agency what they can accept now.
          </p>

          {!activeCard && (
            <p className="notice-inline">
              We could not match any steps to your answers. Go back to the questions and choose at
              least one topic, or ask a local advocate or provider where to start.
            </p>
          )}

          {activeCard && (
            <section className="slide-card" aria-live="polite">
              <div className="slide-header">
                <p>
                  Step {safeSlideIndex + 1} of {planCards.length}
                </p>
                <p className={`category ${activeCard.category}`}>{activeCard.category.toUpperCase()}</p>
              </div>
              <h3>{activeCard.title}</h3>
              <p>
                <strong>Why this matters:</strong> {activeCard.whyThisMatters}
              </p>

              <h4>What to do next</h4>
              <ol className="action-steps">
                {activeCard.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              <h4>What to check before you act</h4>
              <div className="document-grid">
                <div className="info-card required">
                  <h5>Required to check</h5>
                  <ul>
                    {activeCard.usefulDocuments.required.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="info-card helpful">
                  <h5>Helpful to have</h5>
                  <ul>
                    {activeCard.usefulDocuments.helpful.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="info-card confirm">
                  <h5>Ask to confirm</h5>
                  <ul>
                    {activeCard.usefulDocuments.alternativesToConfirm.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="info-card caution">
                  <h5>Important caution</h5>
                  <ul>
                    {activeCard.usefulDocuments.unverified.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="supporting-message">
                <p>
                  <strong>Next action:</strong> {activeCard.missingDocsPlan}
                </p>
                <p>
                  <strong>Goal:</strong> {activeCard.endGoal}
                </p>
              </div>

              {activeCard.resources.length > 0 ? (
                <ul className="resource-list">
                  {activeCard.resources.map((resource) => (
                    <li key={`${activeCard.id}-${resource.label}-${resource.url ?? resource.phone ?? ''}`} className="resource-card">
                      <div className="resource-header">
                        <p className="resource-title">{resource.label}</p>
                        <span className="status-pill">
                          {resource.verificationStatus}
                        </span>
                      </div>
                      {resource.url ? (
                        <a href={resource.url} target="_blank" rel="noreferrer">
                          Open official resource
                        </a>
                      ) : (
                        <p className="resource-phone">{resource.phone}</p>
                      )}
                      <p className="resource-meta">Last verified: {resource.lastVerified}</p>
                      {resource.note && <p className="resource-note">{resource.note}</p>}
                      {resource.requiresWalkthrough && resource.walkthrough && (
                        <details className="summary-panel walkthrough-panel">
                          <summary>View visual walkthrough</summary>
                          <div className="summary-panel-content">
                            <VisualWalkthrough walkthrough={resource.walkthrough} />
                          </div>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="notice-inline">
                  No single official website applies to this follow-up step. Ask current providers
                  for trusted referral pathways.
                </p>
              )}
            </section>
          )}

          <div className="slide-controls">
            <button
              type="button"
              className="secondary"
              disabled={safeSlideIndex === 0}
              onClick={() => setCurrentSlideIndex(Math.max(safeSlideIndex - 1, 0))}
            >
              ← Previous slide
            </button>
            <button
              type="button"
              disabled={safeSlideIndex >= planCards.length - 1}
              onClick={() =>
                setCurrentSlideIndex(Math.min(safeSlideIndex + 1, planCards.length - 1))
              }
            >
              Next slide →
            </button>
          </div>

          <details className="summary-panel overview-panel" open>
            <summary>View section overview</summary>
            <div className="summary-panel-content">
              <section className="section-overview">
                <h3>Immediate</h3>
                <ul>
                  {planCards
                    .filter((card) => card.category === 'immediate')
                    .map((card) => (
                      <li key={card.id}>{card.title}</li>
                    ))}
                </ul>
                <h3>Next</h3>
                <ul>
                  {planCards
                    .filter((card) => card.category === 'next')
                    .map((card) => (
                      <li key={card.id}>{card.title}</li>
                    ))}
                </ul>
                <h3>Later</h3>
                <ul>
                  {planCards
                    .filter((card) => card.category === 'later')
                    .map((card) => (
                      <li key={card.id}>{card.title}</li>
                    ))}
                </ul>
              </section>
            </div>
          </details>

          <details className="summary-panel">
            <summary>Review my answers</summary>
            <div className="summary-panel-content">
              <section className="answers-review">
                <ul>
                  {visibleQuestions.map((item) => (
                    <li key={item.id}>
                      <p>{item.prompt}</p>
                      <p>{(answers[item.id]?.length ? answers[item.id] : ['No answer recorded']).join(', ')}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </details>

          <details className="summary-panel">
            <summary>Items still needing manual verification</summary>
            <div className="summary-panel-content">
              <section className="manual-review">
                <ul>
                  {REVIEW_NEEDED_ITEMS.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </div>
          </details>

          <div className="results-footer">
            <button type="button" className="secondary" onClick={onBack}>
              Back to questions
            </button>
            <button type="button" onClick={onStartOver}>
              Start over
            </button>
          </div>

          <p className="disclaimer">
            Requirements differ by program and may change. Always confirm current rules with the
            agency before submitting documents or paying fees.
          </p>
          <a
            href="https://github.com/sv2026/skills-copilot-codespaces-vscode/issues/new?title=Outdated%20resource%20information&body=Please%20describe%20which%20resource%20or%20requirement%20needs%20review.%20Do%20not%20include%20personal%20information."
            target="_blank"
            rel="noreferrer"
          >
            Report outdated information
          </a>
        </main>
      )}
    </div>
  )
}

export default App
