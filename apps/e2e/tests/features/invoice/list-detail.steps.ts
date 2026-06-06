import { Given, Then, When } from '@cucumber/cucumber'

import { getTestCredentials } from '@config/urls.config'
import { InvoiceDetailPage } from '@page-objects/invoice-detail.page'
import { InvoiceListPage } from '@page-objects/invoice-list.page'
import { createInvoiceViaApi, loginViaApi } from '@support/api-helpers'
import { BrowserWorld } from '@support/world'
import { logger } from '@utils/logger'

Given('a seeded invoice exists via the API', async function (this: BrowserWorld) {
  const { email, password } = getTestCredentials()
  logger.info(`Seeding invoice via API as ${email}`)
  const session = await loginViaApi(email, password)
  const { invoiceNumber } = await createInvoiceViaApi(session.token)
  this.data.invoiceNumber = invoiceNumber
  logger.info(`Seeded invoice: ${invoiceNumber}`)
})

Given('I am on the invoice list page', async function (this: BrowserWorld) {
  const listPage = new InvoiceListPage(this.page)
  logger.info('Navigating to invoice list page')
  await listPage.navigate()
  await listPage.expectLoaded()
})

When('I search for the seeded invoice number', async function (this: BrowserWorld) {
  const invoiceNumber = this.data.invoiceNumber as string
  const listPage = new InvoiceListPage(this.page)
  logger.info(`Searching for invoice: ${invoiceNumber}`)
  await listPage.search(invoiceNumber)
})

Then('I should see the seeded invoice row in the list', async function (this: BrowserWorld) {
  const invoiceNumber = this.data.invoiceNumber as string
  const listPage = new InvoiceListPage(this.page)
  logger.info(`Expecting row visible for: ${invoiceNumber}`)
  await listPage.expectRowVisible(invoiceNumber)
})

When('I click on the seeded invoice row', async function (this: BrowserWorld) {
  const invoiceNumber = this.data.invoiceNumber as string
  const listPage = new InvoiceListPage(this.page)
  logger.info(`Clicking row for: ${invoiceNumber}`)
  await listPage.openRow(invoiceNumber)
})

Then(
  'I should be on the invoice detail page showing the seeded invoice number',
  async function (this: BrowserWorld) {
    const invoiceNumber = this.data.invoiceNumber as string
    const detailPage = new InvoiceDetailPage(this.page)
    logger.info(`Expecting detail page for: ${invoiceNumber}`)
    await detailPage.expectLoaded(invoiceNumber)
  },
)
