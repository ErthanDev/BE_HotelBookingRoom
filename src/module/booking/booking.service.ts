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
import { BookingUtility } from '../booking-utility/entities/booking-utility.entity';

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

  async create(createBookingDto: CreateBookingDto) {
    const { userId, roomId, startTime, endTime, bookingType, numberOfGuest } = createBookingDto;
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
      numberOfGuest: numberOfGuest,
    });
    await this.bookingRepository.save(booking);
    const { refreshToken,password, ...userWithoutToken } = booking.user;
    return {
      bookingId: booking.bookingId,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingStatus: booking.bookingStatus,
      bookingType: booking.bookingType,
      numberOfGuest: booking.numberOfGuest,
      user: userWithoutToken,
      room: booking.room,
    };
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
      relations: ['user', 'room', 'bookingUtilities', 'bookingUtilities.utility'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking not found`);
    }
    const { refreshToken,password, ...userWithoutToken } = booking.user;
    return {
      bookingId: booking.bookingId,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingStatus: booking.bookingStatus,
      bookingType: booking.bookingType,
      numberOfGuest: booking.numberOfGuest,
      user: userWithoutToken,
      room: booking.room,
      bookingUtilities: booking.bookingUtilities.map((bookingUtility) => {
        return {
          bookingUtilityId: bookingUtility.bookingUtilityId,
          utility: bookingUtility.utility.utilityName,
          quantity: bookingUtility.quantity,
        };
      }
      ),
    };
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
    // const bookingStatus = updateBookingDto.bookingStatus;
    // const utilities = updateBookingDto.utilities;
    const { bookingStatus } = updateBookingDto;
    if (!Array.isArray(updateBookingDto.utilities)) {
      throw new Error('utilities must be an array');
    }
    const booking = await this.bookingRepository.findOne({ where: { bookingId: id }});

    for(const utility of updateBookingDto.utilities) {
      const utilityExist = await this.utilityRepository.findOne({ where: { utilityId:  utility.utilityId} });
      const bookingUtilityExist = await this.bookingUtilityRepository.findOne({ where: { booking: booking, utility: utilityExist } });
      if(bookingUtilityExist) {
          if(utility.quantity === 0) {
            await this.bookingUtilityRepository.delete(bookingUtilityExist);
          } else {
            await this.bookingUtilityRepository.update(bookingUtilityExist.bookingUtilityId, { quantity: utility.quantity });
          }
    } else {
      if(utility.quantity > 0) {
        const bookingUtility = this.bookingUtilityRepository.create({
          booking,
          utility: utilityExist,
          quantity: utility.quantity,
        });
        await this.bookingUtilityRepository.save(bookingUtility);
      }
    }
  }
    if (bookingStatus) {
      await this.bookingRepository.update(id, {bookingStatus});
    }
    return await this.findOne(id);
  }


  async remove(id: string) {
    const booking = await this.findOne(id);
    // xóa bookingUtility trước rồi mới xóa booking đc
    for(const bookingUtility of booking.bookingUtilities) {
      await this.bookingUtilityRepository.delete(bookingUtility.bookingUtilityId);
    }
    await this.bookingRepository.delete(id);
    return booking;
  }
}
