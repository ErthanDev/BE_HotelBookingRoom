import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Public, ResponseMessage, Roles, Serialize, User } from 'src/decorators/customize';
import { use } from 'passport';
import { UserRole } from 'src/enum/userRole.enum';
import { IUser } from '../users/user.interface';
import { BookingResponseDto, BookingsResponseDto } from './dto/booking-response.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  @ResponseMessage('Booking created successfully')
  @Serialize(BookingResponseDto)
  create(@Body() createBookingDto: CreateBookingDto, @User() user: IUser) {
    createBookingDto.userId = user.id;
    return this.bookingService.create(createBookingDto);
  }

  @Get('findAll')
  @Serialize(BookingsResponseDto)
  @ResponseMessage('Booking fetched successfully')
  findAll(@Query() qs: any) {
    return this.bookingService.findAll(qs);
  }

  @Get('findById/:id')
  @ResponseMessage('Booking fetched successfully')
  @Serialize(BookingResponseDto)
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Get('findMyBooking')
  @Serialize(BookingsResponseDto)
  @ResponseMessage('Booking fetched successfully')
  findMyBooking(@User() user: IUser, @Query() qs: any) {
    return this.bookingService.findMyBooking(user.id, qs);
  }

  @Patch(':id')
  @Serialize(BookingResponseDto)
  @ResponseMessage('Booking updated fetch successfully')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @Serialize(BookingResponseDto)
  @ResponseMessage('Booking deleted successfully')
  @Roles(UserRole.Staff)
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
