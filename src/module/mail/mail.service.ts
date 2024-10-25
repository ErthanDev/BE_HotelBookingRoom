import { Injectable } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';
import { CreateMailDto } from './dto/create-mail.dto';
import { TypeBooking } from 'src/enum/typeBooking.enum';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) { }
  formatDate(date: Date, typeBooking: TypeBooking): string {
    if (typeBooking === TypeBooking.Daily) {
      return date.toLocaleDateString('vi-VN'); // Date only
    } else if (typeBooking === TypeBooking.Hourly) {
      return date.toLocaleString('vi-VN'); // Date with time
    }
    return date.toString(); // Default
  }
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND'
    });
  }

  async sendMail(createMailDto: CreateMailDto) {
    const formattedStartTime = this.formatDate(createMailDto.startTime, createMailDto.typeBooking);
    const formattedEndTime = this.formatDate(createMailDto.endTime, createMailDto.typeBooking);
    const total = this.formatPrice(createMailDto.totalPrice);
    await this.mailService.sendMail({
      to: createMailDto.email, // list of receivers
      from: 'The Élégance Hotel', // override default from 
      subject: 'Cảm ơn quý khách đã lựa chọn và tin tưởng dịch vụ đặt phòng của chúng tôi!',
      template: 'mail-template', // HTML body content 
      context: {
        nameCustomer: createMailDto.nameCustomer,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        typeBooking: createMailDto.typeBooking,
        numberOfPerson: createMailDto.numberOfPerson,
        totalPrice: total, 
      }
    });
  }
}
