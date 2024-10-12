import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Discount } from './entities/discount.entity';
import { Repository } from 'typeorm';

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
    const take = +qs.limit || 10;
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;
    const keyword = qs.keyword || '';
    const defaultLimit = +qs.limit ? +qs.limit : 10;

    const totalItems = await this.discountRepository.count();

    const totalPages = Math.ceil(totalItems / defaultLimit);
    
    const [result, total] = await this.discountRepository.findAndCount({
        take: take || totalItems,
        skip: skip,
    });

    return {
      meta: {
        current: +qs.currentPage || 1,
        pageSize: +qs.limit,
        pages: totalPages,
        total: total,
    },
      result: result,
    };
  }

  async findOne(id: string) {
    const discount = await this.discountRepository.findOne({
      where: { discountId: id }
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
