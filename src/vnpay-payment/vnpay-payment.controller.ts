import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { VnpayPaymentService } from './vnpay-payment.service';
import { CreateVnpayPaymentDto } from './dto/create-vnpay-payment.dto';
import { UpdateVnpayPaymentDto } from './dto/update-vnpay-payment.dto';
import { Public, ResponseMessage } from 'src/decorators/customize';

@Controller('vnpay')
export class VnpayPaymentController {
  constructor(private readonly vnpayPaymentService: VnpayPaymentService) {}

  @Post()
  @ResponseMessage('Create vnpay payment url success')
  @Public()
  async buildPaymentUrl(@Req() req) {
    return this.vnpayPaymentService.buildPaymentUrl(req);
  }

  @Get('return')
  @ResponseMessage('Create vnpay payment success')
  @Public()
  async handleVnpayReturn(@Req() req:any) {
    return this.vnpayPaymentService.handleVnpayReturn(req);
  }
}
