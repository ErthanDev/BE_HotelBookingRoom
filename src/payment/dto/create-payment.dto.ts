import { PaymentMethod } from "src/enum/paymentMethod.enum";
import { Payment } from "../entities/payment.entity";
import { IsNotEmpty } from "class-validator";
import { PaymentStatus } from "src/enum/paymentStatus.enum";

export class CreatePaymentDto {
    paymentId: string;  
    @IsNotEmpty()
    amount: number;
    @IsNotEmpty()
    paymentMethod: PaymentMethod;
    
    paymentStatus: PaymentStatus;
    @IsNotEmpty()
    bookingId: string;

    discountCode: string;
    constructor(amount: number, paymentMethod: PaymentMethod, bookingId: string, paymentId: string,discountCode: string) {
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.bookingId = bookingId;
        this.paymentId = paymentId;
        this.discountCode = discountCode;
    }
}
