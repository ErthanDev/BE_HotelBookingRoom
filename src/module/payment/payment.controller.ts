import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Public, ResponseMessage, Roles, Serialize } from 'src/decorators/customize';
import { UserRole } from 'src/enum/userRole.enum';
import { PaymentResponseDto, PaymentsResponseDto } from './dto/payment-response.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) { }

  @Patch(':id')
  @ResponseMessage('Refund successfully')
  @Serialize(PaymentResponseDto)
  refund(@Param('id') id: string) {
    return this.paymentService.refundPayment(id);
  }

  @Post()
  @ResponseMessage('Create payment successfully')
  @Serialize(PaymentResponseDto)
  @Roles(UserRole.Staff)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }


  @Get('revenue/daily')
  @Roles(UserRole.Staff)
  @ResponseMessage('Get daily revenue successfully')
  getDailyRevenue(@Query('startDate') startDate: string) {
    return this.paymentService.getRevenueByDay(startDate);
  }

  @Get('revenue/monthly')
  @Roles(UserRole.Staff)
  @ResponseMessage('Get monthly revenue successfully')
  getMonthlyRevenue(@Query('year') year: number) {
    return this.paymentService.getRevenueByMonth(year);
  }

  @Get('revenue/yearly')
  @Roles(UserRole.Staff)
  @ResponseMessage('Get yearly revenue successfully')
  getYearlyRevenue() {
    return this.paymentService.getRevenueByYear();
  }
}
