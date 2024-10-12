import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsNotEmpty } from 'class-validator';
import { BookingStatus } from 'src/enum/bookingStatus.enum';
import { Utility } from 'src/module/utility/entities/utility.entity';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
    @IsNotEmpty()
    bookingStatus: BookingStatus;

    utilityId: string;

    bookingUtilities: Utility;
}
