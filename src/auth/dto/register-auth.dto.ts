import { IsEmail, IsNotEmpty, Length } from "class-validator";

export class RegisterUserDto {
    @Length(1,50,{message:"Name is too long"})
    name: string;
    @IsEmail({},{message:"Invalid email"})
    email: string;
    @Length(10,10,{message:"Phone number is invalid"})
    phoneNumber: string;
    @Length(6,20,{message:"Password is too short"})
    password: string;
    @IsNotEmpty()
    address: string;
}