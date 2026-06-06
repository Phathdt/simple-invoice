import { Given, Then, When } from '@cucumber/cucumber'

import { getTestCredentials } from '@config/urls.config'
import { CreateInvoicePage } from '@page-objects/create-invoice.page'
import { LoginPage } from '@page-objects/login.page'
import { uniqueInvoiceNumber } from '@support/api-helpers'
import { BrowserWorld } from '@support/world'
import { logger } from '@utils/logger'

Given('I am logged in', async function (this: BrowserWorld) {
  const loginPage = new LoginPage(this.page)
  const { email, password } = getTestCredentials()
  logger.info(`Logging in via UI as ${email}`)
  await loginPage.navigate()
  await loginPage.fillAndSubmit(email, password)
  // wait for redirect away from /login
  await this.page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 })
})

Given('I am on the create invoice page', async function (this: BrowserWorld) {
  const createPage = new CreateInvoicePage(this.page)
  logger.info('Navigating to create invoice page')
  await createPage.navigate()
})

When('I fill in the invoice form with a unique invoice number', async function (this: BrowserWorld) {
  const invoiceNumber = uniqueInvoiceNumber('E2E')
  this.data.invoiceNumber = invoiceNumber
  logger.info(`Filling invoice form with number: ${invoiceNumber}`)
  const createPage = new CreateInvoicePage(this.page)
  await createPage.fillForm({
    invoiceNumber,
    invoiceDate: '2026-01-15',
    dueDate: '2026-02-15',
    currency: 'USD',
    currencySymbol: '$',
    customerName: 'E2E Test Customer',
    customerEmail: 'e2e-create@example.com',
    itemName: 'E2E Service',
    quantity: 1,
    rate: 500,
  })
})

When('I submit the create invoice form', async function (this: BrowserWorld) {
  const createPage = new CreateInvoicePage(this.page)
  logger.info('Submitting create invoice form')
  await createPage.submit()
})

When('I submit the create invoice form without filling it in', async function (this: BrowserWorld) {
  const createPage = new CreateInvoicePage(this.page)
  logger.info('Submitting empty create invoice form')
  await createPage.submit()
})

Then('I should see the invoice creation success message', async function (this: BrowserWorld) {
  const createPage = new CreateInvoicePage(this.page)
  logger.info('Expecting success message')
  await createPage.expectSuccessMessage()
})

Then('I should see a validation error on the create form', async function (this: BrowserWorld) {
  const createPage = new CreateInvoicePage(this.page)
  logger.info('Expecting validation error')
  await createPage.expectValidationError()
})
