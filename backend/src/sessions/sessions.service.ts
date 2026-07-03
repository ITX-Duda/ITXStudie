import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async startSession(
    userId: string,
    categoryId?: string,
    topicId?: string,
    studyCycleStep?: string,
  ) {
    // Upsert mock user so foreign key constraint doesn't fail
    await this.prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@itxstudie.dev`,
        password: 'mock_password',
        name: 'Mock User',
      },
    });

    return this.prisma.session.create({
      data: {
        userId,
        categoryId,
        topicId,
        studyCycleStep,
        status: 'running',
        startTime: new Date(),
      },
      include: {
        category: true,
        topic: true,
      },
    });
  }

  async stopSession(id: string, notes?: string, rating?: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session || session.status !== 'running') {
      throw new NotFoundException('Session not found or already stopped');
    }

    const endTime = new Date();
    const durationMins = Math.round(
      (endTime.getTime() - session.startTime.getTime()) / 60000,
    );

    return this.prisma.session.update({
      where: { id },
      data: {
        endTime,
        durationMins,
        status: 'stopped',
        ...(notes !== undefined && { notes }),
        ...(rating !== undefined && { rating }),
      },
      include: {
        category: true,
        topic: true,
      },
    });
  }

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      include: {
        category: true,
        topic: true,
      },
    });
  }

  async deleteSession(id: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    await this.prisma.session.delete({ where: { id } });
    return { success: true };
  }
}
