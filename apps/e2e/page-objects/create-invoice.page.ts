import { TimeoutValue } from '@config/test.config'
import { getAppUrl, URLS } from '@config/urls.config'
import { expect, type Page } from '@playwright/test'

export interface InvoiceFormInput {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  currency: string
  customerName: string
  customerEmail: string
  itemName: string
  quantity: number
  rate: number
}

// react-hook-form registers inputs by `name`, so name-attribute locators are
// the most stable selectors for form fields.
export class CreateInvoicePage {
  constructor(private readonly page: Page) {}

  private byName(name: string) {
    return this.page.locator(`[name="${name}"]`)
  }

  private get submitButton() {
    return this.page.getByTestId('create-submit')
  }

  async navigate(): Promise<void> {
    await this.page.goto(getAppUrl(URLS.ROUTES.CREATE), {
      waitUntil: 'domcontentloaded',
      timeout: TimeoutValue.NAVIGATION,
    })
  }

  async fillForm(input: InvoiceFormInput): Promise<void> {
    await this.byName('invoiceNumber').fill(input.invoiceNumber)
    await this.byName('invoiceDate').fill(input.invoiceDate)
    await this.byName('dueDate').fill(input.dueDate)
    // Currency is a select; the symbol is derived automatically.
    await this.byName('currency').selectOption(input.currency)
    await this.byName('customerName').fill(input.customerName)
    await this.byName('customerEmail').fill(input.customerEmail)
    await this.byName('items.0.name').fill(input.itemName)
    await this.byName('items.0.quantity').fill(String(input.quantity))
    await this.byName('items.0.rate').fill(String(input.rate))
  }

  async submit(): Promise<void> {
    await this.submitButton.click()
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.page.getByTestId('create-success')).toBeVisible({
      timeout: TimeoutValue.ACTION,
    })
  }

  async expectValidationError(): Promise<void> {
    await expect(this.page.getByText('Required').first()).toBeVisible({ timeout: TimeoutValue.ACTION })
  }
}
