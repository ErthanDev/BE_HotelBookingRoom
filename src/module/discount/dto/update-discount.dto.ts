import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscountDto } from './create-discount.dto';
import { IsNotEmpty } from 'class-validator';
import { DiscountStatus } from "../../../enum/discountStatus.enum";


export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {
    @IsNotEmpty()
    discountStatus: DiscountStatus;
}
