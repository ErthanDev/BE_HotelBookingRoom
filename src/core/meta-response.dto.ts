import { Expose } from "class-transformer";

export class MetaResponseDto {
    @Expose()
    current: number;
    @Expose()
    pageSize: number;
    @Expose()
    pages: number;
    @Expose()
    total: number
}