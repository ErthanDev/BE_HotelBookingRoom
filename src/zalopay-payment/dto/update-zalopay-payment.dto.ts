import { PartialType } from '@nestjs/mapped-types';
import { CreateZalopayPaymentDto } from './create-zalopay-payment.dto';

export class UpdateZalopayPaymentDto extends PartialType(CreateZalopayPaymentDto) {}
