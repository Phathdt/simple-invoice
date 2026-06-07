import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'

export class InvoiceNotFoundError extends NotFoundException {
  constructor(id: string) {
    super(`Invoice ${id} not found`)
  }
}

export class DuplicateInvoiceNumberError extends ConflictException {
  constructor(invoiceNumber: string) {
    super(`Invoice number ${invoiceNumber} already exists`)
  }
}

export class UnsupportedCurrencyError extends BadRequestException {
  constructor(currency: string) {
    super(`Unsupported currency: ${currency}`)
  }
}
