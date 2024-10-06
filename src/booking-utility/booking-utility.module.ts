import { Module } from '@nestjs/common';
import { BookingUtilityService } from './booking-utility.service';
import { BookingUtilityController } from './booking-utility.controller';

@Module({
  controllers: [BookingUtilityController],
  providers: [BookingUtilityService],
})
export class BookingUtilityModule {}
