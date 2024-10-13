import { Expose, Type } from "class-transformer";
import { UtilityResponseDto } from "src/module/utility/dto/utility-response.dto";

export class BookingUtilityResponseDto {
    @Expose()
    quantity: number;

    @Expose()
    @Type(() => UtilityResponseDto)
    utility: UtilityResponseDto;


}