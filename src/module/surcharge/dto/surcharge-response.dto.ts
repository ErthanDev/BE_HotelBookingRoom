import { Expose } from "class-transformer";
import { MetaResponseDto } from "src/core/meta-response.dto";

export class SurchargeResponseDto {
    @Expose()
    surchargeId: string;

    @Expose()
    surchargeName: string;

    @Expose()
    surchargePercentage: number;
}

export class SurchargesResponseDto {
    @Expose()
    meta: MetaResponseDto;

    @Expose()
    surcharges: SurchargeResponseDto[];
}