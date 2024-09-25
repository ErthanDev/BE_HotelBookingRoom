import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/users/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  @UseGuards(AuthGuard('local'))
  @ResponseMessage('Login successful')
  @Post('login')
  async login(@User() user:IUser) {
    return user;
  }

}
