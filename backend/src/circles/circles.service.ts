import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreatePhaseDto {
  order: number;
  type: 'study' | 'break';
  durationMins: number;
  label?: string;
  categoryId?: string;
  topicId?: string;
}

@Injectable()
export class CirclesService {
  constructor(private prisma: PrismaService) {}

  // ─── Create a Circle with its phases ─────────────────────────────────────────
  async createCircle(
    userId: string,
    name: string,
    description: string | undefined,
    phases: CreatePhaseDto[],
  ) {
    // Ensure mock user exists (pre-auth dev shortcut)
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

    return this.prisma.studyCircle.create({
      data: {
        userId,
        name,
        description,
        phases: {
          create: phases.map((p) => ({
            order: p.order,
            type: p.type,
            durationMins: p.durationMins,
            label: p.label,
            categoryId: p.categoryId || null,
            topicId: p.topicId || null,
          })),
        },
      },
      include: { phases: { orderBy: { order: 'asc' } } },
    });
  }

  // ─── List all circles for a user ─────────────────────────────────────────────
  async getCircles(userId: string) {
    return this.prisma.studyCircle.findMany({
      where: { userId },
      include: {
        phases: { orderBy: { order: 'asc' } },
        runs: { where: { status: 'running' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Get one circle with full details ────────────────────────────────────────
  async getCircle(id: string) {
    const circle = await this.prisma.studyCircle.findUnique({
      where: { id },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: { category: true, topic: true },
        },
        runs: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
      },
    });
    if (!circle) throw new NotFoundException('Circle not found');
    return circle;
  }

  // ─── Delete a circle ─────────────────────────────────────────────────────────
  async deleteCircle(id: string) {
    await this.prisma.studyCircle.delete({ where: { id } });
    return { message: 'Circle deleted' };
  }

  // ─── Start a new run of a circle ─────────────────────────────────────────────
  async startRun(circleId: string, userId: string) {
    const circle = await this.prisma.studyCircle.findUnique({
      where: { id: circleId },
      include: { phases: { orderBy: { order: 'asc' } } },
    });
    if (!circle) throw new NotFoundException('Circle not found');
    if (circle.phases.length === 0) {
      throw new BadRequestException('Circle has no phases');
    }

    const firstPhase = circle.phases[0];

    // Create the run
    const run = await this.prisma.circleRun.create({
      data: {
        circleId,
        userId,
        currentPhaseOrder: firstPhase.order,
        status: 'running',
      },
    });

    // If first phase is a study phase, create a session for it
    let activeSession: any = null;
    if (firstPhase.type === 'study') {
      activeSession = await this.prisma.session.create({
        data: {
          userId,
          circleRunId: run.id,
          phaseOrder: firstPhase.order,
          categoryId: firstPhase.categoryId,
          topicId: firstPhase.topicId,
          status: 'running',
          startTime: new Date(),
        },
      });
    }

    return {
      run: { ...run, circle },
      activeSession,
      currentPhase: firstPhase,
    };
  }

  // ─── Get current state of a run ──────────────────────────────────────────────
  async getRun(runId: string) {
    const run = await this.prisma.circleRun.findUnique({
      where: { id: runId },
      include: {
        circle: {
          include: { phases: { orderBy: { order: 'asc' } } },
        },
        sessions: { orderBy: { startTime: 'desc' } },
      },
    });
    if (!run) throw new NotFoundException('Run not found');

    const currentPhase = run.circle.phases.find(
      (p) => p.order === run.currentPhaseOrder,
    );
    const activeSession = run.sessions.find((s) => s.status === 'running');

    return { run, currentPhase, activeSession };
  }

  // ─── Advance to next phase ────────────────────────────────────────────────────
  async advanceToNextPhase(runId: string) {
    const run = await this.prisma.circleRun.findUnique({
      where: { id: runId },
      include: {
        circle: { include: { phases: { orderBy: { order: 'asc' } } } },
        sessions: { where: { status: 'running' }, take: 1 },
      },
    });
    if (!run) throw new NotFoundException('Run not found');
    if (run.status !== 'running') {
      throw new BadRequestException('This run is not active');
    }

    // Stop the current running session if there is one
    if (run.sessions.length > 0) {
      const currentSession = run.sessions[0];
      const endTime = new Date();
      const durationMins = Math.round(
        (endTime.getTime() - currentSession.startTime.getTime()) / 60000,
      );
      await this.prisma.session.update({
        where: { id: currentSession.id },
        data: { endTime, durationMins, status: 'stopped' },
      });
    }

    // Find the next phase
    const phases = run.circle.phases;
    const currentIndex = phases.findIndex(
      (p) => p.order === run.currentPhaseOrder,
    );
    const nextPhase = phases[currentIndex + 1];

    // No next phase → complete the run
    if (!nextPhase) {
      const completedRun = await this.prisma.circleRun.update({
        where: { id: runId },
        data: { status: 'completed', completedAt: new Date() },
        include: { circle: { include: { phases: { orderBy: { order: 'asc' } } } } },
      });
      return { run: completedRun, currentPhase: null, activeSession: null, completed: true };
    }

    // Move to next phase
    const updatedRun = await this.prisma.circleRun.update({
      where: { id: runId },
      data: { currentPhaseOrder: nextPhase.order },
      include: { circle: { include: { phases: { orderBy: { order: 'asc' } } } } },
    });

    // Create a session if next phase is a study phase
    let activeSession: any = null;
    if (nextPhase.type === 'study') {
      activeSession = await this.prisma.session.create({
        data: {
          userId: run.userId,
          circleRunId: runId,
          phaseOrder: nextPhase.order,
          categoryId: nextPhase.categoryId,
          topicId: nextPhase.topicId,
          status: 'running',
          startTime: new Date(),
        },
      });
    }

    return {
      run: updatedRun,
      currentPhase: nextPhase,
      activeSession,
      completed: false,
    };
  }

  // ─── Abandon a run ────────────────────────────────────────────────────────────
  async abandonRun(runId: string) {
    // Stop any running session
    await this.prisma.session.updateMany({
      where: { circleRunId: runId, status: 'running' },
      data: { status: 'stopped', endTime: new Date() },
    });
    return this.prisma.circleRun.update({
      where: { id: runId },
      data: { status: 'abandoned' },
    });
  }
}
