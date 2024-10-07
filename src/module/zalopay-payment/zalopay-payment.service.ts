import { BadRequestException, Injectable } from '@nestjs/common';
import * as moment from "moment";
import axios from 'axios';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from 'src/module/payment/payment.service';
import { CreatePaymentDto } from 'src/module/payment/dto/create-payment.dto';
import { PaymentMethod } from 'src/enum/paymentMethod.enum';

@Injectable()
export class ZalopayPaymentService {
  constructor(
    private configService: ConfigService,
    private paymentService: PaymentService
  ) { }
  private config = {
    app_id: this.configService.get<string>('ZALOPAY_APP_ID'),
    key1: this.configService.get<string>('ZALOPAY_KEY1'),
    key2: this.configService.get<string>('ZALOPAY_KEY2'),
    endpoint: this.configService.get<string>('ZALOPAY_ENDPOINT')
  };
  async createZaloPayPayment(req: any) {

    const embed_data = {
      redirecturl: this.configService.get<string>('ZALOPAY_REDIRECT_URL'),
      bookingId: req.body.bookingId,
      discountCode: req.body.discountCode
    };

    const items = [{}];
    const transID = Math.floor(Math.random() * 1000000);
    const order = {
      app_id: this.config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: "The Élégance Hotel",
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: req.body.amount,
      description: `The Élégance Hotel - Payment for the booking #${transID}`,
      bank_code: "",
      callback_url: `${this.configService.get<string>('ZALOPAY_CALLBACK_URL')}`,
      mac: ""
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data = this.config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = this.createSecureHash(data, this.config.key1)

    try {
      const result = await axios.post(this.config.endpoint, null, { params: order });
      return result.data;
    }
    catch (error) {
      console.log(error);
    }

  }
  createSecureHash(notEncodeData: string, key: string) {
    return crypto.createHmac('sha256', key).update(notEncodeData).digest('hex');
  }

  async callBackZaloPay(req: any) {
    let result = {
      return_code: 1,
      return_message: "success",
      payment: ""
    };

    try {
      let dataStr = req.body.data;
      let reqMac = req.body.mac;

      let mac = this.createSecureHash(dataStr, this.config.key2);
      console.log("mac =", mac);


      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = "mac not equal";
        throw new BadRequestException("mac not equal");
      }
      else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng
        let dataJson = JSON.parse(dataStr);
        const embedDataJson = JSON.parse(dataJson['embed_data']);

        const bookingId = embedDataJson['bookingId'];
        const discountCode = embedDataJson['discountCode'];
        const paymentDto = new CreatePaymentDto(+dataJson['amount'], PaymentMethod.ZaloPay, bookingId, dataJson['app_trans_id'], discountCode);

        const newPayment = await this.paymentService.createPayment(paymentDto);
        result.payment = JSON.stringify(newPayment);
        result.return_code = 1;
        result.return_message = "success";
      }
    } catch (ex) {
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = ex.message;
      return result;
    }

    // thông báo kết quả cho ZaloPay server
    console.log("result =", result);
    return result;
  }

}

// update order's status = success where app_trans_id = {
//   app_id: 2554,
//   app_trans_id: '241005_19260',
//   app_time: 1728140514887,
//   app_user: 'The Élégance Hotel',
//   amount: 100000,
//   embed_data: '{"redirecturl":"https://www.youtube.com"}',
//   item: '[{}]',
//   zp_trans_id: 241005000003365,
//   server_time: 1728140571807,
//   channel: 39,
//   merchant_user_id: '4n2LtVGwMfjZhIs7wv82hA',
//   zp_user_id: '4n2LtVGwMfjZhIs7wv82hA',
//   user_fee_amount: 0,
//   discount_amount: 0
// }