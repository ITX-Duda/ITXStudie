import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async createTopic(userId: string, categoryId: string, name: string) {
    return this.prisma.topic.create({
      data: { userId, categoryId, name },
    });
  }

  async getTopics(userId: string, categoryId?: string) {
    return this.prisma.topic.findMany({
      where: { userId, categoryId },
      orderBy: { name: 'asc' },
    });
  }
}
