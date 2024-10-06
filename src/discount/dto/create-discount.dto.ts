import { IsNotEmpty } from "class-validator";

export class CreateDiscountDto {
    @IsNotEmpty()
    discountName: string;
    
    @IsNotEmpty()
    discountPercentage: number;
}
