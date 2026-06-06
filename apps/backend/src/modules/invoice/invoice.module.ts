import { Module } from '@nestjs/common'

import { InvoiceService } from './application/services/invoice.service'
import { IInvoiceRepository } from './domain/interfaces/invoice.repository'
import { IInvoiceService } from './domain/interfaces/invoice.service'
import { InvoiceController } from './infrastructure/http/invoice.controller'
import { InvoicePrismaRepository } from './infrastructure/repositories/invoice.prisma-repository'

@Module({
  controllers: [InvoiceController],
  providers: [
    { provide: IInvoiceRepository, useClass: InvoicePrismaRepository },
    {
      provide: IInvoiceService,
      useFactory: (repo: IInvoiceRepository) => new InvoiceService(repo),
      inject: [IInvoiceRepository],
    },
  ],
  exports: [IInvoiceService, IInvoiceRepository],
})
export class InvoiceModule {}
