import { TypeBooking } from "src/enum/typeBooking.enum";

export class CreateMailDto {
    nameCustomer: string;
    startTime: Date;
    endTime: Date;
    typeBooking: TypeBooking ;
    numberOfPerson: number;
    totalPrice: number;
}