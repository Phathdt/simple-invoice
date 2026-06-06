import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: { target: '../../docs/openapi.yaml' },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      schemas: 'src/api/generated/models',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: 'src/api/axios-instance.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
  'api-zod': {
    input: { target: '../../docs/openapi.yaml' },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      client: 'zod',
      fileExtension: '.zod.ts',
    },
  },
})
