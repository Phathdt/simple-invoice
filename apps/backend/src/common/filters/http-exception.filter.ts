import { Catch, HttpException, HttpStatus, Logger, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common'

import type { Response } from 'express'
import { ZodValidationException } from 'nestjs-zod'

interface ErrorBody {
  statusCode: number
  message: string | string[]
  error: string
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>()
    const body = this.toErrorBody(exception)
    response.status(body.statusCode).json(body)
  }

  private toErrorBody(exception: unknown): ErrorBody {
    // Zod validation failures → flat array of human-readable messages (PRD §2.3.5)
    if (exception instanceof ZodValidationException) {
      const zodError = exception.getZodError() as { issues?: Array<{ path: PropertyKey[]; message: string }> }
      const issues = zodError.issues ?? []
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: issues.map((issue) => {
          const path = issue.path.join('.')
          return path ? `${path}: ${issue.message}` : issue.message
        }),
        error: 'Bad Request',
      }
    }

    // Known HTTP exceptions → preserve status, normalize to {statusCode, message, error}
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const res = exception.getResponse()
      if (typeof res === 'string') {
        return { statusCode: status, message: res, error: exception.name }
      }
      const obj = res as Record<string, unknown>
      return {
        statusCode: status,
        message: (obj.message as string | string[]) ?? exception.message,
        error: (obj.error as string) ?? exception.name,
      }
    }

    // Anything else → opaque 500, never leak internals to the client
    this.logger.error(exception instanceof Error ? exception.stack : String(exception))
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    }
  }
}
