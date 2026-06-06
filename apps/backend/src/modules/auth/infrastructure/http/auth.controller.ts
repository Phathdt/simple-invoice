import { Body, Controller, Post } from '@nestjs/common'

import { LoginInput } from '../../domain/dto/login.input'
import { RegisterInput } from '../../domain/dto/register.input'
import { IAuthService } from '../../domain/interfaces/auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: IAuthService) {}

  @Post('register')
  register(@Body() body: RegisterInput) {
    return this.auth.register(body)
  }

  @Post('login')
  login(@Body() body: LoginInput) {
    return this.auth.login(body)
  }
}
