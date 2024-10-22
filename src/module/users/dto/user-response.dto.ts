import { Expose } from "class-transformer";

export class UserResponseDto {
    @Expose()
    id: string;
    @Expose()
    name: string;
    @Expose()
    email: string;
    @Expose()
    phoneNumber: string;
    @Expose()
    address: string;
    @Expose()
    gender:string;
    @Expose()
    role: string;
}