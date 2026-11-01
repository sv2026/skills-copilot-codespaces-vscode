import { chromium } from 'playwright'
import readline from 'node:readline'

const profileDir = '/tmp/washington-connection-walkthrough-session'
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
  const saveStandardizedAddress = page.getByRole('button', { name: 'Save', exact: true })
  if (await saveStandardizedAddress.isVisible().catch(() => false)) {
    await saveStandardizedAddress.click()
    await waitForPage()
    console.log('SAVED_STANDARDIZED_ADDRESS=true')
  }
  await page.locator('input[name=next]:visible').click()
  await waitForPage()
}

const prepareSession = async () => {
  await page.goto(applicationUrl, { waitUntil: 'networkidle', timeout: 60000 })
  const dialog = page.getByRole('dialog')
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole('button', { name: 'Close', exact: true }).click()
  }
  await clickNext()
  await clickNext()
  await page.locator('#zipCode').fill('98101')
  await clickNext()
  await page.getByLabel('Basic Food', { exact: true }).check()
  await clickNext()
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
  await page.locator('[name=homeAddrLine1]:visible').first().fill('123 Main St')
  await page.locator('[name=homeCityName]:visible').first().fill('Seattle')
  await page.locator('select[name=HomeStateName]:visible').first().selectOption({ label: 'Washington' })
  await page.locator('[name=homeZipCd1]:visible').first().fill('98101')
  await page.locator('#MailingInd:visible').check()
  await clickNext()
}

const report = async () => {
  console.log('URL=' + page.url())
  console.log('TITLE=' + await page.title())
  console.log('BODY=' + (await page.locator('body').innerText()).slice(0, 5000))
}

await prepareSession()
console.log('SESSION_READY=true')
await report()
console.log('COMMANDS=continue | screenshot <filename> | status | quit')

const input = readline.createInterface({ input: process.stdin, terminal: false })
for await (const line of input) {
  const [command, argument] = line.trim().split(/\s+/, 2)
  if (command === 'continue') {
    await clickNext()
    await report()
  } else if (command === 'screenshot' && argument) {
    await page.screenshot({ path: `public/${argument}`, fullPage: true })
    console.log('SCREENSHOT=' + argument)
  } else if (command === 'status') {
    await report()
  } else if (command === 'quit') {
    await context.close()
    break
  } else {
    console.log('UNKNOWN_COMMAND=' + (command || ''))
  }
}
