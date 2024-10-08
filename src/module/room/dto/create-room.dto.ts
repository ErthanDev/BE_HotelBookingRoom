import { IsNotEmpty } from "class-validator";

export class CreateRoomDto {
    @IsNotEmpty()
    id: number;

    @IsNotEmpty()
    pricePerDay: number;

    @IsNotEmpty()
    pricePerHour: number;

    @IsNotEmpty()
    interior: string;

    @IsNotEmpty()
    name: string;
    
    @IsNotEmpty()
    image: string;

    @IsNotEmpty()
    facilities: string;

    @IsNotEmpty()
    typeRoomId: string;
}
