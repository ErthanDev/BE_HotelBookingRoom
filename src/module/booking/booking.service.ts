import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { In, Like, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Room } from '../room/entities/room.entity';
import { Utility } from '../utility/entities/utility.entity';

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
    await this.bookingRepository.save(booking);
    const { refreshToken,password, ...userWithoutToken } = booking.user;
    return {
      bookingId: booking.bookingId,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingStatus: booking.bookingStatus,
      bookingType: booking.bookingType,
      numberOfPerson: booking.numberOfGuest,
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
        relations: ['user', 'room'],
    });
    const fomattedResult = result.map((booking) => {
        const { refreshToken,password, ...userWithoutToken } = booking.user;
        return {
            bookingId: booking.bookingId,
            bookingDate: booking.bookingDate,
            startTime: booking.startTime,
            endTime: booking.endTime,
            bookingStatus: booking.bookingStatus,
            bookingType: booking.bookingType,
            numberOfPerson: booking.numberOfGuest,
            user: userWithoutToken,
            room: booking.room,
        };
    });
    
    return {
        meta: {
            current: +qs.currentPage || 1,
            pageSize: +qs.limit,
            pages: totalPages,
            total: total,
        },
        result: fomattedResult,
    };
  }

  async findOne(id: string) {
    const booking = await this.bookingRepository.findOne({
      where: { bookingId: id },
      relations: ['user', 'room']
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
      numberOfPerson: booking.numberOfGuest,
      user: userWithoutToken,
      room: booking.room,
    };
  }

  async findMyBooking(userId: string, qs: any) {
    const take = +qs.limit || 10;
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;
    const keyword = qs.keyword || '';
    const defaultLimit = +qs.limit ? +qs.limit : 10;

    const totalItems = await this.bookingRepository.count();

    const totalPages = Math.ceil(totalItems / defaultLimit);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    const [result, total] = await this.bookingRepository.findAndCount({
        take: take || totalItems,
        skip: skip,
        relations: ['user', 'room'],
        where: { user: user }
    });

    const fomattedResult = result.map((booking) => {
      const { refreshToken,password, ...userWithoutToken } = booking.user;
      return {
          bookingId: booking.bookingId,
          bookingDate: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          bookingStatus: booking.bookingStatus,
          bookingType: booking.bookingType,
          numberOfPerson: booking.numberOfGuest,
          user: userWithoutToken,
          room: booking.room,
      };
  });
  
  return {
      meta: {
          current: +qs.currentPage || 1,
          pageSize: +qs.limit,
          pages: totalPages,
          total: total,
      },
      result: fomattedResult,
  };
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
