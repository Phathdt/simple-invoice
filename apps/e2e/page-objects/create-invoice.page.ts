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
    await this.pickDate('invoice-date-picker', input.invoiceDate)
    await this.pickDate('due-date-picker', input.dueDate)
    // Currency is a shadcn (Radix) Select; the symbol is derived automatically.
    await this.selectCurrency(input.currency)
    await this.byName('customerName').fill(input.customerName)
    await this.byName('customerEmail').fill(input.customerEmail)
    await this.byName('items.0.name').fill(input.itemName)
    await this.byName('items.0.quantity').fill(String(input.quantity))
    await this.byName('items.0.rate').fill(String(input.rate))
  }

  // Drives the shadcn Select (Radix combobox + portalled listbox): clicks the
  // trigger, then the option whose label starts with the currency code
  // (option text is e.g. "USD ($)").
  async selectCurrency(code: string): Promise<void> {
    await this.byName('currency').click()
    await this.page.getByRole('option', { name: new RegExp(`^${code}\\b`) }).click()
  }

  // Drives the shadcn DatePicker (Popover + react-day-picker dropdown caption).
  // isoDate is yyyy-MM-dd; selects year + month via the caption dropdowns, then
  // clicks the day cell (excluding outside-month duplicates).
  async pickDate(testid: string, isoDate: string): Promise<void> {
    const [year, month, day] = isoDate.split('-').map(Number)
    await this.page.getByTestId(testid).click()
    // Scope to the open calendar (react-day-picker root), not role=dialog —
    // a previously-opened popover may still be mounted during transition.
    const cal = this.page.locator('.rdp-root:visible').last()
    await expect(cal).toBeVisible({ timeout: TimeoutValue.ACTION })
    // Dropdown caption: month value is 0-based, year is full year.
    await cal
      .locator('select')
      .first()
      .selectOption(String(month! - 1))
    await cal.locator('select').nth(1).selectOption(String(year))
    await cal.locator(`td:not([class*="opacity-50"]) button:text-is("${day}")`).first().click()
  }

  async fillField(name: string, value: string): Promise<void> {
    await this.byName(name).fill(value)
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

  async expectFieldError(message: string): Promise<void> {
    await expect(this.page.getByText(message).first()).toBeVisible({ timeout: TimeoutValue.ACTION })
  }
}
