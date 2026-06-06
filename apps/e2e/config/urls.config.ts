export const URLS = {
  APP: process.env.APP_URL ?? 'http://localhost:5173',
  API: process.env.API_URL ?? 'http://localhost:4000',
  ROUTES: {
    LOGIN: '/login',
    LIST: '/',
    CREATE: '/invoices/create',
    DETAIL: (id: string) => `/invoices/${id}`,
  },
}

export const getAppUrl = (route: string): string => `${URLS.APP}${route}`

export const getTestCredentials = () => ({
  email: process.env.TEST_EMAIL ?? 'alice@simple-invoice.dev',
  password: process.env.TEST_PASSWORD ?? 'password123',
})
