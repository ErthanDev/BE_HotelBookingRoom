import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VnpayService } from 'nestjs-vnpay';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { Discount } from 'src/discount/entities/discount.entity';
import { Surcharge } from 'src/surcharge/entities/surcharge.entity';
import { DiscountStatus } from 'src/enum/discountStatus.enum';
import { BookingStatus } from 'src/enum/bookingStatus.enum';
import { MailService } from 'src/mail/mail.service';
import { TypeBooking } from 'src/enum/typeBooking.enum';
import { CreateMailDto } from 'src/mail/dto/create-mail.dto';


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
    private mailService: MailService
  ) {}
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { bookingId, amount, paymentMethod, discountCode } = createPaymentDto;

    // Tìm booking
    const booking = await this.bookingRepository.findOne({ where: { bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    booking.bookingStatus= BookingStatus.Paid;
    await this.bookingRepository.save(booking);
    // Tìm discount nếu có
    if (discountCode) {
      let discount = await this.discountRepository.findOne({ where: { discountCode } });
      if (!discount) {
        throw new NotFoundException('Discount not found');
      }
      else{
        if(discount.discountStatus==DiscountStatus.Unavailable){
          throw new BadRequestException('Discount is not available');
        }
        else if(discount.validFrom>new Date()){
          throw new BadRequestException('Discount is not available');
        }
        else if(discount.validTo<new Date()){
          throw new BadRequestException('Discount is not available');
        }
      }
      discount.discountStatus=DiscountStatus.Unavailable;
      await this.discountRepository.save(discount);
    }


    // Tạo payment
    const payment = this.paymentRepository.create({
      amount,
      paymentMethod,
      booking,
    });
    let total:number
    if(booking.bookingType==TypeBooking.Daily){
      const startTime=booking.startTime.getTime();
      const endTime=booking.endTime.getTime();
      total=booking.room.pricePerDay*(Math.abs((endTime-startTime)/(1000*60*60)));
    }
    else{
      const startTime=booking.startTime.getTime();
      const endTime=booking.endTime.getTime();
      total=booking.room.pricePerDay*(Math.floor(Math.abs((endTime-startTime)/(1000*60*60*24))));
    }
    const mailInfo:CreateMailDto= new CreateMailDto(booking.user.email,booking.user.name,booking.startTime,booking.endTime,booking.bookingType,booking.numberOfGuest,total);
    await this.mailService.sendMail(mailInfo)
    return await this.paymentRepository.save(payment);
  }
}
