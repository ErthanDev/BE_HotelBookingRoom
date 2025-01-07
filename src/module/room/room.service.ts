import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeRoom } from 'src/module/type-room/entities/type-room.entity';
import { BookingStatus } from 'src/enum/bookingStatus.enum';
import { plainToClass } from 'class-transformer';
import { MetaResponseDto } from 'src/core/meta-response.dto';
import { RoomResponseDto, RoomsResponseDto } from './dto/room-response.dto';

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
    const totalItems = await this.roomRepository.count();
    const take = +qs.limit || totalItems;  // Take all if qs.limit is empty
    const skip = (+qs.currentPage - 1) * take || 0;
    const keyword = qs.keyword || '';
  
    const totalPages = Math.ceil(totalItems / take);
  
    const [result, total] = await this.roomRepository.findAndCount({
      take,
      skip,
      relations: ['typeRoom', 'bookings'],
      where: {
        interior: keyword ? Like(`%${keyword}%`) : undefined,
      },
    });
  
    const room = plainToClass(RoomResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total,
    });
  
    return plainToClass(RoomsResponseDto, {
      meta: metaResponseDto,
      rooms: room,
    });
  }


  findOne(id: number) {
    return this.roomRepository.findOne({
      where: { id },
      relations: ['typeRoom'],
    });
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    // Tìm room theo id
    const room = await this.roomRepository.findOne({ where: { id } });

    if (!room) {
      throw new BadRequestException('Room not found');
    }

    // Nếu có `typeRoomId` trong DTO thì tìm `TypeRoom` tương ứng
    if (updateRoomDto.typeRoomId) {
      const typeRoom = await this.typeRoomRepository.findOne({
        where: { id: updateRoomDto.typeRoomId },
      });

      if (!typeRoom) {
        throw new BadRequestException('TypeRoom not found');
      }

      // Gán `typeRoom` vào đối tượng `room`
      room.typeRoom = typeRoom;
    }

    // Cập nhật các thuộc tính khác của `Room` từ `updateRoomDto`
    Object.assign(room, updateRoomDto);

    // Lưu room đã cập nhật
    return this.roomRepository.save(room);
  }

  remove(id: number) {
    return this.roomRepository.delete(id);
  }


  async getAvailableRooms(startTime: Date, endTime: Date, numberOfPeople: number, sortDirection: 'ASC' | 'DESC', qs: any) {
    const totalItems = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.bookings', 'booking')
      .leftJoinAndSelect('room.typeRoom', 'typeRoom')
      .where(
        '(booking.startTime IS NULL OR (booking.endTime <= :startTime OR booking.startTime >= :endTime))',
        { startTime, endTime }
      )
      .andWhere('typeRoom.maxPeople >= :numberOfPeople', { numberOfPeople })
      .orWhere('booking.bookingStatus NOT IN (:...statuses)', { statuses: [BookingStatus.Paid] })
      .getCount();
  
    const take = +qs.limit || totalItems;
    const skip = (+qs.currentPage - 1) * take || 0;
    const totalPages = Math.ceil(totalItems / take);
  
    const availableRooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.bookings', 'booking')
      .leftJoinAndSelect('room.typeRoom', 'typeRoom')
      .where(
        '(booking.startTime IS NULL OR (booking.endTime <= :startTime OR booking.startTime >= :endTime))',
        { startTime, endTime }
      )
      .andWhere('typeRoom.maxPeople >= :numberOfPeople', { numberOfPeople })
      .orWhere('booking.bookingStatus NOT IN (:...statuses)', { statuses: [BookingStatus.Paid] })
      .orderBy('room.pricePerDay', sortDirection)
      .take(take)
      .skip(skip)
      .getMany();
  
    const room = plainToClass(RoomResponseDto, availableRooms);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total: totalItems,
    });
  
    return plainToClass(RoomsResponseDto, {
      meta: metaResponseDto,
      rooms: room,
    });
  }

  async getRoomByTypeRoomId(typeRoomId: string, qs: any) {
    const typeRoom = await this.typeRoomRepository.findOne({
      where: { id: typeRoomId },
    });
  
    const totalItems = await this.roomRepository.count({
      where: { typeRoom },
    });
  
    const take = +qs.limit || totalItems;
    const skip = (+qs.currentPage - 1) * take || 0;
    const totalPages = Math.ceil(totalItems / take);
  
    const [result, total] = await this.roomRepository.findAndCount({
      take,
      skip,
      relations: ['typeRoom'],
      where: { typeRoom },
    });
  
    const room = plainToClass(RoomResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total,
    });
  
    return plainToClass(RoomsResponseDto, {
      meta: metaResponseDto,
      rooms: room,
    });
  }
  

  async getRoomAvailableNow(qs: any) {
    const now = new Date();
    const totalItems = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.bookings', 'booking')
      .where(
        '(booking.bookingId IS NULL OR (:now NOT BETWEEN booking.startTime AND booking.endTime))',
        { now }
      )
      .getCount();
  
    const take = +qs.limit || totalItems;
    const skip = (+qs.currentPage - 1) * take || 0;
    const totalPages = Math.ceil(totalItems / take);
  
    const availableRooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.bookings', 'booking')
      .where(
        '(booking.bookingId IS NULL OR (:now NOT BETWEEN booking.startTime AND booking.endTime))',
        { now }
      )
      .take(take)
      .skip(skip)
      .getMany();
  
    const room = plainToClass(RoomResponseDto, availableRooms);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total: totalItems,
    });
  
    return plainToClass(RoomsResponseDto, {
      meta: metaResponseDto,
      rooms: room,
    });
  }
}
