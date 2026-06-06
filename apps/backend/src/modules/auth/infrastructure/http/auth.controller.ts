import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { AuthSessionResponse, UserResponse } from '../../domain/dto/auth-response.dto'
import { LoginInput } from '../../domain/dto/login.input'
import { RegisterInput } from '../../domain/dto/register.input'
import { IAuthService } from '../../domain/interfaces/auth.service'
import { CurrentUser, type JwtPayload } from '../decorators/current-user.decorator'
import { Public } from '../decorators/public.decorator'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: IAuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered, JWT returned', type: AuthSessionResponse })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body() body: RegisterInput) {
    return this.auth.register(body)
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email/password' })
  @ApiResponse({ status: 201, description: 'JWT returned', type: AuthSessionResponse })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() body: LoginInput) {
    return this.auth.login(body)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile', type: UserResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@CurrentUser() user: JwtPayload) {
    return this.auth.me(user.sub)
  }
}
