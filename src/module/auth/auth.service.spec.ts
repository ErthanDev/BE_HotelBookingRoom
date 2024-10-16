import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';
import { IUser } from '../users/user.interface';
describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'user',
    refreshToken: 'refreshToken',
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            updateUserToken: jest.fn(),
            register: jest.fn(),
            findUserByRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('validateUser', () => {
    it('should return user data without password when credentials are valid', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.validateUser(mockUser.email, 'password');
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should return null if credentials are invalid', async () => {
      jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);


      const result = await authService.validateUser(mockUser.email, 'wrongPassword');
      expect(result).toBeNull();
    });
  });

  describe('handleLogin', () => {
    it('should return tokens and set refresh token in cookie', async () => {
      const mockResponse: any = { cookie: jest.fn() };
      const mockPayload = { id: mockUser.id, name: mockUser.name, email: mockUser.email, role: mockUser.role };

      jest.spyOn(jwtService, 'sign').mockReturnValue('accessToken');
      jest.spyOn(authService, 'generateRefreshToken').mockReturnValue('refreshToken');
      
      const result = await authService.handleLogin(mockUser, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', {
        httpOnly: true,
        maxAge: undefined, // Adjust based on your configuration
      });

      expect(result).toEqual({
        access_token: 'accessToken',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });
  });

  describe('handleRegister', () => {
    it('should register a new user', async () => {
      jest.spyOn(usersService, 'register').mockResolvedValue(mockUser);

      const result = await authService.handleRegister({
        email: 'newuser@example.com',
        password: 'password',
      } as any);

      expect(result).toEqual(mockUser);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate refresh token', () => {
      jest.spyOn(configService, 'get').mockReturnValue('secretKey');
      jest.spyOn(jwtService, 'sign').mockReturnValue('refreshToken');

      const result = authService.generateRefreshToken(mockUser);
      expect(result).toBe('refreshToken');
    });
  });

  describe('handleRefreshToken', () => {
    it('should refresh the access token and update the refresh token', async () => {
      const mockResponse: any = { cookie: jest.fn(), clearCookie: jest.fn() };
      jest.spyOn(jwtService, 'verify').mockReturnValue(mockUser);
      jest.spyOn(usersService, 'findUserByRefreshToken').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'generateRefreshToken').mockReturnValue('newRefreshToken');
      jest.spyOn(jwtService, 'sign').mockReturnValue('newAccessToken');

      const result = await authService.handleRefreshToken('refreshToken', mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', 'newRefreshToken', {
        httpOnly: true,
        maxAge: undefined, // Adjust based on your configuration
      });

      expect(result).toEqual({
        access_token: 'newAccessToken',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
    });

    it('should throw error if refresh token is invalid', async () => {
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(authService.handleRefreshToken('invalidRefreshToken', {} as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
