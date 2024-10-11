import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeRoom } from 'src/module/type-room/entities/type-room.entity';
import { BookingStatus } from 'src/enum/bookingStatus.enum';

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
      throw new BadRequestException('TypeRoom not found');
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
    return this.roomRepository.update(id, updateRoomDto);
  }

  remove(id: number) {
    return this.roomRepository.delete(id);
  }


  async getAvailableRooms(startTime: Date, endTime: Date, numberOfPeople: number, sortDirection: 'ASC' | 'DESC'): Promise<Room[]> {
    const availableRooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.bookings', 'booking')
      .leftJoinAndSelect('room.typeRoom', 'typeRoom')
      .where(
        'booking.startTime IS NULL OR (booking.endTime <= :startTime OR booking.startTime >= :endTime)',
        { startTime, endTime },
      )
      .andWhere('typeRoom.maxPeople >= :numberOfPeople', { numberOfPeople })
      .orWhere('booking.bookingStatus NOT IN (:...statuses)', { statuses: [BookingStatus.Unpaid, BookingStatus.Paid] })
      .orderBy('room.pricePerDay', sortDirection)  // Sắp xếp theo số lượng người tối đa
      .getMany();
  
    return availableRooms;
  }
  
  async getRoomByTypeRoomId(typeRoomId: string) {
    const typeRoom = await this.typeRoomRepository.findOne({
      where: {
        id: typeRoomId
      }
    });
    return this.roomRepository.find({
      where: {
         typeRoom: typeRoom
      },
    });
  } 
}
