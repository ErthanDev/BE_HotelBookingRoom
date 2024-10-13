import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ZalopayPaymentService } from './zalopay-payment.service';

import { Public, ResponseMessage, Serialize } from 'src/decorators/customize';
import { PaymentResponseDto } from '../payment/dto/payment-response.dto';

@Controller('zalopay-payment')
export class ZalopayPaymentController {
  constructor(private readonly zalopayPaymentService: ZalopayPaymentService) {}

  @Post()
  @ResponseMessage('Get url zalopay payment successfully')
  zaloPayGateway(@Req() req:any) {
   return this.zalopayPaymentService.createZaloPayPayment(req);
  }

  @Post('/callback')
  @Serialize(PaymentResponseDto)
  @Public()
  @ResponseMessage('Create zalopay payment successfully')
  callback(@Req() req) {
    return this.zalopayPaymentService.callBackZaloPay(req);
  }
}
