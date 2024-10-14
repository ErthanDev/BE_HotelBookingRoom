import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res, Req, HttpStatus, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { IUser } from 'src/module/users/user.interface';
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

  @Get("/facebook")
  @UseGuards(AuthGuard("facebook"))
  @Public()
  async facebookLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get("/facebook/redirect")
  @ResponseMessage('Facebook login successful')
  @Public()
  @UseGuards(AuthGuard("facebook"))
  async facebookLoginRedirect(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
    try {
      await this.authService.handleFacebookLogin(user, response);
      return response.redirect(this.configService.get<string>('CLIENT_URL'));
    } catch (error) {
      console.log(error);
      return response.redirect(`${this.configService.get<string>('CLIENT_URL')}/login`);
    }
  }

}
