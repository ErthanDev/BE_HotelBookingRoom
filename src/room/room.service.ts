import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeRoom } from 'src/type-room/entities/type-room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
      
    @InjectRepository(TypeRoom)
    private typeRoomRepository: Repository<TypeRoom>,
  ) { }
  async create(createRoomDto: CreateRoomDto): Promise<Room> {
    // Tìm typeRoom dựa vào typeRoomId từ DTO
    const typeRoom = await this.typeRoomRepository.findOne({
      where: { id: createRoomDto.typeRoomId },
    });

    if (!typeRoom) {
      throw new Error('TypeRoom not found');
    }

    // Tạo đối tượng Room
    const room = this.roomRepository.create({
      ...createRoomDto,
      typeRoom: typeRoom, // Gán TypeRoom cho Room
    });

    return this.roomRepository.save(room); // Lưu Room vào DB
  }

  async findAll(qs: any) {
    const take = +qs.limit || 10;
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;
    const keyword = qs.keyword || '';
    const defaultLimit = +qs.limit ? +qs.limit : 10;
  
    // Đếm tổng số phòng
    const totalItems = await this.roomRepository.count();
  
    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);
  
    // Truy vấn danh sách phòng cùng với thông tin loại phòng (TypeRoom)
    const [result, total] = await this.roomRepository.findAndCount({
      take: take || totalItems,
      skip: skip,
      relations: ['typeRoom'], 
      where: {
        // Nếu có từ khóa tìm kiếm
        interior: keyword ? Like(`%${keyword}%`) : undefined, 
      }
    });
  
    // Trả về kết quả
    return {
      meta: {
        current: +qs.currentPage || 1,
        pageSize: +qs.limit,
        pages: totalPages,
        total: total
      },
      result
    };
  }
  

  findOne(id: number) {
    return this.roomRepository.findOne({
      where: { id },
    });
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
