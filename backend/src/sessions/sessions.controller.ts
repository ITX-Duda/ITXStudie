import { Controller, Post, Get, Param, Body, Patch, Delete } from '@nestjs/common';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('start')
  startSession(
    @Body() body: { userId: string; categoryId?: string; topicId?: string },
  ) {
    return this.sessionsService.startSession(
      body.userId,
      body.categoryId,
      body.topicId,
    );
  }

  @Patch(':id/stop')
  stopSession(
    @Param('id') id: string,
    @Body() body: { notes?: string; rating?: string },
  ) {
    return this.sessionsService.stopSession(id, body.notes, body.rating);
  }

  @Get('user/:userId')
  getSessions(@Param('userId') userId: string) {
    return this.sessionsService.getSessions(userId);
  }

  @Delete(':id')
  deleteSession(@Param('id') id: string) {
    return this.sessionsService.deleteSession(id);
  }
}
