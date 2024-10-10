import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { UpdateUtilityDto } from './dto/update-utility.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Utility } from './entities/utility.entity';
import { Like, Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class UtilityService {
  constructor(
    @InjectRepository(Utility)
    private utilityRepository: Repository<Utility>,
  ) { }

  async create(createUtilityDto: CreateUtilityDto) {
    const utility = this.utilityRepository.create(createUtilityDto);
    await this.utilityRepository.save(utility);
    return utility;
  }

  async findAll(qs: any) {
    const take = +qs.limit || 10;
    const skip = (+qs.currentPage - 1) * (+qs.limit) || 0;
    const keyword = qs.keyword || '';
    const defaultLimit = +qs.limit ? +qs.limit : 10;

    const totalItems = await this.utilityRepository.count();

    const totalPages = Math.ceil(totalItems / defaultLimit);
    const [result, total] = await this.utilityRepository.findAndCount({
      take: take || totalItems,
      skip: skip,
      where: {
        utilityName: keyword ? Like(`%${keyword}%`) : undefined,
      }
    });
    return {
      data: result,
      totalItems: total,
      currentPage: +qs.currentPage || 1,
      totalPages: totalPages,
    };
  }

  async findOne(id: string) {
    try{
      const utility = await this.utilityRepository.findOneOrFail({
        where: { utilityId: id }
      });
      return utility;
    } catch (error) {
      throw new NotFoundException('Utility not found');
    }

  }

  async update(id: string, updateUtilityDto: UpdateUtilityDto) {
    const {...utility} = updateUtilityDto;
    const utilityExist = await this.findOne(id);
    await this.utilityRepository.update(utilityExist, utility);
    return utility;
  }

  async remove(id: string) {
    const utility = await this.findOne(id);
    await this.utilityRepository.remove(utility);
    return `Utility ${utility.utilityName} removed successfully`;
    
  }
}
