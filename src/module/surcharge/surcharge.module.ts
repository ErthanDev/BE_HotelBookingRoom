import { Module } from '@nestjs/common';
import { SurchargeService } from './surcharge.service';
import { SurchargeController } from './surcharge.controller';
import { TypeRoom } from 'src/module/type-room/entities/type-room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Surcharge } from './entities/surcharge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Surcharge])
  ],
  controllers: [SurchargeController],
  providers: [SurchargeService],
})
export class SurchargeModule { }
