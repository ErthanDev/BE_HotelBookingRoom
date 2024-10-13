import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../room/entities/room.entity';
import { User } from '../users/entities/user.entity';
import { Utility } from '../utility/entities/utility.entity';
import { BookingUtility } from '../booking-utility/entities/booking-utility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Room, User, Utility, BookingUtility])],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
