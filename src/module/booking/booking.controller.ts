import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ResponseMessage, Roles } from 'src/decorators/customize';
import { use } from 'passport';
import { UserRole } from 'src/enum/userRole.enum';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ResponseMessage('Booking created successfully')
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.create(createBookingDto);
  }

  @Get()
  @Roles(UserRole.Staff)
  @ResponseMessage('Booking fetched successfully')
  findAll(@Query() qs: any) {
    return this.bookingService.findAll(qs);
  }

  @Get(':id')
  @ResponseMessage('Booking fetched successfully')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Booking updated fetch successfully')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @ResponseMessage('Booking deleted successfully')
  @Roles(UserRole.Staff)
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
