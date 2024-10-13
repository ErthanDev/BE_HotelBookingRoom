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
  @Public()
  @Serialize(PaymentResponseDto)
  refund(@Param('id') id: string) {
    return this.paymentService.refundPayment(id);
  }
  
  @Post()
  @ResponseMessage('Create payment successfully')
  @Serialize(PaymentResponseDto)
  @Public()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }


  @Get('revenue/daily')
  @Roles(UserRole.Staff)
  @ResponseMessage('Get daily revenue successfully')
  getDailyRevenue(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.paymentService.getRevenueByDay(startDate, endDate);
  }

  @Get('revenue/monthly')
  @Roles(UserRole.Staff)
  @ResponseMessage('Get monthly revenue successfully')
  getMonthlyRevenue(@Query('year') year:number) {
    return this.paymentService.getRevenueByMonth(year);
  }

  @Get('revenue/yearly')
  @Roles(UserRole.Staff)
  @ResponseMessage('Get yearly revenue successfully')
  @Public()
  getYearlyRevenue() {
    return this.paymentService.getRevenueByYear();
  }
}
