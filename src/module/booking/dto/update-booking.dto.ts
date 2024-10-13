import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsArray, IsNotEmpty, Min, ValidateNested } from 'class-validator';
import { BookingStatus } from 'src/enum/bookingStatus.enum';
import { Utility } from 'src/module/utility/entities/utility.entity';
import { Type } from 'class-transformer';

class UtilityDto {
    @IsNotEmpty()
    utilityId: string;
  
    @Min(0)
    quantity: number;
  }

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
    bookingStatus: BookingStatus;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UtilityDto)
  utilities: UtilityDto[];
}
