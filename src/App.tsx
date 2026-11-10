import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { REVIEW_NEEDED_ITEMS, type ActionCard } from './resourceData'
import { VisualWalkthrough } from './components/VisualWalkthrough'
import {
  buildVisibleQuestions,
  getCardsForAnswers,
  type AnswerMap,
} from './recommendationLogic'
import { OPT } from './options'

const DOCUMENT_BOXES = [
  { key: 'required', title: 'Have these ready', className: 'required' },
  { key: 'helpful', title: 'Nice to have', className: 'helpful' },
  { key: 'alternativesToConfirm', title: 'Ask about these', className: 'confirm' },
  { key: 'unverified', title: 'Please remember', className: 'caution' },
] as const

const PLAN_TITLE = 'Your plan'
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
  const selectedOptions = (answers[question?.id] ?? []).filter((option) => question?.options?.includes(option))

  // Answers to questions that are no longer shown must not influence the plan.
  const activeAnswers = useMemo(() => {
    return Object.fromEntries(
      visibleQuestions.map((item) => [
        item.id,
        (answers[item.id] ?? []).filter((option) => item.options?.includes(option)),
      ]),
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
      const previousForQuestion = (previous[question.id] ?? []).filter((item) => question.options?.includes(item))

      if (!question.multiSelect) {
        return { ...previous, [question.id]: [option] }
      }

      const exclusive = question.id === 'docs' ? OPT.docs.none
        : question.id === 'benefits' ? OPT.benefits.none : undefined
      if (option === exclusive) {
        return { ...previous, [question.id]: previousForQuestion.includes(option) ? [] : [option] }
      }

      if (previousForQuestion.includes(option)) {
        return {
          ...previous,
          [question.id]: previousForQuestion.filter((item) => item !== option),
        }
      }

      return { ...previous, [question.id]: [...previousForQuestion.filter((item) => item !== exclusive), option] }
    })
  }

  const onContinue = () => {
    if (!question) {
      setShowResults(true)
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

  const canContinue = selectedOptions.length > 0
  return (
    <div className="app-shell">
      <header className="top-bar">
        <h1>Washington Support Steps</h1>
        <p>
          Find help with housing, food, papers, school, and immigration in Western Washington.
        </p>
        <div className="safety-actions">
          <button
            type="button"
            className="leave-button"
            onClick={() => window.location.replace('https://www.weather.gov/')}
          >
            Leave this page now
          </button>
          <button
            type="button"
            className="link-button"
            onClick={() => setShowSafetyDetails((value) => !value)}
          >
            Privacy and safety
          </button>
        </div>
        {showSafetyDetails && (
          <div className="notice" role="note">
            <p>
              The leave button does not erase your history. Someone using the same device may still
              see the pages you visited. A private window can help.
            </p>
            <p>
              We do not save your answers. We do not use accounts or tracking.
            </p>
            <p>Other websites may ask for your personal information. They have their own privacy rules.</p>
          </div>
        )}
      </header>

      {!showResults ? (
        <main className="wizard-card">
          {question && (
            <>
              <div className="progress-row">
                <p>Question {safeQuestionIndex + 1} of {visibleQuestions.length}</p>
              </div>
              <h2 ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
              {question.helperText && <p className="helper-text">{question.helperText}</p>}
                <ul className="option-list" role={question.multiSelect ? 'group' : 'radiogroup'} aria-label={question.prompt}>
                  {question.options?.map((option) => {
                    const isSelected = selectedOptions.includes(option)
                    return (
                      <li key={option}>
                        <label
                          className={`option-button${isSelected ? ' selected' : ''}`}
                        >
                          <input
                            className="check"
                            type={question.multiSelect ? 'checkbox' : 'radio'}
                            name={question.id}
                            checked={isSelected}
                            onChange={() => onToggleOption(option)}
                          />
                          <span>{option}</span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
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
                    ? 'See my plan'
                    : 'Next →'}
                </button>
              </div>
            </>
          )}
        </main>
      ) : (
        <main className="results-shell">
          <h2 ref={headingRef} tabIndex={-1}>{PLAN_TITLE}</h2>
          <p className="intro">Only contact people in a way that is safe for you.</p>

          {!activeCard && (
            <p className="notice-inline">
              We could not find steps for your answers. Go back and pick at least one topic. You can also ask a local helper where to start.
            </p>
          )}

          {activeCard && (
            <section className="slide-card" aria-live="polite">
              <div className="slide-header">
                <p>
                  Part {safeSlideIndex + 1} of {planCards.length}
                </p>
                <p className={`category ${activeCard.category}`}>{activeCard.category.toUpperCase()}</p>
              </div>
              <h3>{activeCard.title}</h3>
              {activeCard.whyThisMatters && (
                <p>
                  <strong>Why this matters:</strong> {activeCard.whyThisMatters}
                </p>
              )}

              <h4>What to do</h4>
              <ol className="action-steps">
                {activeCard.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              {Object.values(activeCard.usefulDocuments).some((list) => list.length > 0) && (
                <>
                  <h4>Good to know</h4>
                  <div className="document-grid">
                    {DOCUMENT_BOXES.map(({ key, title, className }) =>
                      activeCard.usefulDocuments[key].length > 0 ? (
                        <div key={key} className={`info-card ${className}`}>
                          <h5>{title}</h5>
                          <ul>
                            {activeCard.usefulDocuments[key].map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null,
                    )}
                  </div>
                </>
              )}

              {(activeCard.missingDocsPlan || activeCard.endGoal) && (
                <div className="supporting-message">
                  {activeCard.missingDocsPlan && (
                    <p>
                      <strong>Next:</strong> {activeCard.missingDocsPlan}
                    </p>
                  )}
                  {activeCard.endGoal && (
                    <p>
                      <strong>Goal:</strong> {activeCard.endGoal}
                    </p>
                  )}
                </div>
              )}

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
                      {resource.url && (
                        <a href={resource.url} target="_blank" rel="noreferrer">
                          Open {resource.label} <span aria-hidden="true">↗</span>
                        </a>
                      )}
                      {resource.phone && <p className="resource-phone">{resource.phone}</p>}
                      <p className="resource-meta">
                        {resource.verificationStatus === 'Verified' ? 'Last checked' : 'Last looked at'}: {resource.lastVerified}
                      </p>
                      {resource.note && <p className="resource-note">{resource.note}</p>}
                      {resource.requiresWalkthrough && resource.walkthrough && (
                        <details className="summary-panel walkthrough-panel">
                          <summary>See pictures of each step</summary>
                          <div className="summary-panel-content">
                            <VisualWalkthrough walkthrough={resource.walkthrough} />
                          </div>
                        </details>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                null
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
              ← Back
            </button>
            <button
              type="button"
              disabled={safeSlideIndex >= planCards.length - 1}
              onClick={() =>
                setCurrentSlideIndex(Math.min(safeSlideIndex + 1, planCards.length - 1))
              }
            >
              Next →
            </button>
          </div>

          <details className="summary-panel overview-panel">
            <summary>See all parts of my plan</summary>
            <div className="summary-panel-content">
              <section className="section-overview">
                <ul>
                  {planCards.map((card, index) => (
                    <li key={card.id}>
                      <button type="button" className="overview-link" onClick={() => setCurrentSlideIndex(index)}>
                        {index + 1}. {card.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </details>

          <details className="summary-panel">
            <summary>See my answers</summary>
            <div className="summary-panel-content">
              <section className="answers-review">
                <ul>
                  {visibleQuestions.map((item) => (
                    <li key={item.id}>
                      <p>{item.prompt}</p>
                      <p>{(activeAnswers[item.id]?.length ? activeAnswers[item.id] : ['No answer']).join(', ')}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </details>

          <details className="summary-panel">
            <summary>Things we are still checking</summary>
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
              Change my answers
            </button>
            <button type="button" onClick={onStartOver}>
              Start over
            </button>
          </div>

          <p className="disclaimer">
            Rules and contact details can change. Check them before you share information or pay money. Some picture guides are still being checked.
          </p>
          <a
            href="https://github.com/sv2026/skills-copilot-codespaces-vscode/issues/new?title=Outdated%20resource%20information&body=Please%20describe%20which%20resource%20or%20requirement%20needs%20review.%20Do%20not%20include%20personal%20information."
            target="_blank"
            rel="noreferrer"
          >
            Tell us if something is wrong
          </a>
        </main>
      )}
    </div>
  )
}

export default App
