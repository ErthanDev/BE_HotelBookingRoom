import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TypeRoomService } from './type-room.service';
import { CreateTypeRoomDto } from './dto/create-type-room.dto';
import { UpdateTypeRoomDto } from './dto/update-type-room.dto';

@Controller('type-rooms')
export class TypeRoomController {
  constructor(private readonly typeRoomService: TypeRoomService) {}

  @Post()
  create(@Body() createTypeRoomDto: CreateTypeRoomDto) {
    return this.typeRoomService.create(createTypeRoomDto);
  }

  @Get()
  findAll(@Query() qs: any) {
    return this.typeRoomService.findAll(qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeRoomService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTypeRoomDto: UpdateTypeRoomDto) {
    return this.typeRoomService.update(id, updateTypeRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeRoomService.remove(id);
  }
}
