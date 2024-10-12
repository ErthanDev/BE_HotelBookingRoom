import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { In, Like, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Room } from '../room/entities/room.entity';
import { Utility } from '../utility/entities/utility.entity';
import { plainToClass } from 'class-transformer';
import { BookingResponseDto, BookingsResponseDto } from './dto/booking-response.dto';
import { MetaResponseDto } from 'src/core/meta-response.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Utility)
    private utilityRepository: Repository<Utility>,
  ) { }

  async create(createBookingDto: CreateBookingDto) {
    const { userId, roomId, startTime, endTime, bookingType, numberOfPerson } = createBookingDto;
    const user = await this.userRepository.findOne({ where: { id:userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const room = await this.roomRepository.findOne({ where: { id:roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    const booking = this.bookingRepository.create({
      user,
      room,
      startTime,
      endTime,
      bookingType,
      numberOfGuest: numberOfPerson,
    });
    return await this.bookingRepository.save(booking);
  }

  async findAll(qs: any) {
    const take = +qs.limit || 10;
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;
    const keyword = qs.keyword || '';
    const defaultLimit = +qs.limit ? +qs.limit : 10;

    const totalItems = await this.bookingRepository.count();

    const totalPages = Math.ceil(totalItems / defaultLimit);
    
    const [result, total] = await this.bookingRepository.findAndCount({
        take: take || totalItems,
        skip: skip,
        relations: ['user', 'room','bookingUtilities', 'bookingUtilities.utility'],
    });
    const booking = plainToClass(BookingResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: +qs.limit || 10,
      pages: totalPages,
      total: total,
    });

    // Tạo RoomsResponseDto
    const bookingsResponseDto = plainToClass(BookingsResponseDto, {
      meta: metaResponseDto,
      bookings: booking,
    });
    
    return bookingsResponseDto;
  }

  async findOne(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: id },
      relations: ['user', 'room']
    });

    if (!booking) {
      throw new NotFoundException(`Booking not found`);
    }
    return booking
  }

  async findMyBooking(userId: string, qs: any) {
    const take = +qs.limit || 10;
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;
    const defaultLimit = +qs.limit ? +qs.limit : 10;

    const totalItems = await this.bookingRepository.count();

    const totalPages = Math.ceil(totalItems / defaultLimit);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    const [result, total] = await this.bookingRepository.findAndCount({
        take: take || totalItems,
        skip: skip,
        relations: ['user', 'room','bookingUtilities', 'bookingUtilities.utility'],
        where: { user: user }
    });

    const booking = plainToClass(BookingResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: +qs.limit || 10,
      pages: totalPages,
      total: total,
    });

    // Tạo RoomsResponseDto
    const bookingsResponseDto = plainToClass(BookingsResponseDto, {
      meta: metaResponseDto,
      bookings: booking,
    });
    
    return bookingsResponseDto;
  }

  // update còn lỗi
  async update(id: string, updateBookingDto: UpdateBookingDto) {
    // const booking = await this.findOne(id);
    // console.log( booking)
    // const utility = await this.utilityRepository.findOne({ where: { utilityId: updateBookingDto.utilityId } });
    // console.log(utility)
    // updateBookingDto.bookingUtilities = utility;
    // console.log(updateBookingDto)
    // const {utilityId, ...updateBookingDtoWithoutUtilityId} = updateBookingDto;
    // await this.bookingRepository.update(id, updateBookingDtoWithoutUtilityId);
    // return booking;
  }

  async remove(id: string) {
    const booking = await this.findOne(id);
    await this.bookingRepository.delete(id);
    return booking;
  }
}
