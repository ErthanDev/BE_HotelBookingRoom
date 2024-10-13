import { Injectable } from '@nestjs/common';
import { CreateBookingUtilityDto } from './dto/create-booking-utility.dto';
import { UpdateBookingUtilityDto } from './dto/update-booking-utility.dto';

@Injectable()
export class BookingUtilityService {
  create(createBookingUtilityDto: CreateBookingUtilityDto) {
    
    return 'This action adds a new bookingUtility';
  }

  findAll() {
    return `This action returns all bookingUtility`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookingUtility`;
  }

  update(id: number, updateBookingUtilityDto: UpdateBookingUtilityDto) {
    return `This action updates a #${id} bookingUtility`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookingUtility`;
  }
}
