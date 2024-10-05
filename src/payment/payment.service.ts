import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VnpayService } from 'nestjs-vnpay';
import { VerifyReturnUrl, VnpLocale } from 'vnpay';
import * as moment from "moment";
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { PaymentMethod } from 'src/enum/paymentMethod.enum';


@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const newPayment = await this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(newPayment);
  }

  

  async buildPaymentUrl(req:any ) {
    const transID = Math.floor(Math.random() * 1000000);
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: req.body.amount,
      vnp_IpAddr:
          req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress ||
          req.socket.remoteAddress ||
          req.ip,
      vnp_TxnRef:`${moment().format('YYMMDD')}_${transID}` ,
      vnp_OrderInfo: `Payment for booking room`,
      vnp_ReturnUrl: this.configService.get<string>('VNPAY_RETURN_URL'),
      vnp_Locale: VnpLocale.VN,
    });

    return  {paymentUrl};
  }


  async handleVnpayReturn(req:any) {
    let verify: VerifyReturnUrl;
    try {
        
        verify = await this.vnpayService.verifyReturnUrl(req.query);
        if (!verify.isVerified) {
            return {message: 'Data integrity verification failed'};
        }
        if (!verify.isSuccess) {
          
            return {message: 'Payment failed'};
        }
    } catch (error) {
        return {message: 'Payment failed'};
    }
    const paymentDto = new CreatePaymentDto(+verify.vnp_Amount, PaymentMethod.Vnpay,"123", verify.vnp_TxnRef);
    const newPayment = await this.createPayment(paymentDto);
    return {payment: newPayment};
  }
}
