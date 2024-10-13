import { Expose } from "class-transformer";
import { MetaResponseDto } from "src/core/meta-response.dto";

export class TypeRoomResponseDto {
    @Expose()
    id: string;                    // ID của loại phòng (UUID)
    @Expose()
    name: string;                  // Tên loại phòng
    @Expose()
    introduction: string;          // Giới thiệu ngắn về loại phòng
    @Expose()
    highlight: string;             // Những điểm nổi bật của phòng
    @Expose()
    sizeRoom: number;              // Kích thước phòng
    @Expose()
    beds: string;                  // Số lượng và loại giường
    @Expose()
    maxPeople: number;             // Số lượng người tối đa
    @Expose()
    image: string;                 // Hình ảnh loại phòng
}

export class TypeRoomsResponseDto {
    @Expose()
    typeRooms: TypeRoomResponseDto[];

    @Expose()
    meta: MetaResponseDto;
}