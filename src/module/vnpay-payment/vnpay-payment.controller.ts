import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { VnpayPaymentService } from './vnpay-payment.service';
import { Public, ResponseMessage, Serialize } from 'src/decorators/customize';
import { PaymentResponseDto } from '../payment/dto/payment-response.dto';

@Controller('vnpay')
export class VnpayPaymentController {
  constructor(private readonly vnpayPaymentService: VnpayPaymentService) {}

  @Post()
  @ResponseMessage('Create vnpay payment url success')
  async buildPaymentUrl(@Req() req) {
    return this.vnpayPaymentService.buildPaymentUrl(req);
  }

  @Get('ipn')
  @ResponseMessage('Ipn vnpay payment success')
  @Serialize(PaymentResponseDto)
  @Public()
  async handleVnpayReturn(@Req() req:any,@Res() res:any) {
    console.log(req.query);
    try{
      return await this.vnpayPaymentService.handleVnpayIpn(req);
    }
    catch(error){
      console.log(error);
    }
  }
}
