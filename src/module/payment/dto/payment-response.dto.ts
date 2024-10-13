import { Expose, Type } from "class-transformer";
import { MetaResponseDto } from "src/core/meta-response.dto";
import { PaymentMethod } from "src/enum/paymentMethod.enum";
import { PaymentStatus } from "src/enum/paymentStatus.enum";
import { BookingResponseDto } from "src/module/booking/dto/booking-response.dto";

export class PaymentResponseDto {
    @Expose()
    paymentId: string;

    @Expose()
    amount: number;

    @Expose()
    paymentDate: Date;

    @Expose()
    paymentStatus: PaymentStatus;

    @Expose()
    paymentMethod: PaymentMethod;

    @Expose()
    @Type(() => BookingResponseDto)
    booking:BookingResponseDto
}

export class PaymentsResponseDto {
    @Expose()
    payments: PaymentResponseDto[];

    @Expose()
    meta:MetaResponseDto;
}