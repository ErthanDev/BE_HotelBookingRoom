import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/module/booking/entities/booking.entity';
import { Discount } from 'src/module/discount/entities/discount.entity';
import { Surcharge } from 'src/module/surcharge/entities/surcharge.entity';
import { MailModule } from 'src/module/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forFeature([Payment, Booking, Discount]),
    MailModule

  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule { }
