import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSurchargeDto } from './dto/create-surcharge.dto';
import { UpdateSurchargeDto } from './dto/update-surcharge.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Surcharge } from './entities/surcharge.entity';
import { plainToClass } from 'class-transformer';
import { SurchargeResponseDto, SurchargesResponseDto } from './dto/surcharge-response.dto';
import { MetaResponseDto } from 'src/core/meta-response.dto';

@Injectable()
export class SurchargeService {
  constructor(
    @InjectRepository(Surcharge)
    private surchargeRepository: Repository<Surcharge>,
  ) { }

  async create(createSurchargeDto: CreateSurchargeDto) {
    const save = this.surchargeRepository.create(createSurchargeDto);
    return await this.surchargeRepository.save(save);;
  }

  async findAll(qs: any) {
    const take = +qs.limit || 10;
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;
    const defaultLimit = +qs.limit ? +qs.limit : 10;

    const totalItems = await this.surchargeRepository.count();

    const totalPages = Math.ceil(totalItems / defaultLimit);

    const [result, total] = await this.surchargeRepository.findAndCount({
      take: take || totalItems,
      skip: skip,
    });
    const surcharges = plainToClass(SurchargeResponseDto, result);
    const metaResponseDto = plainToClass(MetaResponseDto, {
      current: +qs.currentPage || 1,
      pageSize: +qs.limit || 10,
      pages: totalPages,
      total: total,
    });
    const response = plainToClass(SurchargesResponseDto, {
      meta: metaResponseDto,
      surcharges: surcharges
    })
    return response;
  }

  async findOne(id: string) {
    const surcharge = await this.surchargeRepository.findOne({
      where: { surchargeId: id }
    });
    if (!surcharge) {
      throw new NotFoundException('Surcharge not found');
    }
    return surcharge;
  }

  async update(id: string, updateSurchargeDto: UpdateSurchargeDto) {
    await this.findOne(id);
    await this.surchargeRepository.update(id, updateSurchargeDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.surchargeRepository.delete(id);
  }
}
