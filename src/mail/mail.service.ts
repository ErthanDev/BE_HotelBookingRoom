import { Injectable } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';
import { CreateMailDto } from './dto/create-mail.dto';
import { TypeBooking } from 'src/enum/typeBooking.enum';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) { }
  async sendMail(createMailDto: CreateMailDto) {
    await this.mailService.sendMail({
      to: createMailDto.email, // list of receivers
      from: 'Élégance', // override default from 
      subject: 'Cảm ơn quý khách đã lựa chọn và tin tưởng dịch vụ đặt phòng của chúng tôi!',
      template: 'mail-template', // HTML body content 
      context: {
        nameCustomer: createMailDto.nameCustomer,
        startTime: createMailDto.startTime,
        endTime: createMailDto.endTime,
        typeBooking: createMailDto.typeBooking,
        numberOfPerson: createMailDto.numberOfPerson,
        totalPrice: createMailDto.totalPrice,
      }
    });
  }
}
