import { IsNotEmpty } from "class-validator";
import { RoomStatus } from "src/enum/roomStatus.enum";

export class CreateRoomDto {
    @IsNotEmpty()
    id: number;

    @IsNotEmpty()
    pricePerDay: number;

    @IsNotEmpty()
    pricePerHour: number;

    
    status: RoomStatus;

    @IsNotEmpty()
    interior: string;

    @IsNotEmpty()
    image: string;

    @IsNotEmpty()
    facilities: string;

    @IsNotEmpty()
    typeRoomId: string;
}
