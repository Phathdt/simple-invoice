import { useState } from 'react'

import { useNavigate } from '@tanstack/react-router'

import { useInvoiceControllerList } from '@/api/generated/invoices/invoices'
import type { InvoiceControllerListParams } from '@/api/generated/models'
import { removeToken } from '@/lib/auth'

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

type SortBy = NonNullable<InvoiceControllerListParams['sortBy']>
type Ordering = NonNullable<InvoiceControllerListParams['ordering']>

export function useInvoiceList() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('createdAt')
  const [ordering, setOrdering] = useState<Ordering>('DESC')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const params: InvoiceControllerListParams = {
    page,
    pageSize,
    sortBy,
    ordering,
    ...(keyword ? { keyword } : {}),
    ...(status ? { status } : {}),
    ...(fromDate ? { fromDate } : {}),
    ...(toDate ? { toDate } : {}),
  }

  const { data: response, isLoading, isError } = useInvoiceControllerList(params)
  const invoices = response?.data ?? []
  const paging = response?.paging
  const totalPages = paging ? Math.max(1, Math.ceil(paging.total / paging.pageSize)) : 1

  // Filter changes reset to the first page so results stay consistent.
  const onKeyword = (v: string) => {
    setKeyword(v)
    setPage(1)
  }
  const onStatus = (v: string) => {
    setStatus(v)
    setPage(1)
  }
  const onFromDate = (v: string) => {
    setFromDate(v)
    setPage(1)
  }
  const onToDate = (v: string) => {
    setToDate(v)
    setPage(1)
  }
  const onPageSize = (v: number) => {
    setPageSize(v)
    setPage(1)
  }

  const prevPage = () => setPage((p) => Math.max(1, p - 1))
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1))

  const logout = () => {
    removeToken()
    navigate({ to: '/login' })
  }

  const openInvoice = (id: string) => navigate({ to: '/invoices/$id', params: { id } })
  const openCreate = () => navigate({ to: '/invoices/create' })

  return {
    state: { page, pageSize, keyword, status, sortBy, ordering, fromDate, toDate },
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    setSortBy,
    setOrdering,
    onKeyword,
    onStatus,
    onFromDate,
    onToDate,
    onPageSize,
    prevPage,
    nextPage,
    logout,
    openInvoice,
    openCreate,
    query: { isLoading, isError },
    invoices,
    paging,
    totalPages,
  }
}
