import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <h1 className="text-2xl font-bold p-8">SimpleInvoice</h1>
        <p className="px-8 text-gray-600">Frontend setup complete. Orval pipeline ready.</p>
      </div>
    </QueryClientProvider>
  )
}
