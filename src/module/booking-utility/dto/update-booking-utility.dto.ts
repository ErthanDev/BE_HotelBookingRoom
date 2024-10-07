import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingUtilityDto } from './create-booking-utility.dto';

export class UpdateBookingUtilityDto extends PartialType(CreateBookingUtilityDto) {}
