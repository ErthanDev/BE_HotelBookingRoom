import e from "express";
import { TypeBooking } from "src/enum/typeBooking.enum";

export class CreateMailDto {
    email: string;
    nameCustomer: string;
    startTime: Date;
    endTime: Date;
    typeBooking: TypeBooking ;
    numberOfPerson: number;
    totalPrice: number;

    constructor(email:string,nameCustomer: string, startTime: Date, endTime: Date, typeBooking: TypeBooking, numberOfPerson: number, totalPrice: number) {
        this.nameCustomer = nameCustomer;
        this.startTime = startTime;
        this.endTime = endTime;
        this.typeBooking = typeBooking;
        this.numberOfPerson = numberOfPerson;
        this.totalPrice = totalPrice
        this.email = email
    }
}