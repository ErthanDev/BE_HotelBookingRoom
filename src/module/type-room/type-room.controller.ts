import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TypeRoomService } from './type-room.service';
import { CreateTypeRoomDto } from './dto/create-type-room.dto';
import { UpdateTypeRoomDto } from './dto/update-type-room.dto';
import { UserRole } from 'src/enum/userRole.enum';
import { Public, ResponseMessage, Roles } from 'src/decorators/customize';

@Controller('type-rooms')
export class TypeRoomController {
  constructor(private readonly typeRoomService: TypeRoomService) {}

  @Post()
  @ResponseMessage('Create a room available successfully')
  @Roles(UserRole.Staff)
  create(@Body() createTypeRoomDto: CreateTypeRoomDto) {
    return this.typeRoomService.create(createTypeRoomDto);
  }

  @Get()
  @ResponseMessage('Get all room available successfully')
  @Public()
  findAll(@Query() qs: any) {
    return this.typeRoomService.findAll(qs);
  }

  @Get(':id')
  @ResponseMessage('Get a room available successfully')
  @Public()
  findOne(@Param('id') id: string) {
    return this.typeRoomService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a room available successfully')
  @Roles(UserRole.Staff)
  update(@Param('id') id: string, @Body() updateTypeRoomDto: UpdateTypeRoomDto) {
    return this.typeRoomService.update(id, updateTypeRoomDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete a room available successfully')
  @Roles(UserRole.Staff)
  remove(@Param('id') id: string) {
    return this.typeRoomService.remove(id);
  }
}
