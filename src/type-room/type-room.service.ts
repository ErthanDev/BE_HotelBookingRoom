import { Injectable } from '@nestjs/common';
import { CreateTypeRoomDto } from './dto/create-type-room.dto';
import { UpdateTypeRoomDto } from './dto/update-type-room.dto';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeRoom } from './entities/type-room.entity';

@Injectable()
export class TypeRoomService {
  constructor(
    @InjectRepository(TypeRoom)
    private typeRoomRepository: Repository<TypeRoom>
  ) { }
  create(createTypeRoomDto: CreateTypeRoomDto) {
    const newTypeRoom = this.typeRoomRepository.create(createTypeRoomDto);

    return this.typeRoomRepository.save(newTypeRoom);
  }

  async findAll(qs: any) {
    const take = +qs.limit || 10
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0
    const keyword = qs.keyword || ''
    const defaultLimit = +qs.limit ? +qs.limit : 10
    const totalItems = await this.typeRoomRepository.count({
      where: { name: Like('%' + keyword + '%') }
    });

    const totalPages = Math.ceil(totalItems / defaultLimit);

    const [result, total] = await this.typeRoomRepository.findAndCount(
      {
        take: take || totalItems,
        skip: skip
      }
    );
    
    return {
      meta: {
        current: +qs.currentPage || 1,
        pageSize: +qs.limit,
        pages: totalPages,
        total: total
      },
      result
    }
  }

 async findOne(id: string) {
    const typeRoom = await this.typeRoomRepository.findOne({
      where: { id },
    });

    // Nếu không tìm thấy typeRoom, trả về lỗi 404
    if (!typeRoom) {
      return null;
    }
    return typeRoom;
  }

  update(id: string, updateTypeRoomDto: UpdateTypeRoomDto) {
    return `This action updates a #${id} typeRoom`;
  }

  remove(id: string) {
    return `This action removes a #${id} typeRoom`;
  }
}
