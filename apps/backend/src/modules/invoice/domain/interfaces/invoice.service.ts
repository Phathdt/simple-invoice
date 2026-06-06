import type { Paginated } from '../../../../common/dto/paginated'
import type { CreateInvoiceInput } from '../dto/create-invoice.input'
import type { ListInvoicesQuery } from '../dto/list-invoices.query'
import type { Invoice } from '../entities/invoice.entity'

export abstract class IInvoiceService {
  abstract create(input: CreateInvoiceInput, userId: string): Promise<Invoice>
  abstract findById(id: string): Promise<Invoice>
  abstract list(query: ListInvoicesQuery): Promise<Paginated<Invoice>>
}
