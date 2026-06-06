import { TimeoutValue } from '@config/test.config'
import { getAppUrl, URLS } from '@config/urls.config'
import { expect, type Page } from '@playwright/test'

export class LoginPage {
  constructor(private readonly page: Page) {}

  private get emailInput() {
    return this.page.getByTestId('login-email')
  }

  private get passwordInput() {
    return this.page.getByTestId('login-password')
  }

  private get submitButton() {
    return this.page.getByTestId('login-submit')
  }

  private get errorBox() {
    return this.page.getByTestId('login-error')
  }

  async navigate(): Promise<void> {
    await this.page.goto(getAppUrl(URLS.ROUTES.LOGIN), {
      waitUntil: 'domcontentloaded',
      timeout: TimeoutValue.NAVIGATION,
    })
  }

  async fillAndSubmit(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/login/, { timeout: TimeoutValue.NAVIGATION })
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorBox).toBeVisible({ timeout: TimeoutValue.ACTION })
  }
}
