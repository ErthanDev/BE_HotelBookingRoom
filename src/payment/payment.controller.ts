import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Public, ResponseMessage } from 'src/decorators/customize';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }


  @Post('vnpay')
  @ResponseMessage('Create vnpay payment url success')
  @Public()
  async buildPaymentUrl(@Req() req) {
    return this.paymentService.buildPaymentUrl(req);
  }

  @Get('vnpay-return')
  @ResponseMessage('Create vnpay payment success')
  @Public()
  async handleVnpayReturn(@Req() req:any) {
    return this.paymentService.handleVnpayReturn(req);
  }
}
