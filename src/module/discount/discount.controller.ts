import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Query } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Public, ResponseMessage, Roles, Serialize } from 'src/decorators/customize';
import { UserRole } from 'src/enum/userRole.enum';
import { DiscountResponseDto, DiscountsResponseDto } from './dto/discount-response.dto';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @Serialize(DiscountResponseDto)
  @Roles(UserRole.Staff)
  @ResponseMessage('Discount created successfully')
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @Get()
  @Roles(UserRole.Staff)
  @Serialize(DiscountsResponseDto)
  @ResponseMessage('Discount fetched successfully')
  findAll(@Query() qs: any) {
    return this.discountService.findAll(qs);
  }

  @Get(':id')
  @Roles(UserRole.Staff)
  @Serialize(DiscountResponseDto)
  @ResponseMessage('Discount fetched successfully')
  findOne(@Param('id') id: string) {
    return this.discountService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.Staff)
  @Serialize(DiscountResponseDto)
  @ResponseMessage('Discount updated successfully')
  update(@Param('id') id: string, @Body() updateDiscountDto: UpdateDiscountDto) {
    
    return this.discountService.update(id, updateDiscountDto);
  }

  @Delete(':id')
  @Serialize(DiscountResponseDto)
  @Roles(UserRole.Staff)
  @ResponseMessage('Discount deleted successfully')
  remove(@Param('id') id: string) {
    return this.discountService.remove(id);
  }
}
