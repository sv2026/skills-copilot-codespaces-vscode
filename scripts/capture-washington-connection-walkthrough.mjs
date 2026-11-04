import { chromium } from 'playwright'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDir = path.resolve(__dirname, '../public')
const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'washington-connection-walkthrough-'))
const removeProfile = () => fs.rmSync(profileDir, { recursive: true, force: true })
process.on('exit', removeProfile)
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => process.exit(1))
}
const applicationUrl = 'https://www.washingtonconnection.org/eapplication/home.go?action=Introduction&source='

const context = await chromium.launchPersistentContext(profileDir, {
  channel: 'chrome',
  headless: false,
  viewport: { width: 1440, height: 2200 },
})

const page = context.pages()[0] || await context.newPage()

const waitForPage = async () => {
  await page.waitForLoadState('networkidle').catch(() => undefined)
}

const clickNext = async () => {
  await page.locator('input[name=next]:visible').click()
  await waitForPage()
}

await page.goto(applicationUrl, { waitUntil: 'networkidle', timeout: 60000 })
const dialog = page.getByRole('dialog')
if (await dialog.isVisible().catch(() => false)) {
  await dialog.getByRole('button', { name: 'Close', exact: true }).click()
}
await page.getByRole('heading', { name: 'Introduction', exact: true }).waitFor({ state: 'visible' })
await page.screenshot({
  path: path.join(publicDir, 'washington-connection-application-introduction.png'),
  fullPage: true,
})
console.log('Captured washington-connection-application-introduction.png')

await clickNext()
await page.getByRole('heading', { name: 'About this Application', exact: true }).waitFor({ state: 'visible' })
await page.screenshot({
  path: path.join(publicDir, 'washington-connection-about-application.png'),
  fullPage: true,
})
console.log('Captured washington-connection-about-application.png')

await clickNext()
await page.getByRole('heading', { name: 'ZIP Code', exact: true }).waitFor({ state: 'visible' })
await page.locator('#zipCode').fill('98101')
await clickNext()
await page.getByRole('heading', { name: 'Your Needs', exact: true }).waitFor({ state: 'visible' })
await page.getByLabel('Basic Food', { exact: true }).check()
await page.screenshot({
  path: path.join(publicDir, 'washington-connection-your-needs-basic-food.png'),
  fullPage: true,
})
console.log('Captured washington-connection-your-needs-basic-food.png')

await clickNext()
await page.getByRole('heading', { name: 'About You', exact: true }).waitFor({ state: 'visible' })
await page.locator('#FirstName').fill('John')
await page.locator('#MiddleName').fill('Q')
await page.locator('#LastName').fill('Done')
await page.locator('#includeBenefit1').check()
await page.locator('#mm').fill('01')
await page.locator('#dd').fill('01')
await page.locator('#yy').fill('2000')
await page.locator('#maritalStatus').selectOption({ label: 'Never Married' })
await page.locator('#sexCd1').check()
await clickNext()
await page.waitForURL(/address\.go/, { timeout: 60000 })
console.log('Synthetic navigation reached Address; no address screenshot captured.')
await page.getByRole('heading', { name: 'Your Address', exact: true }).waitFor({ state: 'visible' })
await page.locator('[name=homeAddrLine1]:visible').first().fill('123 Main St')
await page.locator('[name=homeCityName]:visible').first().fill('Seattle')
await page.locator('select[name=HomeStateName]:visible').first().selectOption({ label: 'Washington' })
await page.locator('[name=homeZipCd1]:visible').first().fill('98101')
await page.locator('#MailingInd:visible').check()
await page.locator('input[name=next]:visible').click()
await waitForPage()
console.log('Synthetic address entered and advanced; no address screenshot captured.')
console.log('Temporary session profile (deleted on exit):', profileDir)

await new Promise(() => {})
