import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SurchargeService } from './surcharge.service';
import { CreateSurchargeDto } from './dto/create-surcharge.dto';
import { UpdateSurchargeDto } from './dto/update-surcharge.dto';

@Controller('surcharge')
export class SurchargeController {
  constructor(private readonly surchargeService: SurchargeService) {}

  @Post()
  create(@Body() createSurchargeDto: CreateSurchargeDto) {
    return this.surchargeService.create(createSurchargeDto);
  }

  @Get()
  findAll() {
    return this.surchargeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surchargeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSurchargeDto: UpdateSurchargeDto) {
    return this.surchargeService.update(+id, updateSurchargeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surchargeService.remove(+id);
  }
}
