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
  { key: 'required', title: 'Bring or have ready', className: 'required' },
  { key: 'helpful', title: 'Helpful to have', className: 'helpful' },
  { key: 'alternativesToConfirm', title: 'Ask to confirm', className: 'confirm' },
  { key: 'unverified', title: 'Keep in mind', className: 'caution' },
] as const

const PLAN_TITLE = 'Your next steps'
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
          Housing, food, documents, school and immigration resources in Western Washington.
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
            Privacy &amp; safety
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
            <p>Other websites may ask for personal information and have their own privacy policies.</p>
          </div>
        )}
      </header>

      {!showResults ? (
        <main className="wizard-card">
          {question && (
            <>
              <div className="progress-row">
                <p>Question {safeQuestionIndex + 1}</p>
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
          <p className="intro">Use a contact method only if it is safe for you.</p>

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
              {activeCard.whyThisMatters && (
                <p>
                  <strong>Why this matters:</strong> {activeCard.whyThisMatters}
                </p>
              )}

              <h4>Steps</h4>
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
                      <strong>Next action:</strong> {activeCard.missingDocsPlan}
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
                        {resource.verificationStatus === 'Verified' ? 'Last verified' : 'Source checked'}: {resource.lastVerified}
                      </p>
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

          <details className="summary-panel overview-panel">
            <summary>See all steps</summary>
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
            <summary>Review my answers</summary>
            <div className="summary-panel-content">
              <section className="answers-review">
                <ul>
                  {visibleQuestions.map((item) => (
                    <li key={item.id}>
                      <p>{item.prompt}</p>
                      <p>{(activeAnswers[item.id]?.length ? activeAnswers[item.id] : ['No answer recorded']).join(', ')}</p>
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
            Resources and requirements can change. Confirm details before sharing information or paying fees.
            Some visual guides are still being reviewed.
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
