/**
 * Standalone script: boots the NestJS app without listening on a port,
 * generates the OpenAPI document, writes it as YAML to docs/openapi.yaml,
 * then exits cleanly.
 *
 * Usage: node --import @swc-node/register/esm-register src/openapi-export.ts
 */
import 'dotenv/config'

import fs from 'node:fs'
import path from 'node:path'

import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { cleanupOpenApiDoc } from 'nestjs-zod'
import { dump as yamlDump } from 'js-yaml'

import { AppModule } from './app.module'

// Runs under CJS register (@swc-node/register), so __dirname is available.
const currentDir = __dirname

async function exportOpenApi() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // suppress boot logs during export
  })

  const config = new DocumentBuilder()
    .setTitle('SimpleInvoice API')
    .setDescription('SimpleInvoice REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  // cleanupOpenApiDoc resolves nestjs-zod schemas into proper OpenAPI definitions
  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config))

  // currentDir = apps/backend/src → go up 3 levels to monorepo root
  const outputPath = path.resolve(currentDir, '..', '..', '..', 'docs', 'openapi.yaml')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, yamlDump(document, { lineWidth: 120 }), 'utf8')

  console.log(`OpenAPI spec written to ${outputPath}`)

  await app.close()
}

exportOpenApi().catch((err) => {
  console.error('openapi-export failed:', err)
  process.exit(1)
})
