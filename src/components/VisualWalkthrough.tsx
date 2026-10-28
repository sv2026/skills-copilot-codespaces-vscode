import type { VisualWalkthrough } from '../resourceData'

type VisualWalkthroughProps = {
  walkthrough: VisualWalkthrough
}

export function VisualWalkthrough({ walkthrough }: VisualWalkthroughProps) {
  return (
    <section className="walkthrough" aria-label={`${walkthrough.title} walkthrough`}>
      <h5>{walkthrough.title}</h5>
      {walkthrough.serviceName && <p>Service: {walkthrough.serviceName}</p>}
      {walkthrough.summary && <p className="walkthrough-summary">{walkthrough.summary}</p>}
      <p>
        Official website:{' '}
        <a href={walkthrough.officialWebsiteUrl} target="_blank" rel="noreferrer">
          Open source website
        </a>
      </p>
      <p>
        Walkthrough status: <strong>{walkthrough.status}</strong>
        {walkthrough.lastCapturedAt ? ` · Last screenshot capture: ${walkthrough.lastCapturedAt}` : ''}
      </p>
      {walkthrough.mayBeOutdated && (
        <p className="walkthrough-warning">
          This walkthrough may be outdated. {walkthrough.outdatedReason}
        </p>
      )}
      <ol className="walkthrough-step-list">
        {walkthrough.steps.map((step, index) => (
          <li key={step.id} className="walkthrough-step">
            <h6>
              Step {index + 1}: {step.heading}
            </h6>
            <p className="walkthrough-step-status">
              Verification: <strong>{step.verificationStatus}</strong>
            </p>
            <p>{step.instruction}</p>
            {step.sourceUrl && (
              <p>
                Source:{' '}
                <a href={step.sourceUrl} target="_blank" rel="noreferrer">
                  Official page
                </a>
              </p>
            )}
            <figure className="walkthrough-figure">
              {step.screenshotUrl ? (
                <img src={step.screenshotUrl} alt={step.screenshotAlt} loading="lazy" />
              ) : (
                <figcaption>
                  {step.screenshotAlt || 'No verified screenshot has been captured for this step yet.'}
                </figcaption>
              )}
            </figure>
            <ul>
              {step.annotations.map((annotation) => (
                <li key={`${step.id}-${annotation.kind}-${annotation.label}`}>
                  {annotation.kind === 'arrow' ? 'Arrow' : 'Highlight'}: {annotation.label}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <div className="walkthrough-ai-notes">
        <p>
          <strong>AI generation setup required:</strong>
        </p>
        <ul>
          {walkthrough.aiSupportNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
