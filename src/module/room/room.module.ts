import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room } from './entities/room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeRoomModule } from 'src/module/type-room/type-room.module';
import { TypeRoom } from 'src/module/type-room/entities/type-room.entity';
import { Booking } from '../booking/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, TypeRoom,Booking])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule { }
