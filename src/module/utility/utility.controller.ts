import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { ResponseMessage } from 'src/decorators/customize';

@Controller('utility')
export class UtilityController {
  constructor(private readonly utilityService: UtilityService) {}

  @Post()
  @ResponseMessage('Utility created successfully')
  create(@Body() createUtilityDto: CreateUtilityDto) {
    return this.utilityService.create(createUtilityDto);
  }

  @Get()
  findAll(@Query() qs: any) {
    return this.utilityService.findAll(qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.utilityService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Utility updated successfully')
  update(@Param('id') id: string, @Body() updateUtilityDto: UpdateUtilityDto) {
    return this.utilityService.update(id, updateUtilityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.utilityService.remove(id);
  }
}
