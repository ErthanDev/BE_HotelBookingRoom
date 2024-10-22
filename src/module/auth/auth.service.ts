import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IUser } from '../users/user.interface';
import { RegisterUserDto } from './dto/register-auth.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as ms from 'ms';
import { UsersService } from '../users/users.service';
@Injectable()
export class AuthService {
  constructor
    (
      private usersService: UsersService,
      private jwtService: JwtService,
      private configService: ConfigService

    ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    const isMatch = await bcrypt.compare(pass, user.password);
    if (user && isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async handleLogin(user: IUser, response: Response) {
    const { id, name, email, role, phoneNumber, address } = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      id,
      name,
      email,
      role
    };

    const refresh_token = this.generateRefreshToken(payload)
    await this.usersService.updateUserToken(id, refresh_token)
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: +ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
      sameSite: 'none'
    })
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id,
        name,
        email,
        phoneNumber,
        address,
        role
      }
    };
  }

  async handleRegister(userRequest: RegisterUserDto) {
    const newUser = await this.usersService.register(userRequest);
    return newUser;
  }


  generateRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE')
    })
    return refresh_token
  }

  handleRefreshToken = async (refresh_token: string, response: Response) => {
    try {
      this.jwtService.verify(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      })

      let user = await this.usersService.findUserByRefreshToken(refresh_token)
      if (!user) {
        throw new BadRequestException("Invalid refresh token")
      }
      const { id, name, email, role, phoneNumber, address } = user;
      const payload = {
        sub: "token login",
        iss: "from server",
        id,
        name,
        email,
        role
      };

      const new_refresh_token = this.generateRefreshToken(payload)
      await this.usersService.updateUserToken(id, new_refresh_token)
      response.clearCookie("refresh_token")
      response.cookie('refresh_token', new_refresh_token, {
        httpOnly: true,
        secure: true,
        maxAge: +ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
        sameSite: 'none'
      })
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id,
          name,
          email,
          phoneNumber,
          address,
          role
        }
      };
    } catch (error) {
      console.log("HandleRefreshToken Err: " + error)
      throw new BadRequestException("Invalid refresh token")
    }
  }

  async handleFacebookLogin(user: IUser, response: Response) {
    const { id, name, email, role, phoneNumber, address} = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      id,
      name,
      email,
      role
    };

    const refresh_token = this.generateRefreshToken(payload)
    await this.usersService.updateUserToken(id, refresh_token)
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true,
      maxAge: +ms(this.configService.get<string>('JWT_REFRESH_EXPIRE')),
      sameSite: 'none'
    })
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id,
        name,
        email,
        phoneNumber,
        address,
        role
      }
    };
  }

  async logout(user: IUser, response: Response) {
    await this.usersService.updateUserToken(user.id, null)
    response.clearCookie("refresh_token")
    return "ok"
  }
}

