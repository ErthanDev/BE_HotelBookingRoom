import { IsNotEmpty } from "class-validator";

export class CreateSurchargeDto {
    @IsNotEmpty()
    surchargeName: string;

    @IsNotEmpty()
    surchargePercentage: number;
}
