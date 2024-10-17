import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, HttpStatus, ValidationPipe, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Public, ResponseMessage, User } from '../../decorators/customize';
import { IUser } from '../users/user.interface';
import { RegisterUserDto } from './dto/register-auth.dto';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) { }
  @UseGuards(AuthGuard('local'))
  @ResponseMessage('Login successful')
  @Post('login')
  @Public()
  async login(
    @User() user: IUser,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.handleLogin(user, response);
  }

  @ResponseMessage('Register successful')
  @Post('register')
  @Public()
  async register(@Body() user: RegisterUserDto) {
    return this.authService.handleRegister(user);
  }

  @ResponseMessage('Get user profile')
  @Get('profile')
  async getProfile(@User() user: IUser,) {
    return user;
  }

  @ResponseMessage('Get user refresh token')
  @Get('refresh')
  @Public()
  async handleRefreshToken(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    const refresh_token = req.cookies['refresh_token'];
    return this.authService.handleRefreshToken(refresh_token, response);
  }



  @Get('facebook')
  @UseGuards(AuthGuard('facebook-token'))
  @Public()
  @ResponseMessage('Login with facebook successful')
  async getTokenAfterFacebookSignIn(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
    try {
      return await this.authService.handleFacebookLogin(user, response);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}