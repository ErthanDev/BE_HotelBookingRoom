import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BookingUtilityService } from './booking-utility.service';
import { CreateBookingUtilityDto } from './dto/create-booking-utility.dto';
import { UpdateBookingUtilityDto } from './dto/update-booking-utility.dto';

@Controller('booking-utility')
export class BookingUtilityController {
  constructor(private readonly bookingUtilityService: BookingUtilityService) {}

  @Post()
  create(@Body() createBookingUtilityDto: CreateBookingUtilityDto) {
    return this.bookingUtilityService.create(createBookingUtilityDto);
  }

  @Get()
  findAll() {
    return this.bookingUtilityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingUtilityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingUtilityDto: UpdateBookingUtilityDto) {
    return this.bookingUtilityService.update(+id, updateBookingUtilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingUtilityService.remove(+id);
  }
}
