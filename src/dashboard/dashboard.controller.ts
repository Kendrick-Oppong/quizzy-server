import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  DashboardApiTags,
  TeacherOverviewDocs,
  StudentOverviewDocs,
} from '../swagger/dashboard.docs';
import { GetCurrentUser } from '../auth/decorators';
import { AccessTokenGuard } from '../auth/guards';

@DashboardApiTags
@UseGuards(AccessTokenGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Teacher overview endpoint
  @Get('teacher/overview')
  @TeacherOverviewDocs()
  async teacherOverview(@GetCurrentUser('sub') teacherId: string) {
    return this.dashboardService.teacherOverview(teacherId);
  }

  // Student overview endpoint
  @Get('student/overview')
  @StudentOverviewDocs()
  async studentOverview(@GetCurrentUser('sub') studentId: string) {
    return this.dashboardService.studentOverview(studentId);
  }
}
