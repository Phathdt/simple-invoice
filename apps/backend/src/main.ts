import 'dotenv/config'

import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import helmet from 'helmet'
import { Logger } from 'nestjs-pino'
import { cleanupOpenApiDoc, ZodValidationPipe } from 'nestjs-zod'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  app.use(helmet())
  app.useGlobalPipes(new ZodValidationPipe())
  app.enableCors({ origin: true, credentials: true })

  const config = new DocumentBuilder()
    .setTitle('SimpleInvoice API')
    .setDescription('SimpleInvoice REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config))
  SwaggerModule.setup('api/docs', app, document)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT') ?? 4000
  await app.listen(port)
}
bootstrap()
