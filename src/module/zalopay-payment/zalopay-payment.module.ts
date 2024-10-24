import { Module } from '@nestjs/common';
import { ZalopayPaymentService } from './zalopay-payment.service';
import { ZalopayPaymentController } from './zalopay-payment.controller';
import { PaymentModule } from 'src/module/payment/payment.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PaymentModule,
    MailModule,
  ],
  controllers: [ZalopayPaymentController],
  providers: [ZalopayPaymentService],
})
export class ZalopayPaymentModule { }
