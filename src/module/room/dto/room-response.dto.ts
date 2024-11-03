import { Expose, Type } from "class-transformer";
import { MetaResponseDto } from "src/core/meta-response.dto";
import { TypeRoomResponseDto } from "src/module/type-room/dto/type-room-response.dto";


export class RoomResponseDto {
    @Expose()
    id: number;   
    @Expose()                
    name: string;
    @Expose()                 
    pricePerDay: number;
    @Expose()           
    pricePerHour: number;
    @Expose()          
    interior: string;
    @Expose()              
    image: string;
    @Expose()                
    facilities: string;
    @Expose()   
    @Type(() => TypeRoomResponseDto  )
    typeRoom:TypeRoomResponseDto 
           
    @Expose()
    isBooked: boolean;
}

export class RoomsResponseDto {
    @Expose()
    rooms: RoomResponseDto[];
   
    @Expose()
    meta:MetaResponseDto;
  }