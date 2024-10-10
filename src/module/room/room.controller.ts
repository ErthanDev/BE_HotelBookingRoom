import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Public, ResponseMessage, Roles } from 'src/decorators/customize';
import { UserRole } from 'src/enum/userRole.enum';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ResponseMessage('Create a room available successfully')
  @Roles(UserRole.Staff)
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  @ResponseMessage('Get all room available successfully')
  @Public()
  findAll(@Query() qs:any) {
    return this.roomService.findAll(qs);
  }

  @Get(':id')
  @ResponseMessage('Get a room available successfully')
  @Public()
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(+id);
  }

  @Patch(':id')
  @ResponseMessage('Update room available successfully')
  @Roles(UserRole.Staff)
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(+id, updateRoomDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete room available successfully')
  @Roles(UserRole.Staff)
  remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }

  @Get('available/room')
  @ResponseMessage('Get room available successfully')
  @Public()
  getRoomAvailable(@Query('startTime') starTime:Date, @Query('endTime') endTime:Date, @Query('numberOfPeople') numberOfPeople:number, @Query('sort') sort:'ASC' | 'DESC') {
    return this.roomService.getAvailableRooms(starTime, endTime, numberOfPeople, sort);
  }

  @Get('type-room/:id')
  @ResponseMessage('Get room by type room successfully')
  @Public()
  getRoomByTypeRoom(@Param('id') id: string) {
    return this.roomService.getRoomByTypeRoomId(id);
  }
}
