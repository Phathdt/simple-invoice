import { TimeoutValue } from '@config/test.config'
import { expect, type Page } from '@playwright/test'

export class InvoiceDetailPage {
  constructor(private readonly page: Page) {}

  async expectLoaded(invoiceNumber: string): Promise<void> {
    await expect(this.page).toHaveURL(/\/invoices\/[\w-]+$/, { timeout: TimeoutValue.NAVIGATION })
    const heading = this.page.getByTestId('detail-invoice-number')
    await expect(heading).toBeVisible({ timeout: TimeoutValue.ACTION })
    await expect(heading).toHaveText(invoiceNumber)
  }

  async expectSection(title: string): Promise<void> {
    await expect(this.page.getByText(title, { exact: false }).first()).toBeVisible({
      timeout: TimeoutValue.ACTION,
    })
  }
}
