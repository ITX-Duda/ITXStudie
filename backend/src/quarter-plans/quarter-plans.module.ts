import { Module } from '@nestjs/common';
import { QuarterPlansController } from './quarter-plans.controller';
import { QuarterPlansService } from './quarter-plans.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuarterPlansController],
  providers: [QuarterPlansService],
})
export class QuarterPlansModule {}
