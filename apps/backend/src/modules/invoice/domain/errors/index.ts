import { ConflictException, NotFoundException } from '@nestjs/common'

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
