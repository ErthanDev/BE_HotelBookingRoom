import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { VnpayPaymentService } from './vnpay-payment.service';
import { Public, ResponseMessage } from 'src/decorators/customize';

@Controller('vnpay')
export class VnpayPaymentController {
  constructor(private readonly vnpayPaymentService: VnpayPaymentService) {}

  @Post()
  @ResponseMessage('Create vnpay payment url success')
  async buildPaymentUrl(@Req() req) {
    return this.vnpayPaymentService.buildPaymentUrl(req);
  }

  @Get('return')
  @ResponseMessage('Create vnpay payment success')
  @Public()
  async handleVnpayReturn(@Req() req:any,@Res() res:any) {
    try{
      await this.vnpayPaymentService.handleVnpayReturn(req);
      return res.redirect('facebook.com');
    }
    catch(error){
      return res.redirect('youtube.com');
    }
  }
}
