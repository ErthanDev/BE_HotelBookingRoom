import { PartialType } from '@nestjs/mapped-types';
import { CreateVnpayPaymentDto } from './create-vnpay-payment.dto';

export class UpdateVnpayPaymentDto extends PartialType(CreateVnpayPaymentDto) {}
