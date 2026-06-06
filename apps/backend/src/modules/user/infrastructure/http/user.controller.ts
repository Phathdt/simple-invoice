import { Controller, Get, Param } from '@nestjs/common'

import { IUserService } from '../../domain/interfaces/user.service'

@Controller('users')
export class UserController {
  constructor(private readonly users: IUserService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.users.findById(id)
  }
}
