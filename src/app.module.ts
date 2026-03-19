import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { AccessTokenGuard } from './auth/guards';
import { ClassesModule } from './classes/classes.module';
import { GradingModule } from './grading/grading.module';
import { PrismaModule } from './prisma/prisma.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    SubjectsModule,
    ClassesModule,
    QuizzesModule,
    GradingModule,
    StudentsModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
