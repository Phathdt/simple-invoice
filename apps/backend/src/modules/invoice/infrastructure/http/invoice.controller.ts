import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import type { Paginated } from '../../../../common/dto/paginated'
import { CurrentUser, type JwtPayload } from '../../../auth/infrastructure/decorators/current-user.decorator'
import { CreateInvoiceInput } from '../../domain/dto/create-invoice.input'
import { InvoiceDetailDataResponse, InvoiceListDataResponse } from '../../domain/dto/invoice-response.dto'
import { ListInvoicesQuery } from '../../domain/dto/list-invoices.query'
import type { Invoice } from '../../domain/entities/invoice.entity'
import { IInvoiceService } from '../../domain/interfaces/invoice.service'
import { presentInvoice } from './invoice.presenter'

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoices: IInvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created', type: InvoiceDetailDataResponse })
  @ApiResponse({ status: 409, description: 'Invoice number already exists' })
  async create(@Body() body: CreateInvoiceInput, @CurrentUser() user: JwtPayload) {
    return presentInvoice(await this.invoices.create(body, user.sub))
  }

  @Get()
  @ApiOperation({ summary: 'List invoices with search, filter, sort, pagination' })
  @ApiResponse({ status: 200, description: 'Paginated invoice list', type: InvoiceListDataResponse })
  async list(@Query() query: ListInvoicesQuery) {
    const result: Paginated<Invoice> = await this.invoices.list(query)
    return { data: result.data.map(presentInvoice), paging: result.paging }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice detail by ID' })
  @ApiResponse({ status: 200, description: 'Invoice detail', type: InvoiceDetailDataResponse })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findById(@Param('id') id: string) {
    return presentInvoice(await this.invoices.findById(id))
  }
}
