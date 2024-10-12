import { Expose } from "class-transformer";
import { MetaResponseDto } from "src/core/meta-response.dto";

export class UtilityResponseDto {
    @Expose()
    utilityId: string;

    @Expose()
    utilityName: string;

    @Expose()
    utilityPrice: number;
}

export class UtilitiesResponseDto {
    @Expose()
    utilities: UtilityResponseDto[];

    @Expose()
    meta: MetaResponseDto;
}