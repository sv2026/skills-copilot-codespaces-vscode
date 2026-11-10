import { chromium } from 'playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Public start page only. Never types data, submits, or reaches identity verification.
const START_URL = 'https://secure.ssa.gov/ossnap/public/'
const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public')

const browser = await chromium.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
})
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(START_URL, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: path.join(outDir, 'ssa-card-start-raw.png'), fullPage: true })
  await page.getByText('Document requirements', { exact: true }).first().click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: path.join(outDir, 'ssa-card-documents-raw.png'), fullPage: true })
  console.log(await page.locator('body').innerText())
} finally {
  await browser.close()
}
