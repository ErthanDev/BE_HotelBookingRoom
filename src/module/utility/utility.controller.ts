import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { Public, ResponseMessage, Serialize } from 'src/decorators/customize';
import { UtilitiesResponseDto, UtilityResponseDto } from './dto/utility-response.dto';

@Controller('utility')
export class UtilityController {
  constructor(private readonly utilityService: UtilityService) {}

  @Post()
  @ResponseMessage('Utility created successfully')
  @Serialize(UtilityResponseDto)
  create(@Body() createUtilityDto: CreateUtilityDto) {
    return this.utilityService.create(createUtilityDto);
  }

  @Get()
  @Serialize(UtilitiesResponseDto)
  @ResponseMessage('Get all utilities created successfully')
  findAll(@Query() qs: any) {
    return this.utilityService.findAll(qs);
  }

  @Get(':id')
  @Serialize(UtilityResponseDto)
  @ResponseMessage('Get a utility created successfully')
  findOne(@Param('id') id: string) {
    return this.utilityService.findOne(id);
  }

  @Patch(':id')
  @Serialize(UtilityResponseDto)
  @ResponseMessage('Utility updated successfully')
  update(@Param('id') id: string, @Body() updateUtilityDto: UpdateUtilityDto) {
    return this.utilityService.update(id, updateUtilityDto);
  }

  @Delete(':id')
  @Serialize(UtilityResponseDto)
  @ResponseMessage('Utility deleted successfully')
  remove(@Param('id') id: string) {
    return this.utilityService.remove(id);
  }
}
