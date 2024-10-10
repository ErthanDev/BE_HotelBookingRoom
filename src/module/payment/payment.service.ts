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
import { PaymentStatus } from 'src/enum/paymentStatus.enum';


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

  async refundPayment(paymentId: string) {
    const payment = await this.paymentRepository.findOne({ where: { paymentId },relations: ['booking'] });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
  
    const booking = await this.bookingRepository.findOne({ where: { bookingId: payment.booking.bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
  
    const now = new Date();  // Lấy ngày hiện tại
    const startTime = new Date(booking.startTime);  // Lấy thời gian bắt đầu của booking
  
    // Tính khoảng cách ngày giữa ngày hiện tại và startTime
    const diffTime = startTime.getTime() - now.getTime();
    const daysUntilStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));  // Chuyển đổi mili giây thành ngày
  
    let refundPercentage = 0;  // Tỷ lệ hoàn tiền mặc định là 0%
  
    if (daysUntilStart >= 7) {
      refundPercentage = 100;  // Hoàn 100% nếu startTime cách ngày hiện tại 7 ngày trở lên
    } else if (daysUntilStart >= 3) {
      refundPercentage = 50;  // Hoàn 50% nếu startTime cách ngày hiện tại 3-6 ngày
    } else {
      refundPercentage = 0;  // Không hoàn nếu startTime cách ngày hiện tại dưới 3 ngày
    }
  
    // Cập nhật trạng thái booking và payment
    booking.bookingStatus = BookingStatus.Cancelled;
    await this.bookingRepository.save(booking);
    
    payment.paymentStatus = PaymentStatus.Refund;
    payment.amount = payment.amount-(payment.amount * refundPercentage / 100 ); // Tính lại số tiền hoàn
    await this.paymentRepository.save(payment);
  
    return {
      paymentId: payment.paymentId,
      paymentStatus: payment.paymentStatus,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      booking: {
        bookingId: booking.bookingId,
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingType: booking.bookingType,
        bookingStatus: booking.bookingStatus,
        bookingDate: booking.bookingDate,
        numberOfGuest: booking.numberOfGuest,
      },
    };
  }
  

  async findAll() {
    return await this.paymentRepository.find();
  }
}
