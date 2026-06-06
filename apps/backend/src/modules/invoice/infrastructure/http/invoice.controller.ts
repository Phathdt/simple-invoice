import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CurrentUser, type JwtPayload } from '../../../auth/infrastructure/decorators/current-user.decorator'
import { CreateInvoiceInput } from '../../domain/dto/create-invoice.input'
import { InvoiceDetailDataResponse, InvoiceListDataResponse } from '../../domain/dto/invoice-response.dto'
import { ListInvoicesQuery } from '../../domain/dto/list-invoices.query'
import { IInvoiceService } from '../../domain/interfaces/invoice.service'

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoices: IInvoiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created', type: InvoiceDetailDataResponse })
  @ApiResponse({ status: 409, description: 'Invoice number already exists' })
  create(@Body() body: CreateInvoiceInput, @CurrentUser() user: JwtPayload) {
    return this.invoices.create(body, user.sub)
  }

  @Get()
  @ApiOperation({ summary: 'List invoices with search, filter, sort, pagination' })
  @ApiResponse({ status: 200, description: 'Paginated invoice list', type: InvoiceListDataResponse })
  list(@Query() query: ListInvoicesQuery) {
    return this.invoices.list(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice detail by ID' })
  @ApiResponse({ status: 200, description: 'Invoice detail', type: InvoiceDetailDataResponse })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findById(@Param('id') id: string) {
    return this.invoices.findById(id)
  }
}
