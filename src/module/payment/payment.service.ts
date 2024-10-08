import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { Booking } from 'src/module/booking/entities/booking.entity';
import { Discount } from 'src/module/discount/entities/discount.entity';
import { DiscountStatus } from 'src/enum/discountStatus.enum';
import { BookingStatus } from 'src/enum/bookingStatus.enum';
import { MailService } from 'src/module/mail/mail.service';
import { CreateMailDto } from 'src/module/mail/dto/create-mail.dto';


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
  ) { }
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const { bookingId, amount, paymentMethod, discountCode } = createPaymentDto;
  
    // Tìm discount nếu có
    if (discountCode) {
      let discount = await this.discountRepository.findOne({ where: { discountCode } });
      if (!discount) {
        throw new NotFoundException('Discount not found');
      } else {
        if (discount.discountStatus == DiscountStatus.Unavailable) {
          throw new BadRequestException('Discount is not available');
        } else if (discount.validFrom > new Date()) {
          throw new BadRequestException('Discount is not available');
        } else if (discount.validTo < new Date()) {
          throw new BadRequestException('Discount is not available');
        }
      }
      discount.discountStatus = DiscountStatus.Unavailable;
      await this.discountRepository.save(discount);
    }
  
    // Tìm booking
    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ['user'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    booking.bookingStatus = BookingStatus.Paid;
    await this.bookingRepository.save(booking);
  
    // Tạo payment
    const payment = this.paymentRepository.create({
      amount,
      paymentMethod,
      booking,
    });
    const savedPayment = await this.paymentRepository.save(payment);

    // Gửi email không đồng bộ
    setTimeout(async () => {
      const mailInfo: CreateMailDto = new CreateMailDto(
        booking.user.email,
        booking.user.name,
        booking.startTime,
        booking.endTime,
        booking.bookingType,
        booking.numberOfGuest,
        amount
      );
      await this.mailService.sendMail(mailInfo);
    }, 0);  // Đưa vào queue thực hiện ngay khi có thể

    // Extract user information without refreshToken
    const { refreshToken,password, ...userWithoutToken } = booking.user;

    return {
      amount: savedPayment.amount,
      paymentMethod: savedPayment.paymentMethod,
      booking: {
        bookingId: booking.bookingId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingType: booking.bookingType,
        bookingStatus: booking.bookingStatus,
        bookingDate: booking.bookingDate,
        numberOfGuest: booking.numberOfGuest,
        user: userWithoutToken, 
      },
      paymentId: savedPayment.paymentId,
      paymentDate: savedPayment.paymentDate,
      paymentStatus: savedPayment.paymentStatus,
    };
  }
}
