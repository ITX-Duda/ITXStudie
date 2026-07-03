import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuarterPlansService {
  constructor(private prisma: PrismaService) {}

  async createPlan(userId: string, name: string) {
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

    return this.prisma.quarterPlan.create({
      data: { userId, name },
      include: {
        topics: { include: { topic: { include: { category: true } } }, orderBy: { order: 'asc' } },
      },
    });
  }

  async getPlans(userId: string) {
    return this.prisma.quarterPlan.findMany({
      where: { userId },
      include: {
        topics: {
          include: { topic: { include: { category: true } } },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addTopic(planId: string, topicId: string, order?: number) {
    const plan = await this.prisma.quarterPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const existing = await this.prisma.quarterPlanTopic.count({ where: { planId } });

    return this.prisma.quarterPlanTopic.create({
      data: { planId, topicId, order: order ?? existing },
      include: { topic: { include: { category: true } } },
    });
  }

  async removeTopic(planId: string, topicId: string) {
    const entry = await this.prisma.quarterPlanTopic.findFirst({
      where: { planId, topicId },
    });
    if (!entry) throw new NotFoundException('Topic not in plan');
    await this.prisma.quarterPlanTopic.delete({ where: { id: entry.id } });
    return { success: true };
  }

  async deletePlan(planId: string) {
    const plan = await this.prisma.quarterPlan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    await this.prisma.quarterPlan.delete({ where: { id: planId } });
    return { success: true };
  }
}
