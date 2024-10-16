import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Public, ResponseMessage, Roles, Serialize, User } from 'src/decorators/customize';
import { use } from 'passport';
import { UserRole } from 'src/enum/userRole.enum';
import { IUser } from '../users/user.interface';
import { BookingResponseDto, BookingsResponseDto } from './dto/booking-response.dto';
import { BookingStatus } from 'src/enum/bookingStatus.enum';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @Post()
  @ResponseMessage('Booking created successfully')
  @Serialize(BookingResponseDto)
  create(@Body() createBookingDto: CreateBookingDto, @User() user: IUser) {
    createBookingDto.userId = user.id;
    return this.bookingService.createMyBooking(createBookingDto);
  }

  @Get('findAll')
  @Serialize(BookingsResponseDto)
  @ResponseMessage('Booking fetched successfully')
  @Roles(UserRole.Staff)
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
  @Roles(UserRole.Staff)
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

  @Get('findBookingByStatus')
  @Serialize(BookingsResponseDto)
  @Roles(UserRole.Staff)
  @ResponseMessage('Booking fetched successfully')
  findBookingByStatus(@Query('status') status: BookingStatus, @Query() qs: any) {
    return this.bookingService.findBookingByStatus(status, qs);
  }


  @Get('findBookingToday')
  @Serialize(BookingsResponseDto)
  @ResponseMessage('Booking fetched successfully')
  findBookingToday(@Query() qs: any) {
    return this.bookingService.findBookingToday(qs);
  }
}
