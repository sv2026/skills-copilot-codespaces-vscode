import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '../public')

const pageTargets = [
  {
    name: 'wa-doh-birth-record-landing',
    url: 'https://doh.wa.gov/licenses-permits-and-certificates/vital-records/ordering-vital-record/birth-record',
    viewport: { width: 1440, height: 2200 },
    waitForSelectors: ['text=Who Qualifies?', 'text=What Do I Need to Provide?'],
  },
  {
    name: 'vitalchek-public-homepage',
    url: 'https://www.vitalchek.com/',
    viewport: { width: 1440, height: 1800 },
    waitForSelectors: ['text=Order Vital Records Online', 'text=Birth Certificates'],
  },
]

const browser = await chromium.launch({ headless: true })
try {
  for (const target of pageTargets) {
    const page = await browser.newPage({ viewport: target.viewport })
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    for (const selector of target.waitForSelectors) {
      const locator = page.locator(selector)
      if ((await locator.count()) > 0) {
        await locator.first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => undefined)
      }
    }
    await page.screenshot({
      path: path.join(publicDir, `${target.name}.png`),
      fullPage: true,
    })
    console.log(`Captured ${target.name}.png`)
    await page.close()
  }
} finally {
  await browser.close()
}
