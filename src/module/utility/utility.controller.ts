import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { ResponseMessage, Roles } from 'src/decorators/customize';
import { UserRole } from 'src/enum/userRole.enum';

@Controller('utility')
export class UtilityController {
  constructor(private readonly utilityService: UtilityService) {}

  @Post()
  @ResponseMessage('Utility created successfully')
  @Roles(UserRole.Staff)
  create(@Body() createUtilityDto: CreateUtilityDto) {
    return this.utilityService.create(createUtilityDto);
  }

  @Get()
  @ResponseMessage('Utility fetched successfully')
  @Roles(UserRole.Staff)
  findAll(@Query() qs: any) {
    return this.utilityService.findAll(qs);
  }

  @Get(':id')
  @ResponseMessage('Utility fetched successfully')
  @Roles(UserRole.Staff)
  findOne(@Param('id') id: string) {
    return this.utilityService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Utility updated successfully')
  @Roles(UserRole.Staff)
  update(@Param('id') id: string, @Body() updateUtilityDto: UpdateUtilityDto) {
    return this.utilityService.update(id, updateUtilityDto);
  }

  @Delete(':id')
  @ResponseMessage('Utility deleted successfully')
  @Roles(UserRole.Staff)
  remove(@Param('id') id: string) {
    return this.utilityService.remove(id);
  }
}
