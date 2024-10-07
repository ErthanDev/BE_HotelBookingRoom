import { Module } from '@nestjs/common';
import { VnpayPaymentService } from './vnpay-payment.service';
import { VnpayPaymentController } from './vnpay-payment.controller';
import { VnpayModule } from 'nestjs-vnpay';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentModule } from 'src/module/payment/payment.module';
import { PaymentService } from 'src/module/payment/payment.service';

@Module({
  imports: [
    PaymentModule,
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secureSecret: configService.getOrThrow<string>('VNPAY_HASHSECRET'),
        tmnCode: configService.getOrThrow<string>('VNPAY_TMNCODE'),
        vnpayHost: configService.getOrThrow<string>('VNPAY_HOST'),
        testMode: true,
        enableLog: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [VnpayPaymentController],
  providers: [VnpayPaymentService],
})
export class VnpayPaymentModule { }
