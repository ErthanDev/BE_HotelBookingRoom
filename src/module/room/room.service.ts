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
      relations: ['typeRoom', 'bookings'],
      where: {
        // Nếu có từ khóa tìm kiếm
        interior: keyword ? Like(`%${keyword}%`) : undefined,
      }
    });

    // kiểm tra xem phòng có được đặt hay còn trống ở thời điểm hiện tại
    const currentTime = new Date();
    const roomsWithBookingStatus = result.map(room => {
      const isBooked = room.bookings.some(booking => 
          booking.startTime <= currentTime && booking.endTime >= currentTime
      );
      return {
          ...room,
          isBooked
      };
  });

    const room = plainToClass(RoomResponseDto, roomsWithBookingStatus);

    // const room = plainToClass(RoomResponseDto, result);
    // Trả về kết quả
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: +qs.limit || 10,
      pages: totalPages,
      total: total,
    });

    // Tạo RoomsResponseDto
    const roomsResponseDto = plainToClass(RoomsResponseDto, {
      meta: metaResponseDto,
      rooms: room,
    });
    console.log(result);
    return roomsResponseDto;
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
    const take = +qs.limit || 10; // Số lượng phòng trên mỗi trang
    const skip = (+qs.currentPage - 1) * take || 0; // Bỏ qua các kết quả của trang trước đó

    // Đếm tổng số phòng thỏa mãn điều kiện
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
      .getCount(); // Đếm số phòng thỏa mãn

    // Tính tổng số trang dựa trên tổng số phòng
    const totalPages = Math.ceil(totalItems / take);

    // Lấy danh sách phòng thỏa mãn điều kiện với phân trang
    const availableRooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.bookings', 'booking')
      .leftJoinAndSelect('room.typeRoom', 'typeRoom')
      .where(
        '(booking.startTime IS NULL OR (booking.endTime <= :startTime OR booking.startTime >= :endTime))',
        { startTime, endTime }
      )
      .andWhere('typeRoom.maxPeople >= :numberOfPeople', { numberOfPeople }) // Giới hạn số người
      .orWhere('booking.bookingStatus NOT IN (:...statuses)', { statuses: [ BookingStatus.Paid] }) // Điều kiện trạng thái booking
      .orderBy('room.pricePerDay', sortDirection) // Sắp xếp theo giá phòng
      .take(take) // Giới hạn số lượng phòng trên mỗi trang
      .skip(skip) // Bỏ qua các kết quả của trang trước đó
      .getMany();

    const room = plainToClass(RoomResponseDto, availableRooms);
    // Trả về kết quả
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: +qs.limit || 10,
      pages: totalPages,
      total: totalItems,
    });

    // Tạo RoomsResponseDto
    const roomsResponseDto = plainToClass(RoomsResponseDto, {
      meta: metaResponseDto,
      rooms: room,
    });
    return roomsResponseDto;
  }

  async getRoomByTypeRoomId(typeRoomId: string, qs: any) {
    const typeRoom = await this.typeRoomRepository.findOne({
      where: {
        id: typeRoomId
      }
    });
    const take = +qs.limit || 10;
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;
    const defaultLimit = +qs.limit ? +qs.limit : 10;



    // Tính tổng số trang
    const [result, total] = await this.roomRepository.findAndCount({
      take: take,
      skip: skip,
      relations: ['typeRoom'],
      where: {
        typeRoom: typeRoom
      },
    });
    const totalPages = Math.ceil(total / defaultLimit);

    const room = plainToClass(RoomResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: +qs.limit || 10,
      pages: totalPages,
      total: total,
    });

    // Tạo RoomsResponseDto
    const roomsResponseDto = plainToClass(RoomsResponseDto, {
      meta: metaResponseDto,
      rooms: room,
    });
    return roomsResponseDto
  }

  async getRoomAvailableNow(qs: any) {
    const now = new Date();
    const take = +qs.limit || 10;
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;

    const totalItems = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoin('room.bookings', 'booking')
      .where(
        '(booking.bookingId IS NULL OR (:now NOT BETWEEN booking.startTime AND booking.endTime))',
        { now }
      )
      .getCount();
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
    const totalPages = Math.ceil(totalItems / take);
    const room = plainToClass(RoomResponseDto, availableRooms);
    // Trả về kết quả
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: +qs.limit || 10,
      pages: totalPages,
      total: totalItems,
    });

    // Tạo RoomsResponseDto
    const roomsResponseDto = plainToClass(RoomsResponseDto, {
      meta: metaResponseDto,
      rooms: room,
    });
    return roomsResponseDto;
  }
}
