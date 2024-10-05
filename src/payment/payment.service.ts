import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { VnpayService } from 'nestjs-vnpay';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}
  async createPayment(createPaymentDto: CreatePaymentDto) {
    const newPayment = await this.paymentRepository.create(createPaymentDto);
    return this.paymentRepository.save(newPayment);
  }
}
