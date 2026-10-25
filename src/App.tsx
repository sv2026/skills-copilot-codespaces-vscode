import { useMemo, useState } from 'react'
import './App.css'
import { ACTION_CARDS, REVIEW_NEEDED_ITEMS, type ActionCard } from './resourceData'

type Question = {
  id: string
  prompt: string
  helperText?: string
  multiSelect: boolean
  options: string[]
}

const QUESTIONS: Question[] = [
  {
    id: 'helpTopics',
    prompt: 'Which things would you like help with first?',
    multiSelect: true,
    options: [
      'Finding safe housing',
      'Getting food assistance',
      'Applying for cash assistance',
      'Keeping my children in school',
      'Replacing missing identity documents',
    ],
  },
  {
    id: 'location',
    prompt: 'Which area of Washington are you currently in?',
    multiSelect: false,
    options: [
      'East King County',
      'Seattle or another part of King County',
      'Snohomish County',
      'Somewhere else in Washington',
    ],
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
    id: 'housingUrgency',
    prompt: 'When do you need a safe place to stay?',
    multiSelect: false,
    options: ['Tonight', 'Within the next few days', 'I am safe for now but need long-term housing'],
  },
  {
    id: 'schoolNeeds',
    prompt: 'What would help your children continue their education?',
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
    id: 'finances',
    prompt: 'Which statement best describes your current finances?',
    helperText: 'You do not need to share exact account balances.',
    multiSelect: false,
    options: [
      'I have almost no money available',
      'I have some money but cannot cover my basic needs',
      'I have income but need help with housing costs',
      'I prefer not to answer',
    ],
  },
  {
    id: 'contactSafety',
    prompt: 'Could someone who has harmed you access your phone, email, or browsing activity?',
    helperText:
      'You can still view general resources without entering contact details. This prototype does not ask for email, phone number, shelter name, or address.',
    multiSelect: false,
    options: [
      'My device and contact methods are private',
      'Someone else may be able to access them',
      "I'm not sure",
      'I prefer not to answer',
    ],
  },
]

const PLAN_TITLE = 'Your next steps: Housing, food, and school support'
const RESULTS_INTRO =
  'You can begin seeking help even if you do not have all your documents. You do not need to solve everything at once. Start with the most urgent needs, and ask each agency what alternatives are available when documents are missing.'

type AnswerMap = Record<string, string[]>

const getCardsForAnswers = (answers: AnswerMap) => {
  const selected = new Set<string>()
  const helpTopics = answers.helpTopics ?? []
  const schoolNeeds = answers.schoolNeeds ?? []
  const housingUrgency = answers.housingUrgency?.[0]
  const childrenDocs = answers.childrenDocs?.[0]
  const userIdDocs = answers.userIdDocs?.[0]

  if (
    helpTopics.includes('Finding safe housing') ||
    housingUrgency === 'Tonight' ||
    housingUrgency === 'Within the next few days' ||
    housingUrgency === undefined
  ) {
    selected.add('shelter-intake')
    selected.add('housing-follow-up')
  }

  if (
    helpTopics.includes('Getting food assistance') ||
    helpTopics.includes('Applying for cash assistance') ||
    answers.finances?.[0] !== 'I prefer not to answer'
  ) {
    selected.add('dshs-benefits')
  }

  if (
    helpTopics.includes('Keeping my children in school') ||
    schoolNeeds.length > 0 ||
    schoolNeeds.includes("I'm not sure yet")
  ) {
    selected.add('school-liaison')
  }

  if (
    helpTopics.includes('Replacing missing identity documents') ||
    userIdDocs === 'No identification documents' ||
    userIdDocs === "I'm not sure" ||
    childrenDocs === 'I have neither' ||
    childrenDocs === "I'm not sure"
  ) {
    selected.add('birth-records')
    selected.add('ssa-cards')
  }

  if (selected.size === 0) {
    selected.add('dshs-benefits')
    selected.add('school-liaison')
    selected.add('birth-records')
  }

  return ACTION_CARDS.filter((card) => selected.has(card.id)).sort((a, b) => {
    const categoryOrder = { immediate: 0, next: 1, later: 2 }
    return categoryOrder[a.category] - categoryOrder[b.category]
  })
}

const renderResourceStatus = (status: 'Verified' | 'Needs review') =>
  status === 'Verified' ? 'Verified' : 'Needs review'

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [showResults, setShowResults] = useState(false)
  const [showSafetyDetails, setShowSafetyDetails] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({})

  const question = QUESTIONS[currentQuestionIndex]
  const selectedOptions = answers[question.id] ?? []

  const planCards = useMemo(() => getCardsForAnswers(answers), [answers])
  const activeCard: ActionCard | undefined = planCards[currentSlideIndex]

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

  const onContinue = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex((index) => index + 1)
      return
    }

    setShowResults(true)
  }

  const onBack = () => {
    if (showResults) {
      setShowResults(false)
      return
    }

    setCurrentQuestionIndex((index) => Math.max(index - 1, 0))
  }

  const onStartOver = () => {
    setAnswers({})
    setCompletedActions({})
    setCurrentQuestionIndex(0)
    setShowResults(false)
    setCurrentSlideIndex(0)
    setShowSafetyDetails(false)
  }

  const onToggleCompleted = (actionId: string) => {
    setCompletedActions((previous) => ({ ...previous, [actionId]: !previous[actionId] }))
  }

  const canContinue = selectedOptions.length > 0
  const progress = Math.round(((currentQuestionIndex + 1) / QUESTIONS.length) * 100)

  return (
    <div className="app-shell">
      <header className="top-bar">
        <h1>Washington Support Steps Prototype</h1>
        <p>
          This is a navigation prototype. It is not a government agency, legal service, or
          benefits decision-maker.
        </p>
        <div className="safety-actions">
          <button
            type="button"
            className="leave-button"
            onClick={() => window.location.assign('https://www.weather.gov/')}
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
          <div className="progress-row">
            <p>
              Question {currentQuestionIndex + 1} of {QUESTIONS.length}
            </p>
            <p>{progress}%</p>
          </div>
          <div className="progress-track" aria-hidden="true">
            <span style={{ width: `${progress}%` }}></span>
          </div>
          <h2>{question.prompt}</h2>
          {question.helperText && <p className="helper-text">{question.helperText}</p>}
          <ul className="option-list">
            {question.options.map((option) => {
              const isSelected = selectedOptions.includes(option)
              return (
                <li key={option}>
                  <button
                    type="button"
                    className={`option-button${isSelected ? ' selected' : ''}`}
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
          <div className="wizard-actions">
            <button
              type="button"
              onClick={onBack}
              disabled={currentQuestionIndex === 0}
              className="secondary"
            >
              Back
            </button>
            <button type="button" onClick={onContinue} disabled={!canContinue}>
              {currentQuestionIndex === QUESTIONS.length - 1 ? 'View my plan' : 'Continue'}
            </button>
          </div>
        </main>
      ) : (
        <main className="results-shell">
          <h2>{PLAN_TITLE}</h2>
          <p className="intro">{RESULTS_INTRO}</p>
          <p className="encouragement">
            You do not need to do everything in one day. These resources are intended to remain
            available over time.
          </p>
          <section className="section-overview">
            <h3>Section A: Do now — immediate needs</h3>
            <ul>
              {planCards
                .filter((card) => card.category === 'immediate')
                .map((card) => (
                  <li key={card.id}>{card.title}</li>
                ))}
            </ul>
            <h3>Section B: Do next — recover documents</h3>
            <ul>
              {planCards
                .filter((card) => card.category === 'next')
                .map((card) => (
                  <li key={card.id}>{card.title}</li>
                ))}
            </ul>
            <h3>Section C: Once immediate needs are addressed</h3>
            <ul>
              {planCards
                .filter((card) => card.category === 'later')
                .map((card) => (
                  <li key={card.id}>{card.title}</li>
                ))}
            </ul>
          </section>

          {activeCard && (
            <section className="slide-card" aria-live="polite">
              <div className="slide-header">
                <p>
                  Slide {currentSlideIndex + 1} of {planCards.length}
                </p>
                <p className={`category ${activeCard.category}`}>{activeCard.category.toUpperCase()}</p>
              </div>
              <h3>{activeCard.title}</h3>
              <p>
                <strong>Why this step matters:</strong> {activeCard.whyThisMatters}
              </p>

              <h4>What to do next</h4>
              <ol>
                {activeCard.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              <h4>What might be useful</h4>
              <div className="document-grid">
                <div>
                  <h5>Required documents</h5>
                  <ul>
                    {activeCard.usefulDocuments.required.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5>Alternatives to confirm</h5>
                  <ul>
                    {activeCard.usefulDocuments.alternativesToConfirm.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5>Helpful information</h5>
                  <ul>
                    {activeCard.usefulDocuments.helpful.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5>Needs verification</h5>
                  <ul>
                    {activeCard.usefulDocuments.unverified.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <p>
                <strong>If documents are missing:</strong> {activeCard.missingDocsPlan}
              </p>
              <p>
                <strong>{activeCard.endGoal}</strong>
              </p>

              {activeCard.resources.length > 0 ? (
                <ul className="resource-list">
                  {activeCard.resources.map((resource) => (
                    <li key={`${resource.label}-${resource.url ?? resource.phone ?? ''}`}>
                      <p className="resource-title">{resource.label}</p>
                      {resource.url ? (
                        <a href={resource.url} target="_blank" rel="noreferrer">
                          Open official resource
                        </a>
                      ) : (
                        <p>{resource.phone}</p>
                      )}
                      <p>
                        Status: <strong>{renderResourceStatus(resource.verificationStatus)}</strong> ·
                        Last verified: {resource.lastVerified}
                      </p>
                      {resource.note && <p>{resource.note}</p>}
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
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex((index) => Math.max(index - 1, 0))}
            >
              Previous slide
            </button>
            <button
              type="button"
              disabled={currentSlideIndex >= planCards.length - 1}
              onClick={() =>
                setCurrentSlideIndex((index) => Math.min(index + 1, planCards.length - 1))
              }
            >
              Next slide
            </button>
          </div>

          <section className="checklist">
            <h3>Checklist</h3>
            <ul>
              {planCards.map((card) => (
                <li key={card.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(completedActions[card.id])}
                      onChange={() => onToggleCompleted(card.id)}
                    />
                    <span>{card.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="answers-review">
            <h3>Review my answers</h3>
            <ul>
              {QUESTIONS.map((item) => (
                <li key={item.id}>
                  <p>{item.prompt}</p>
                  <p>{(answers[item.id] ?? ['No answer recorded']).join(', ')}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="manual-review">
            <h3>Items still needing manual verification</h3>
            <ul>
              {REVIEW_NEEDED_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

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
