import { chromium } from 'playwright'

const context = await chromium.launch({ headless: true, viewport: { width: 1440, height: 2200 } })
const page = await context.newPage()

const waitForPage = async () => {
  await page.waitForLoadState('networkidle').catch(() => undefined)
}

const clickNext = async () => {
  const save = page.getByRole('button', { name: 'Save', exact: true })
  if (await save.isVisible().catch(() => false)) {
    await save.click()
    await waitForPage()
  }
  await page.locator('input[name=next]:visible').click()
  await waitForPage()
}

await page.goto('https://www.washingtonconnection.org/eapplication/home.go?action=Introduction&source=', {
  waitUntil: 'networkidle',
  timeout: 60000,
})
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

for (let index = 1; index <= 16; index += 1) {
  const title = await page.title()
  const body = await page.locator('body').innerText()
  console.log(`STEP=${index} TITLE=${title}`)
  if (/Resource|Annuities/i.test(title)) {
    console.log(body.slice(body.indexOf('Help with this Page'), body.indexOf('Register to Vote')))
  }
  if (title.startsWith('Resource -')) {
    await page.screenshot({
      path: 'public/washington-connection-resources.png',
      fullPage: true,
    })
    console.log('SCREENSHOT=washington-connection-resources.png')
  }
  await clickNext()
}

await context.close()
