import type { VisualWalkthrough } from '../resourceData'

type VisualWalkthroughProps = {
  walkthrough: VisualWalkthrough
}

export function VisualWalkthrough({ walkthrough }: VisualWalkthroughProps) {
  return (
    <section className="walkthrough" aria-label={`${walkthrough.title} walkthrough`}>
      <h5>{walkthrough.title}</h5>
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
            <figure className="walkthrough-figure">
              {step.screenshotUrl ? (
                <img src={step.screenshotUrl} alt={step.screenshotAlt} loading="lazy" />
              ) : (
                <figcaption>
                  {step.screenshotAlt || 'We do not have a picture for this step yet.'}
                </figcaption>
              )}
            </figure>
            <p>{step.instruction}</p>
            {step.sourceUrl && (
              <p>
                <a href={step.sourceUrl} target="_blank" rel="noreferrer">
                  Open this page ↗
                </a>
              </p>
            )}
          </li>
        ))}
      </ol>
      {walkthrough.lastCapturedAt && (
        <p className="walkthrough-note">
          Pictures taken {walkthrough.lastCapturedAt}. The website may have changed.
        </p>
      )}
    </section>
  )
}
