import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './module/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthModule } from './module/auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeRoomModule } from './module/type-room/type-room.module';
import { RoomModule } from './module/room/room.module';
import { MailModule } from './module/mail/mail.module';
import { PaymentModule } from './module/payment/payment.module';
import { SurchargeModule } from './module/surcharge/surcharge.module';
import { VnpayPaymentModule } from './module/vnpay-payment/vnpay-payment.module';
import { ZalopayPaymentModule } from './module/zalopay-payment/zalopay-payment.module';
import { BookingModule } from './module/booking/booking.module';
import { DiscountModule } from './module/discount/discount.module';

import { UtilityModule } from './module/utility/utility.module';


@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('HOST'),
        port: +configService.get<string>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS') || null,
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/../**/*.entity.js'],
        synchronize: true,
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TypeRoomModule,
    RoomModule,
    MailModule,
    PaymentModule,
    SurchargeModule,
    VnpayPaymentModule,
    ZalopayPaymentModule,
    BookingModule,
    DiscountModule,
    UtilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) { }
}
