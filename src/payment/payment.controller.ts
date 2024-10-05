import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Public, ResponseMessage } from 'src/decorators/customize';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }


 
}
