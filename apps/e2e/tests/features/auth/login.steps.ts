import { Given, Then, When } from '@cucumber/cucumber'

import { getTestCredentials } from '@config/urls.config'
import { LoginPage } from '@page-objects/login.page'
import { InvoiceListPage } from '@page-objects/invoice-list.page'
import { BrowserWorld } from '@support/world'
import { logger } from '@utils/logger'

Given('I am on the login page', async function (this: BrowserWorld) {
  const loginPage = new LoginPage(this.page)
  logger.info('Navigating to login page')
  await loginPage.navigate()
  await loginPage.expectOnLoginPage()
})

When('I log in with valid credentials', async function (this: BrowserWorld) {
  const { email, password } = getTestCredentials()
  const loginPage = new LoginPage(this.page)
  logger.info(`Logging in as ${email}`)
  await loginPage.fillAndSubmit(email, password)
})

When(
  'I log in with email {string} and password {string}',
  async function (this: BrowserWorld, email: string, password: string) {
    const loginPage = new LoginPage(this.page)
    logger.info(`Logging in as ${email}`)
    await loginPage.fillAndSubmit(email, password)
  },
)

Then('I should be on the invoice list page', async function (this: BrowserWorld) {
  const listPage = new InvoiceListPage(this.page)
  logger.info('Expecting invoice list page')
  await listPage.expectLoaded()
})

Then('I should see a login error', async function (this: BrowserWorld) {
  const loginPage = new LoginPage(this.page)
  logger.info('Expecting login error visible')
  await loginPage.expectErrorVisible()
})

Then('I should still be on the login page', async function (this: BrowserWorld) {
  const loginPage = new LoginPage(this.page)
  await loginPage.expectOnLoginPage()
})
