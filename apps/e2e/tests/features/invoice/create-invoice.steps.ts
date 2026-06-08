import { getTestCredentials } from '@config/urls.config'
import { Given, Then, When } from '@cucumber/cucumber'
import { CreateInvoicePage } from '@page-objects/create-invoice.page'
import { InvoiceDetailPage } from '@page-objects/invoice-detail.page'
import { InvoiceListPage } from '@page-objects/invoice-list.page'
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
    customerName: 'E2E Test Customer',
    customerEmail: 'e2e-create@example.com',
    itemName: 'E2E Service',
    quantity: 1,
    rate: 500,
  })
})

When('I fill in the customer email with {string}', async function (this: BrowserWorld, email: string) {
  const createPage = new CreateInvoicePage(this.page)
  logger.info(`Filling customer email with invalid value: ${email}`)
  await createPage.fillField('customerEmail', email)
})

When('I fill in the customer phone with {string}', async function (this: BrowserWorld, phone: string) {
  const createPage = new CreateInvoicePage(this.page)
  logger.info(`Filling customer phone with invalid value: ${phone}`)
  await createPage.fillField('customerMobile', phone)
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

Then('I should see the email validation error {string}', async function (this: BrowserWorld, message: string) {
  const createPage = new CreateInvoicePage(this.page)
  logger.info(`Expecting email validation error: ${message}`)
  await createPage.expectFieldError(message)
})

Then('I should see the phone validation error {string}', async function (this: BrowserWorld, message: string) {
  const createPage = new CreateInvoicePage(this.page)
  logger.info(`Expecting phone validation error: ${message}`)
  await createPage.expectFieldError(message)
})

When('I fill in the invoice form with a future due date', async function (this: BrowserWorld) {
  const invoiceNumber = uniqueInvoiceNumber('E2E')
  this.data.invoiceNumber = invoiceNumber
  logger.info(`Filling invoice form (future due date) with number: ${invoiceNumber}`)
  const createPage = new CreateInvoicePage(this.page)
  await createPage.fillForm({
    invoiceNumber,
    invoiceDate: '2026-06-07',
    dueDate: '2027-06-07',
    currency: 'USD',
    customerName: 'E2E Not Overdue Customer',
    customerEmail: 'e2e-not-overdue@example.com',
    itemName: 'E2E Service',
    quantity: 1,
    rate: 500,
  })
})

When('I open the created invoice from the list', async function (this: BrowserWorld) {
  const invoiceNumber = this.data.invoiceNumber as string
  const listPage = new InvoiceListPage(this.page)
  logger.info(`Opening created invoice from list: ${invoiceNumber}`)
  await listPage.navigate()
  await listPage.expectLoaded()
  await listPage.search(invoiceNumber)
  await listPage.expectRowVisible(invoiceNumber)
  await listPage.openRow(invoiceNumber)
})

Then('the invoice status should be {string}', async function (this: BrowserWorld, status: string) {
  const invoiceNumber = this.data.invoiceNumber as string
  const detailPage = new InvoiceDetailPage(this.page)
  logger.info(`Expecting status "${status}" for invoice: ${invoiceNumber}`)
  await detailPage.expectLoaded(invoiceNumber)
  await detailPage.expectStatus(status)
})
