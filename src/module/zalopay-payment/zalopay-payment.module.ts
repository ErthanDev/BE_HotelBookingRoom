import { Module } from '@nestjs/common';
import { ZalopayPaymentService } from './zalopay-payment.service';
import { ZalopayPaymentController } from './zalopay-payment.controller';
import { PaymentModule } from 'src/module/payment/payment.module';

@Module({
  imports: [
    PaymentModule
  ],
  controllers: [ZalopayPaymentController],
  providers: [ZalopayPaymentService],
})
export class ZalopayPaymentModule { }
