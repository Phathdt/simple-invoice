import type { Invoice } from '../../domain/entities/invoice.entity'

/** Transform internal entity → API response shape (PRD Appendix A format).
 *  Nests customer fields and renames id → invoiceId. */
export function presentInvoice(invoice: Invoice) {
  const {
    id,
    customerName,
    customerEmail,
    customerMobile,
    customerAddress,
    exchangeRate: _r,
    baseCurrency: _b,
    totalAmountBase: _t,
    ...rest
  } = invoice

  return {
    invoiceId: id,
    customer: {
      fullname: customerName,
      email: customerEmail,
      mobileNumber: customerMobile ?? null,
      address: customerAddress ?? null,
    },
    ...rest,
  }
}
