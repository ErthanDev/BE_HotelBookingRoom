import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Room } from '../room/entities/room.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
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
    return booking;
  }

  findAll() {
    return `This action returns all booking`;
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
