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
    constructor(amount: number, paymentMethod: PaymentMethod, bookingId: string, paymentId: string) {
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.bookingId = bookingId;
    }
}
