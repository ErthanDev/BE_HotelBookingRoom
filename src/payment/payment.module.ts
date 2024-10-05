import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
        envFilePath: '.env',
    }),
    TypeOrmModule.forFeature([Payment]),
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
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
