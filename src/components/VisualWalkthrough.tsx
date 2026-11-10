import type { VisualWalkthrough } from '../resourceData'

type VisualWalkthroughProps = {
  walkthrough: VisualWalkthrough
}

export function VisualWalkthrough({ walkthrough }: VisualWalkthroughProps) {
  return (
    <section className="walkthrough" aria-label={`${walkthrough.title} walkthrough`}>
      <h5>{walkthrough.title}</h5>
      <p className="walkthrough-summary">
        <strong>Goal:</strong> {walkthrough.userGoal}
      </p>
      {walkthrough.serviceName && <p>Website: {walkthrough.serviceName}</p>}
      {walkthrough.summary && <p>{walkthrough.summary}</p>}
      <p>
        Official website:{' '}
        <a href={walkthrough.officialWebsiteUrl} target="_blank" rel="noreferrer">
          Open the official website
        </a>
      </p>
      <p>
        Status: <strong>{walkthrough.status}</strong>
        {walkthrough.lastCapturedAt ? ` · Pictures taken: ${walkthrough.lastCapturedAt}` : ''}
      </p>
      {walkthrough.mayBeOutdated && (
        <p className="walkthrough-warning">
          These pictures may be old. {walkthrough.outdatedReason}
        </p>
      )}
      {walkthrough.beforeYouStart && (
        <div className="walkthrough-prep">
          <h6>Have these ready before you start</h6>
          <ul>
            {walkthrough.beforeYouStart.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <ol className="walkthrough-step-list">
        {walkthrough.steps.map((step, index) => (
          <li key={step.id} className="walkthrough-step">
            <h6>
              Step {index + 1}: {step.heading}
            </h6>
            <p className="walkthrough-step-status">
              Checked: <strong>{step.verificationStatus}</strong>
            </p>
            {step.screenshotEvidence && (
              <p className="walkthrough-step-status">
                Picture taken: {step.screenshotEvidence.capturedAt} · Checked by a person: {step.screenshotEvidence.reviewedByHuman ? 'Yes' : 'No'}
              </p>
            )}
            <p>{step.instruction}</p>
            {step.sourceUrl && (
              <p>
                Page:{' '}
                <a href={step.sourceUrl} target="_blank" rel="noreferrer">
                  Open the official page
                </a>
              </p>
            )}
            <figure className="walkthrough-figure">
              {step.screenshotUrl ? (
                <img src={step.screenshotUrl} alt={step.screenshotAlt} loading="lazy" />
              ) : (
                <figcaption>
                  {step.screenshotAlt || 'We do not have a picture for this step yet.'}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ol>
      <div className="walkthrough-ai-notes">
        <p>
          <strong>About these pictures:</strong>
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
