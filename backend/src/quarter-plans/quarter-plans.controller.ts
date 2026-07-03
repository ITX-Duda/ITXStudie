import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { QuarterPlansService } from './quarter-plans.service';

@Controller('quarter-plans')
export class QuarterPlansController {
  constructor(private readonly quarterPlansService: QuarterPlansService) {}

  @Post()
  createPlan(@Body() body: { userId: string; name: string }) {
    return this.quarterPlansService.createPlan(body.userId, body.name);
  }

  @Get('user/:userId')
  getPlans(@Param('userId') userId: string) {
    return this.quarterPlansService.getPlans(userId);
  }

  @Post(':planId/topics')
  addTopic(
    @Param('planId') planId: string,
    @Body() body: { topicId: string; order?: number },
  ) {
    return this.quarterPlansService.addTopic(planId, body.topicId, body.order);
  }

  @Delete(':planId/topics/:topicId')
  removeTopic(
    @Param('planId') planId: string,
    @Param('topicId') topicId: string,
  ) {
    return this.quarterPlansService.removeTopic(planId, topicId);
  }

  @Delete(':planId')
  deletePlan(@Param('planId') planId: string) {
    return this.quarterPlansService.deletePlan(planId);
  }
}
