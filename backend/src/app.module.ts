import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SessionsModule } from './sessions/sessions.module';
import { CategoriesModule } from './categories/categories.module';
import { TopicsModule } from './topics/topics.module';
import { CirclesModule } from './circles/circles.module';

@Module({
  imports: [PrismaModule, SessionsModule, CategoriesModule, TopicsModule, CirclesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
