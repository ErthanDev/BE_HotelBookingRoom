import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { DiscountResponseDto, DiscountsResponseDto } from './dto/discount-response.dto';
import { MetaResponseDto } from '../../core/meta-response.dto';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto) {
    const save = this.discountRepository.create(createDiscountDto);
    await this.discountRepository.save(save);
    return save;
  }

  async findAll(qs: any) {
    const totalItems = await this.discountRepository.count();
    const take = qs.limit ? +qs.limit : totalItems; // Lấy tất cả bản ghi nếu qs.limit rỗng
    const skip = qs.currentPage ? (+qs.currentPage - 1) * take : 0;
    const totalPages = Math.ceil(totalItems / take);

    const [result, total] = await this.discountRepository.findAndCount({
      take,
      skip,
    });

    const discounts = plainToClass(DiscountResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: take,
      pages: totalPages,
      total,
    });

    const response = plainToClass(DiscountsResponseDto, {
      meta: metaResponseDto,
      discounts,
    });

    return response;
  }

  async findOne(code: string) {
    const discount = await this.discountRepository.findOne({
      where: { discountCode: code },
    });
    if (!discount) {
      throw new NotFoundException('Discount not found');
    }
    return discount;
  }

  async update(id: string, updateDiscountDto: UpdateDiscountDto) {
    await this.findOne(id);
    await this.discountRepository.update(id, updateDiscountDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.discountRepository.delete(id);
  }
}
