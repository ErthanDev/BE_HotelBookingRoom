import { Expose, Type } from "class-transformer";
import { BookingResponseDto } from "src/module/booking/dto/booking-response.dto";
import { UserResponseDto } from "src/module/users/dto/user-response.dto";

export class ReviewResponseDto {
    @Expose()
    reviewId: string;

    @Expose()
    rating: number;

    @Expose()
    comment: string;

    @Expose()
    @Type(() => BookingResponseDto)
    booking: BookingResponseDto

    @Expose()
    @Type(() => UserResponseDto)
    user: UserResponseDto
}