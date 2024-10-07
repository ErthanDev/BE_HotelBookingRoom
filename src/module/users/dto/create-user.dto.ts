import { IsEmail, IsEmpty, IsNotEmpty, Length } from "class-validator";
import { UserRole } from "src/enum/userRole.enum";


export class CreateUserDto {
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
    @IsNotEmpty()
    gender: boolean;
    @IsNotEmpty()
    role: UserRole;
}


