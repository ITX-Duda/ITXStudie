import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start')
  startSession(@Body() body: { userId: string; categoryId?: string; topicId?: string }) {
    return this.sessionsService.startSession(body.userId, body.categoryId, body.topicId);
  }

  @Patch(':id/stop')
  stopSession(@Param('id') id: string) {
    return this.sessionsService.stopSession(id);
  }

  @Get('user/:userId')
  getSessions(@Param('userId') userId: string) {
    return this.sessionsService.getSessions(userId);
  }
}
