import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { Public, ResponseMessage, Roles, Serialize } from 'src/decorators/customize';
import { UtilitiesResponseDto, UtilityResponseDto } from './dto/utility-response.dto';
import { UserRole } from 'src/enum/userRole.enum';

@Controller('utility')
export class UtilityController {
  constructor(private readonly utilityService: UtilityService) {}

  @Post()
  @ResponseMessage('Utility created successfully')
  @Serialize(UtilityResponseDto)
  @Roles(UserRole.Staff)
  create(@Body() createUtilityDto: CreateUtilityDto) {
    return this.utilityService.create(createUtilityDto);
  }

  @Get()
  @Serialize(UtilitiesResponseDto)
  @ResponseMessage('Get all utilities created successfully')
  @Roles(UserRole.Staff)
  findAll(@Query() qs: any) {
    return this.utilityService.findAll(qs);
  }

  @Get(':id')
  @Serialize(UtilityResponseDto)
  @ResponseMessage('Get a utility created successfully')
  @Roles(UserRole.Staff)
  findOne(@Param('id') id: string) {
    return this.utilityService.findOne(id);
  }

  @Patch(':id')
  @Serialize(UtilityResponseDto)
  @ResponseMessage('Utility updated successfully')
  @Roles(UserRole.Staff)
  update(@Param('id') id: string, @Body() updateUtilityDto: UpdateUtilityDto) {
    return this.utilityService.update(id, updateUtilityDto);
  }

  @Delete(':id')
  @Serialize(UtilityResponseDto)
  @ResponseMessage('Utility deleted successfully')
  @Roles(UserRole.Staff)
  remove(@Param('id') id: string) {
    return this.utilityService.remove(id);
  }
}
