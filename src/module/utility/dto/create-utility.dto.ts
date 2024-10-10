import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateUtilityDto {
    @IsNotEmpty()
    utilityName: string;

    @IsNotEmpty()
    utilityPrice: number;
}
