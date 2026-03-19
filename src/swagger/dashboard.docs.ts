import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

export const DashboardApiTags = ApiTags('Dashboard');

export function TeacherOverviewDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get teacher dashboard overview',
      description:
        'Returns aggregated metrics, charts data and recent activity for a teacher dashboard.',
    }),
    ApiResponse({
      status: 200,
      description: 'Teacher overview data',
      schema: {
        example: {
          stats: {
            totalQuizzes: 42,
            activeStudents: 1240,
            averageScore: 84.5,
          },
          performanceTrend: [
            { day: 'Mon', value: 20 },
            { day: 'Tue', value: 35 },
            // ...
          ],
          scoreDistribution: [
            { range: '<60', count: 10 },
            { range: '60s', count: 20 },
            // ...
          ],
          recentActivity: [
            {
              id: 'submission-id',
              studentName: 'Emma Watson',
              studentAvatar: 'https://...',
              quizName: 'Midterm Math Assessment',
              score: 92,
              date: '2026-03-19T10:42:00.000Z',
              status: 'Completed',
            },
          ],
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
  );
}

export function StudentOverviewDocs() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get student dashboard overview',
      description:
        'Returns aggregated metrics, upcoming quizzes and recent results for a student.',
    }),
    ApiResponse({
      status: 200,
      description: 'Student overview data',
      schema: {
        example: {
          stats: {
            averageScore: 88,
            quizzesCompleted: 14,
            pendingQuizzes: 2,
          },
          weeklyPerformance: [
            { day: 'Mon', score: 85 },
            // ...
          ],
          upcomingQuizzes: [
            {
              id: 'quiz-id-1',
              title: 'Algebra Midterm Assessment',
              subject: 'Mathematics',
              dueAt: '2026-03-20T17:00:00.000Z',
              action: 'Start Quiz',
            },
          ],
          recentResults: [
            {
              id: 'grade-id',
              quizTitle: 'Physics: Kinematics',
              subject: 'Science',
              score: 92,
              date: '2026-03-12T09:00:00.000Z',
            },
          ],
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
  );
}
