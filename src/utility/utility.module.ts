import { Module } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { UtilityController } from './utility.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Utility } from './entities/utility.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Utility])],
  controllers: [UtilityController],
  providers: [UtilityService],
})
export class UtilityModule {}
