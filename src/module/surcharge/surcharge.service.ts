import { Injectable } from '@nestjs/common';
import { CreateSurchargeDto } from './dto/create-surcharge.dto';
import { UpdateSurchargeDto } from './dto/update-surcharge.dto';

@Injectable()
export class SurchargeService {
  create(createSurchargeDto: CreateSurchargeDto) {
    return 'This action adds a new surcharge';
  }

  findAll() {
    return `This action returns all surcharge`;
  }

  findOne(id: number) {
    return `This action returns a #${id} surcharge`;
  }

  update(id: number, updateSurchargeDto: UpdateSurchargeDto) {
    return `This action updates a #${id} surcharge`;
  }

  remove(id: number) {
    return `This action removes a #${id} surcharge`;
  }
}
