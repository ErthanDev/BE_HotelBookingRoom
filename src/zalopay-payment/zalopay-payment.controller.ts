import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ZalopayPaymentService } from './zalopay-payment.service';
import { CreateZalopayPaymentDto } from './dto/create-zalopay-payment.dto';
import { UpdateZalopayPaymentDto } from './dto/update-zalopay-payment.dto';
import { Public } from 'src/decorators/customize';

@Controller('zalopay-payment')
export class ZalopayPaymentController {
  constructor(private readonly zalopayPaymentService: ZalopayPaymentService) {}

  @Post()
  @Public()
  zaloPayGateway(@Req() req:any) {
   return this.zalopayPaymentService.createZaloPayPayment(req);
  }

  @Post('/callback')
  @Public()
  callback(@Req() req) {
    return this.zalopayPaymentService.callBackZaloPay(req);
  }
}
