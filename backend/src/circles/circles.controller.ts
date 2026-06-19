import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { CirclesService } from './circles.service';

@Controller('circles')
export class CirclesController {
  constructor(private readonly circlesService: CirclesService) {}

  @Post()
  createCircle(
    @Body()
    body: {
      userId: string;
      name: string;
      description?: string;
      phases: {
        order: number;
        type: 'study' | 'break';
        durationMins: number;
        label?: string;
        categoryId?: string;
        topicId?: string;
      }[];
    },
  ) {
    return this.circlesService.createCircle(
      body.userId,
      body.name,
      body.description,
      body.phases,
    );
  }

  @Get('user/:userId')
  getCircles(@Param('userId') userId: string) {
    return this.circlesService.getCircles(userId);
  }

  @Get('runs/:runId')
  getRun(@Param('runId') runId: string) {
    return this.circlesService.getRun(runId);
  }

  @Get(':id')
  getCircle(@Param('id') id: string) {
    return this.circlesService.getCircle(id);
  }

  @Delete(':id')
  deleteCircle(@Param('id') id: string) {
    return this.circlesService.deleteCircle(id);
  }

  @Post(':id/run')
  startRun(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.circlesService.startRun(id, body.userId);
  }

  @Patch('runs/:runId/next')
  advanceToNextPhase(@Param('runId') runId: string) {
    return this.circlesService.advanceToNextPhase(runId);
  }

  @Patch('runs/:runId/abandon')
  abandonRun(@Param('runId') runId: string) {
    return this.circlesService.abandonRun(runId);
  }
}
