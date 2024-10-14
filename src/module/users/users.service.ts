import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from 'src/module/auth/dto/register-auth.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const hash = await bcrypt.hash(createUserDto.password, 10);
    const existUser = await this.checkUserExists(createUserDto.email)

    if (existUser) {
      throw new NotFoundException(`User with email ${createUserDto.email} already exists`);
    }

    const newUser = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hash,
      phoneNumber: createUserDto.phoneNumber,
      address: createUserDto.address,
      role: createUserDto.role,
      gender: createUserDto.gender
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { password, ...result } = savedUser;
    return result;
  }


  async findAll(qs: any) {
    const take = +qs.limit || 10
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0
    const keyword = qs.keyword || ''
    const defaultLimit = +qs.limit ? +qs.limit : 10
    const totalItems = await this.usersRepository.count({
      where: { name: Like('%' + keyword + '%') }
    });

    const totalPages = Math.ceil(totalItems / defaultLimit);

    const [result, total] = await this.usersRepository.findAndCount(
      {
        take: take || totalItems,
        skip: skip
      }
    );
    const data = result.map(({ password, refreshToken, ...rest }) => rest);
    return {
      meta: {
        current: +qs.currentPage || 1,
        pageSize: +qs.limit,
        pages: totalPages,
        total: total
      },
      ressult: data
    }

  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    // Nếu không tìm thấy user, trả về lỗi 404
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async register(createUserDto: RegisterUserDto) {
    const existUser = await this.checkUserExists(createUserDto.email)

    if (existUser) {
      throw new NotFoundException(`User with email ${createUserDto.email} already exists`);
    }
    const hash = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hash,
      phoneNumber: createUserDto.phoneNumber,
      address: createUserDto.address,
      gender: createUserDto.gender
    });

    const savedUser = await this.usersRepository.save(newUser);

    const { password, ...result } = savedUser;
    return result;
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    // Nếu không tìm thấy user, trả về lỗi 404
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  updateUserToken = async (id: string, refreshToken: string,) => {
    return await this.usersRepository.update(id, { refreshToken })
  }

  findUserByRefreshToken = async (refreshToken: string) => {
    return await this.usersRepository.findOne({ where: { refreshToken } })
  }
  async checkUserExists(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    // Nếu không tìm thấy user, trả về lỗi 404
    if (!user) {
      return null;
    }
    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }
}
