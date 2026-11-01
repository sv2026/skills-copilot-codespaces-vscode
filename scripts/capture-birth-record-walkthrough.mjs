import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WALKTHROUGH_CAPTURE_CONFIGS } from './walkthrough-capture-config.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '../public')

const assertSafeCapturePlan = (plan) => {
  if (
    !plan.safety.publicPagesOnly ||
    plan.safety.enterRealPersonalInformation ||
    plan.safety.submitForms ||
    plan.safety.createAccounts ||
    plan.safety.uploadDocuments ||
    plan.safety.completeIdentityVerification
  ) {
    throw new Error(`Unsafe capture plan rejected: ${plan.resourceId}`)
  }
}

const browser = await chromium.launch({ headless: true })
try {
  for (const plan of WALKTHROUGH_CAPTURE_CONFIGS) {
    assertSafeCapturePlan(plan)

    for (const checkpoint of plan.checkpoints) {
      const page = await browser.newPage({ viewport: plan.viewport })
      try {
        await page.goto(checkpoint.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
        for (const text of checkpoint.waitForText) {
          await page.getByText(text, { exact: false }).first().waitFor({
            state: 'visible',
            timeout: 30000,
          })
        }
        await page.screenshot({
          path: path.join(publicDir, checkpoint.filename),
          fullPage: true,
        })
        console.log(`Captured ${checkpoint.filename} for ${plan.resourceId}`)
      } finally {
        await page.close()
      }
    }
  }
} finally {
  await browser.close()
}
