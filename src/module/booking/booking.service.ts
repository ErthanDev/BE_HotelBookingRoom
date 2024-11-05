import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Between, In, LessThan, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Room } from '../room/entities/room.entity';
import { Utility } from '../utility/entities/utility.entity';
import { plainToClass } from 'class-transformer';
import { BookingResponseDto, BookingsResponseDto } from './dto/booking-response.dto';
import { MetaResponseDto } from 'src/core/meta-response.dto';
import { BookingUtility } from '../booking-utility/entities/booking-utility.entity';
import { BookingStatus } from 'src/enum/bookingStatus.enum';

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
    @InjectRepository(BookingUtility)
    private bookingUtilityRepository: Repository<BookingUtility>,
  ) { }

  async createMyBooking(createBookingDto: CreateBookingDto) {
    const { userId, roomId, startTime, endTime, bookingType, numberOfGuest } = createBookingDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        room,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });

    if (existingBooking) {
      throw new ConflictException('The room is already booked for this time slot');
    }

    const booking = this.bookingRepository.create({
      user,
      room,
      startTime,
      endTime,
      bookingType,
      numberOfGuest: numberOfGuest,
    });
    return await this.bookingRepository.save(booking);
  }

  async findAll(qs: any) {
    const totalItems = await this.bookingRepository.count();
    const take = qs.limit ? +qs.limit : totalItems; // Fetch all if qs.limit is empty
    const skip = qs.currentPage ? (+qs.currentPage - 1) * take : 0;
    const totalPages = Math.ceil(totalItems / take);
  
    const [result, total] = await this.bookingRepository.findAndCount({
      take,
      skip,
      relations: ['user', 'room', 'bookingUtilities', 'bookingUtilities.utility', 'room.typeRoom', 'payments'],
      order: { bookingDate: 'DESC' }
    });
  
    const booking = plainToClass(BookingResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total
    });
  
    const bookingsResponseDto = plainToClass(BookingsResponseDto, {
      meta: metaResponseDto,
      bookings: booking
    });
  
    return bookingsResponseDto;
  }
  

  async findOne(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: id },
      relations: ['user', 'room', 'bookingUtilities', 'bookingUtilities.utility', 'room.typeRoom', 'payments'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking not found`);
    }

    return booking
  }

  async findMyBooking(userId: string, qs: any) {
    const totalItems = await this.bookingRepository.count({ where: { user: { id: userId } } });
    const take = qs.limit ? +qs.limit : totalItems; // Lấy tất cả nếu qs.limit rỗng
    const skip = qs.currentPage ? (+qs.currentPage - 1) * take : 0;
    const totalPages = Math.ceil(totalItems / take);
  
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const [result, total] = await this.bookingRepository.findAndCount({
      take,
      skip,
      relations: ['user', 'room', 'bookingUtilities', 'bookingUtilities.utility', 'payments'],
      where: { user },
      order: { bookingDate: 'DESC' }
    });
  
    const booking = plainToClass(BookingResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total
    });
  
    const bookingsResponseDto = plainToClass(BookingsResponseDto, {
      meta: metaResponseDto,
      bookings: booking
    });
  
    return bookingsResponseDto;
  }
  

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const { bookingStatus,utilities } = updateBookingDto;
    if(utilities){
      if (!Array.isArray(updateBookingDto.utilities)) {
        throw new Error('utilities must be an array');
      }
      const booking = await this.bookingRepository.findOne({ where: { bookingId: id } });
  
      for (const utility of updateBookingDto.utilities) {
        const utilityExist = await this.utilityRepository.findOne({ where: { utilityId: utility.utilityId } });
        const bookingUtilityExist = await this.bookingUtilityRepository.findOne({ where: { booking: booking, utility: utilityExist } });
        if (bookingUtilityExist) {
          if (utility.quantity === 0) {
            await this.bookingUtilityRepository.delete(bookingUtilityExist);
          } else {
            await this.bookingUtilityRepository.update(bookingUtilityExist.bookingUtilityId, { quantity: utility.quantity });
          }
        } else {
          if (utility.quantity > 0) {
            const bookingUtility = this.bookingUtilityRepository.create({
              booking,
              utility: utilityExist,
              quantity: utility.quantity,
            });
            await this.bookingUtilityRepository.save(bookingUtility);
          }
        }
      }
    }
    if (bookingStatus) {
      await this.bookingRepository.update(id, { bookingStatus });
    }
    return await this.findOne(id);
  }


  async remove(id: string) {
    const booking = await this.findOne(id);
    // xóa bookingUtility trước rồi mới xóa booking đc
    for (const bookingUtility of booking.bookingUtilities) {
      await this.bookingUtilityRepository.delete(bookingUtility.bookingUtilityId);
    }
    await this.bookingRepository.delete(id);
    return booking;
  }

  async findBookingByStatus(status: BookingStatus, qs: any) {
    const totalItems = await this.bookingRepository.count({ where: { bookingStatus: status } });
    const take = qs.limit ? +qs.limit : totalItems; // Lấy tất cả nếu qs.limit rỗng
    const skip = qs.currentPage ? (+qs.currentPage - 1) * take : 0;
    const totalPages = Math.ceil(totalItems / take);
  
    const [result, total] = await this.bookingRepository.findAndCount({
      take,
      skip,
      where: { bookingStatus: status },
      relations: ['user', 'room', 'bookingUtilities', 'bookingUtilities.utility'],
      order: { bookingDate: 'DESC' }
    });
  
    const bookingResponse = plainToClass(BookingResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total
    });
  
    const bookingsResponseDto = plainToClass(BookingsResponseDto, {
      meta: metaResponseDto,
      bookings: bookingResponse
    });
  
    return bookingsResponseDto;
  }

  async findBookingToday(qs: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
  
    const totalItems = await this.bookingRepository.count({
      where: { startTime: Between(today, tomorrow) }
    });
    const take = qs.limit ? +qs.limit : totalItems; // Lấy tất cả nếu qs.limit rỗng
    const skip = qs.currentPage ? (+qs.currentPage - 1) * take : 0;
    const totalPages = Math.ceil(totalItems / take);
  
    const [result, total] = await this.bookingRepository.findAndCount({
      take,
      skip,
      where: { startTime: Between(today, tomorrow) },
      relations: ['user', 'room', 'bookingUtilities', 'bookingUtilities.utility']
    });
  
    const bookingResponse = plainToClass(BookingResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total
    });
  
    const bookingsResponseDto = plainToClass(BookingsResponseDto, {
      meta: metaResponseDto,
      bookings: bookingResponse
    });
  
    return bookingsResponseDto;
  }

  async create(createBookingDto: CreateBookingDto) {
    const { roomId, startTime, endTime, bookingType, numberOfGuest } = createBookingDto;

    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        room,
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });

    if (existingBooking) {
      throw new ConflictException('The room is already booked for this time slot');
    }

    const booking = this.bookingRepository.create({
      room,
      startTime,
      endTime,
      bookingType,
      numberOfGuest: numberOfGuest,
    });
    return await this.bookingRepository.save(booking);
  }
}
