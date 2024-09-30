import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { Room } from './entities/room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeRoomModule } from 'src/type-room/type-room.module';
import { TypeRoom } from 'src/type-room/entities/type-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, TypeRoom])],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
