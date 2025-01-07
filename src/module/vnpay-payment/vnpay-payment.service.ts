import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VnpayService } from 'nestjs-vnpay';
import { InpOrderAlreadyConfirmed, IpnFailChecksum, IpnInvalidAmount, IpnOrderNotFound, IpnSuccess, IpnUnknownError, VerifyReturnUrl, VnpLocale } from 'vnpay';
import { CreatePaymentDto } from 'src/module/payment/dto/create-payment.dto';
import { PaymentMethod } from 'src/enum/paymentMethod.enum';
import { PaymentService } from 'src/module/payment/payment.service';
import { PaymentStatus } from 'src/enum/paymentStatus.enum';
import { MailService } from '../mail/mail.service';
import { CreateMailDto } from '../mail/dto/create-mail.dto';
const moment = require('moment');
@Injectable()
export class VnpayPaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    private configService: ConfigService,
    private paymentService: PaymentService,
    private mailService: MailService
  ) { }
  async buildPaymentUrl(req: any) {
    const transID = Math.floor(Math.random() * 1000000);
    const bookingId = req.body.bookingId;
    const discountCode = req.body.discountCode;
    const txnRef = `${moment().format('YYMMDD')}_${transID}`;
    const paymentUrl = this.vnpayService.buildPaymentUrl({
      vnp_Amount: req.body.amount,
      vnp_IpAddr:
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip,
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Payment for booking room, bookingId: ${bookingId}, discountCode: ${discountCode}`,
      vnp_ReturnUrl: `${this.configService.get<string>('VNPAY_RETURN_URL')}`,
      vnp_Locale: VnpLocale.VN,
    });
  const paymentDto = new CreatePaymentDto(+req.body.amount, PaymentMethod.Vnpay, bookingId, txnRef, discountCode);
  await this.paymentService.createPayment(paymentDto);
    return { paymentUrl };
  }


  async handleVnpayIpn(req: any) {
    try {
      const verify: VerifyReturnUrl = await this.vnpayService.verifyIpnCall(req.query);
      if (!verify.isVerified) {

          return IpnFailChecksum;
      }

      // Tìm đơn hàng trong database của bạn
      console.log
      const foundOrder = await this.paymentService.findOne(verify.vnp_TxnRef); // Hàm tìm đơn hàng theo id, bạn cần tự cài đặt
      console.log("payment:"+foundOrder)
      // Nếu không tìm thấy đơn hàng hoặc mã đơn hàng không khớp
      if (!foundOrder || verify.vnp_TxnRef !== foundOrder.paymentId) {

          return IpnOrderNotFound;
      }

      // Nếu số tiền thanh toán không khớp
      if (verify.vnp_Amount !== foundOrder.amount) {

          return IpnInvalidAmount;
      }

      // Nếu đơn hàng đã được xác nhận trước đó
      if (foundOrder.paymentStatus === PaymentStatus.Success) {

          return InpOrderAlreadyConfirmed;
      }

      /**
       * Sau khi xác thực đơn hàng hoàn tất,
       * bạn có thể cập nhật trạng thái đơn hàng trong database của bạn
       */
      console.log("user1"+foundOrder.booking.user.email)
      
      await this.paymentService.updateStatus(foundOrder.paymentId,PaymentStatus.Success); 

      // Sau đó cập nhật trạng thái về cho VNPay biết rằng bạn đã xác nhận đơn hàng
      return IpnSuccess;
  } catch (error) {
      /**
       * Xử lí lỗi ngoại lệ
       * Ví dụ như không đủ dữ liệu, dữ liệu không hợp lệ, cập nhật database thất bại
       */
      console.log(`verify error: ${error}`);
      return IpnUnknownError;
  }
  
    // return newPayment;
  }
    
}
