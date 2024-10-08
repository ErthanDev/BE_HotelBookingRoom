import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsNotEmpty } from 'class-validator';
import { BookingStatus } from 'src/enum/bookingStatus.enum';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
    @IsNotEmpty()
    bookingStatus: BookingStatus;
}
