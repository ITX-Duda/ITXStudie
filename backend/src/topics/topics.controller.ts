import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  createTopic(@Body() body: { userId: string; categoryId: string; name: string }) {
    return this.topicsService.createTopic(body.userId, body.categoryId, body.name);
  }

  @Get('user/:userId')
  getTopics(@Param('userId') userId: string, @Query('categoryId') categoryId?: string) {
    return this.topicsService.getTopics(userId, categoryId);
  }
}
