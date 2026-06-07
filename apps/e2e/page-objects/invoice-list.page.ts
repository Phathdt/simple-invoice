import { TimeoutValue } from '@config/test.config'
import { getAppUrl, URLS } from '@config/urls.config'
import { expect, type Page } from '@playwright/test'

export class InvoiceListPage {
  constructor(private readonly page: Page) {}

  private get heading() {
    return this.page.getByTestId('invoice-list')
  }

  private get searchInput() {
    return this.page.getByTestId('invoice-search')
  }

  private get createButton() {
    return this.page.getByTestId('invoice-create-btn')
  }

  async navigate(): Promise<void> {
    await this.page.goto(getAppUrl(URLS.ROUTES.LIST), {
      waitUntil: 'domcontentloaded',
      timeout: TimeoutValue.NAVIGATION,
    })
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`^${URLS.APP}/?$`), { timeout: TimeoutValue.NAVIGATION })
    await expect(this.heading).toBeVisible({ timeout: TimeoutValue.ACTION })
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput.fill(keyword)
  }

  async clickCreate(): Promise<void> {
    await this.createButton.click()
  }

  rowByInvoiceNumber(invoiceNumber: string) {
    return this.page.locator('[data-testid="invoice-row"]', { hasText: invoiceNumber })
  }

  rows() {
    return this.page.locator('[data-testid="invoice-row"]')
  }

  async selectPageSize(size: number): Promise<void> {
    // Radix Select (not a native <select>): open the trigger, then pick the option.
    await this.page.getByLabel('Rows per page').click()
    await this.page.getByRole('option', { name: String(size), exact: true }).click()
  }

  async expectRowVisible(invoiceNumber: string): Promise<void> {
    await expect(this.rowByInvoiceNumber(invoiceNumber)).toBeVisible({ timeout: TimeoutValue.ACTION })
  }

  async openRow(invoiceNumber: string): Promise<void> {
    await this.rowByInvoiceNumber(invoiceNumber).click()
  }
}
