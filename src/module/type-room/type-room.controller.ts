import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TypeRoomService } from './type-room.service';
import { CreateTypeRoomDto } from './dto/create-type-room.dto';
import { UpdateTypeRoomDto } from './dto/update-type-room.dto';
import { UserRole } from 'src/enum/userRole.enum';
import { Public, ResponseMessage, Roles, Serialize } from 'src/decorators/customize';
import { TypeRoomResponseDto, TypeRoomsResponseDto } from './dto/type-room-response.dto';

@Controller('type-rooms')
export class TypeRoomController {
  constructor(private readonly typeRoomService: TypeRoomService) {}

  @Post()
  @ResponseMessage('Create a room available successfully')
  @Serialize(TypeRoomResponseDto)
  @Roles(UserRole.Staff)
  create(@Body() createTypeRoomDto: CreateTypeRoomDto) {
    return this.typeRoomService.create(createTypeRoomDto);
  }

  @Get()
  @ResponseMessage('Get all room available successfully')
  @Public()
  @Serialize(TypeRoomsResponseDto)
  findAll(@Query() qs: any) {
    return this.typeRoomService.findAll(qs);
  }

  @Get(':id')
  @ResponseMessage('Get a room available successfully')
  @Public()
  @Serialize(TypeRoomResponseDto)
  findOne(@Param('id') id: string) {
    return this.typeRoomService.findOne(id);
  }

  @Patch(':id')
  @Serialize(TypeRoomResponseDto)
  @ResponseMessage('Update a room available successfully')
  @Public()
  update(@Param('id') id: string, @Body() updateTypeRoomDto: UpdateTypeRoomDto) {
    return this.typeRoomService.update(id, updateTypeRoomDto);
  }

  @Delete(':id')
  @Serialize(TypeRoomResponseDto)
  @ResponseMessage('Delete a room available successfully')
  @Public()
  remove(@Param('id') id: string) {
    return this.typeRoomService.remove(id);
  }
}
