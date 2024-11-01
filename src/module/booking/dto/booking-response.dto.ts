import { Expose, Type } from "class-transformer";
import { MetaResponseDto } from "src/core/meta-response.dto";
import { BookingUtilityResponseDto } from "src/module/booking-utility/dto/booking-utility.dto";
import { PaymentResponseDto } from "src/module/payment/dto/payment-response.dto";
import { RoomResponseDto } from "src/module/room/dto/room-response.dto";
import { UserResponseDto } from "src/module/users/dto/user-response.dto";

export class BookingResponseDto {
    @Expose()
    bookingId: string;
  
    @Expose()
    startTime: Date;
  
    @Expose()
    endTime: Date;
  
    @Expose()
    bookingType: string;
  
    @Expose()
    bookingStatus: string;
  
    @Expose()
    bookingDate: Date;
  
    @Expose()
    numberOfGuest: number;
  
    @Expose()
    @Type(() => UserResponseDto)
    user: UserResponseDto;
  
    @Expose()
    @Type(() => RoomResponseDto)
    room: RoomResponseDto;

    @Expose()
    @Type(() => BookingUtilityResponseDto)
    bookingUtilities: BookingUtilityResponseDto[];

    @Expose()
    @Type(() => PaymentResponseDto)
    payments: PaymentResponseDto[];
}  

    export class BookingsResponseDto {
    @Expose()
    bookings: BookingResponseDto[];
  
    @Expose()
    meta: MetaResponseDto;
}