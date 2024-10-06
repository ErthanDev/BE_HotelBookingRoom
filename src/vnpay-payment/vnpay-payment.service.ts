import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VnpayService } from 'nestjs-vnpay';
import { VerifyReturnUrl, VnpLocale } from 'vnpay';
import * as moment from "moment";
import { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';
import { PaymentMethod } from 'src/enum/paymentMethod.enum';
import { PaymentService } from 'src/payment/payment.service';

@Injectable()
export class VnpayPaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private configService: ConfigService,
    private paymentService: PaymentService,
  ) {}
  async buildPaymentUrl(req:any ) {
    const transID = Math.floor(Math.random() * 1000000);
    const bookingId = req.body.bookingId;
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: req.body.amount,
      vnp_IpAddr:
          req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.ip,
      vnp_TxnRef:`${moment().format('YYMMDD')}_${transID}` ,
      vnp_OrderInfo: `Payment for booking room, bookingId: ${bookingId}`,
      vnp_ReturnUrl: `${this.configService.get<string>('VNPAY_RETURN_URL')}`,
      vnp_Locale: VnpLocale.VN,
    });

    return  {paymentUrl};
  }


  async handleVnpayReturn(req:any) {
    let verify: VerifyReturnUrl;
    try {
        verify = await this.vnpayService.verifyReturnUrl(req.query);
        if (!verify.isVerified) {
            throw new BadRequestException('Data integrity verification failed');
        }
        if (!verify.isSuccess) {
          
            throw new BadRequestException('Payment failed');
        }
    } catch (error) {
      throw new BadRequestException('Payment failed');
    }
    const orderInfo = verify.vnp_OrderInfo;
    const bookingId = orderInfo.split('bookingId: ')[1];
    const paymentDto = new CreatePaymentDto(+verify.vnp_Amount, PaymentMethod.Vnpay,bookingId, verify.vnp_TxnRef);
    console.log("Dto"+paymentDto.bookingId);
    const newPayment = await this.paymentService.createPayment(paymentDto);
    return {payment: newPayment};
  }
}
