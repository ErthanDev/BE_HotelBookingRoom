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
    const { bookingId, amount, paymentMethod, discountCode, paymentId } = createPaymentDto;

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

    // Tạo payment
    const payment = this.paymentRepository.create({
      paymentId: paymentId,
      amount,
      paymentMethod,
      booking,
    });
    const savedPayment = await this.paymentRepository.save(payment);

    // Gửi email không đồng bộ
    // Đưa vào queue thực hiện ngay khi có thể

    // Extract user information without refreshToken

    return savedPayment
  }
  async createPaymentByCash(createPaymentDto: CreatePaymentDto) {
    const { bookingId, amount, paymentMethod } = createPaymentDto

    const booking = await this.bookingRepository.findOne({
      where: { bookingId },
      relations: ['user'],
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Tạo payment
    const payment = this.paymentRepository.create({
      amount,
      paymentMethod,
      booking,
    });

    payment.paymentStatus = PaymentStatus.Success
    const savedPayment = await this.paymentRepository.save(payment);

    return savedPayment;
  }


  async refundPayment(bookingId: string) {
    const booking = await this.bookingRepository.findOne({ where: { bookingId } })
    const payment = await this.paymentRepository.findOne({ where: { booking }, relations: ['booking'] });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (payment.paymentStatus === PaymentStatus.Refund) {
      throw new BadRequestException('Payment has been refunded');
    }
    if (payment.paymentStatus === PaymentStatus.Failed) {
      return;
    }
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
    payment.amount = payment.amount - (payment.amount * refundPercentage / 100); // Tính lại số tiền hoàn
    return await this.paymentRepository.save(payment);
  }



  async getRevenueByDay(startDate: string) {
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("DATE(payment.paymentDate)", "date")  // Group by day
      .addSelect("SUM(payment.amount)", "totalRevenue")  // Sum revenue for each day
      .where("payment.paymentDate BETWEEN :startDate AND :endDate", {
        startDate: new Date(startDate),
        endDate: new Date(),
      })
      .groupBy("DATE(payment.paymentDate)")  // Group by day
      .orderBy("DATE(payment.paymentDate)", "ASC")  // Order by date in ascending order
      .getRawMany();
  
    return payments;
  }
  
  async getRevenueByMonth(year: number) {
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("DATE_FORMAT(payment.paymentDate, '%Y-%m')", "month")  // Group by month
      .addSelect("SUM(payment.amount)", "totalRevenue")  // Sum revenue for each month
      .where("YEAR(payment.paymentDate) = :year", { year })
      .groupBy("DATE_FORMAT(payment.paymentDate, '%Y-%m')")  // Group by month
      .orderBy("DATE_FORMAT(payment.paymentDate, '%Y-%m')", "ASC")  // Order by month in ascending order
      .getRawMany();
  
    return payments;
  }
  
  async getRevenueByYear() {
    const payments = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("YEAR(payment.paymentDate)", "year")  // Group by year
      .addSelect("SUM(payment.amount)", "totalRevenue")  // Sum revenue for each year
      .groupBy("YEAR(payment.paymentDate)")  // Group by year
      .orderBy("YEAR(payment.paymentDate)", "ASC")  // Order by year in ascending order
      .getRawMany();
  
    return payments;
  }
  

  async findOne(id: string) {
    return this.paymentRepository.findOne(
      {
        where: { paymentId: id },
        relations: ['booking', 'booking.user']
      }
    );
  }

  async updateStatus(paymentId: string, status: PaymentStatus) {
    const payment = await this.paymentRepository.findOne({ where: { paymentId }, relations: ['booking', 'booking.user'] });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    const booking = await this.bookingRepository.findOne({ where: { bookingId: payment.booking.bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    payment.paymentStatus = status;
    const newPayment = await this.paymentRepository.save(payment);
    if (newPayment.paymentStatus === PaymentStatus.Success) {
      setTimeout(async () => {
        const mailInfo: CreateMailDto = new CreateMailDto(
          payment.booking.user.email,
          payment.booking.user.name,
          payment.booking.startTime,
          payment.booking.endTime,
          payment.booking.bookingType,
          payment.booking.numberOfGuest,
          payment.amount,
        );
        await this.mailService.sendMail(mailInfo);
      }, 0);
      booking.bookingStatus = BookingStatus.Paid;
      await this.bookingRepository.save(booking);
    }
    return newPayment;
  }

}
