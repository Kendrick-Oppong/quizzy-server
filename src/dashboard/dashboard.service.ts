import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ActiveStudentsRow,
  DistributionBucket,
  RecentActivityItem,
  StudentOverviewResult,
  TeacherOverviewResult,
  TrendPoint,
} from 'types/dashboard';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Shared Helpers ─────────────────────────────────────────────────────────

  /**
   * Builds a 7-day performance trend array from a list of grades.
   * Grades are bucketed by day-of-week label and averaged as a percentage.
   */
  private buildWeeklyTrend(
    grades: {
      createdAt: Date;
      overallScore: number | null;
      maxScore: number | null;
    }[],
  ): TrendPoint[] {
    // Pre-populate the last 7 days so days with no activity show 0
    const trendMap = new Map<string, { total: number; count: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      trendMap.set(DAYS[d.getDay()], { total: 0, count: 0 });
    }

    for (const g of grades) {
      const entry = trendMap.get(DAYS[g.createdAt.getDay()]);
      if (!entry) continue;
      // Normalise to 0–100 percentage so scores across different max values are comparable
      const scorePct = g.maxScore
        ? ((g.overallScore ?? 0) / g.maxScore) * 100
        : 0;
      entry.total += scorePct;
      entry.count += 1;
    }

    // Reverse so the array reads oldest → newest (left-to-right on a chart)
    return Array.from(trendMap.entries())
      .reverse()
      .map(([day, { total, count }]) => ({
        day,
        value: count > 0 ? Math.round(total / count) : 0,
      }));
  }

  /**
   * Buckets a list of scored grades into five percentage ranges
   * for a score-distribution bar/column chart.
   */
  private buildScoreDistribution(
    grades: { overallScore: number | null; maxScore: number | null }[],
  ): DistributionBucket[] {
    const buckets: Record<string, number> = {
      '<60': 0,
      '60s': 0,
      '70s': 0,
      '80s': 0,
      '90s': 0,
    };

    const thresholds: [number, string][] = [
      [60, '<60'],
      [70, '60s'],
      [80, '70s'],
      [90, '80s'],
    ];

    for (const g of grades) {
      const pct = g.maxScore ? ((g.overallScore ?? 0) / g.maxScore) * 100 : 0;
      const key = thresholds.find(([max]) => pct < max)?.[1] ?? '90s';
      buckets[key]++;
    }

    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }

  private mapSubmissionStatus(status: string): RecentActivityItem['status'] {
    switch (status) {
      case 'GRADED':
      case 'AUTO_GRADED':
        return 'Completed';
      case 'SUBMITTED':
      case 'NEEDS_REVIEW':
        return 'Needs Review';
      default:
        return 'Taking Quiz';
    }
  }

  // ─── Teacher Overview ────────────────────────────────────────────────────────

  async teacherOverview(teacherId: string): Promise<TeacherOverviewResult> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Raw SQL for active student count.
    //   prisma.classMembership.aggregate() does not support nested relation filters
    // Index used: class_memberships(classId) + classes(teacherId)
    const activeStudentsQuery = this.prisma.$queryRaw<ActiveStudentsRow[]>`
      SELECT COUNT(cm."studentId")::int AS count
      FROM   "class_memberships" cm
      INNER  JOIN "classes" c ON c.id = cm."classId"
      WHERE  c."teacherId" = ${teacherId}
    `;

    const [
      totalQuizzes,
      [{ count: activeStudents }],
      avgScoreResult,
      weeklyGrades,
      allGrades,
      recentSubmissions,
    ] = await Promise.all([
      // Index: quizzes(createdById)
      this.prisma.quiz.count({
        where: { createdById: teacherId },
      }),

      activeStudentsQuery,

      // Index: grades(status, submissionId) via submission → quiz join
      this.prisma.grade.aggregate({
        _avg: { overallScore: true },
        where: {
          status: 'PUBLISHED',
          submission: { quiz: { createdById: teacherId } },
        },
      }),

      // Index: grades(status, createdAt) — bounded date-range scan
      this.prisma.grade.findMany({
        where: {
          status: 'PUBLISHED',
          createdAt: { gte: sevenDaysAgo },
          submission: { quiz: { createdById: teacherId } },
        },
        select: { createdAt: true, overallScore: true, maxScore: true },
      }),

      // Index: grades(status, submissionId) — select only scoring columns
      this.prisma.grade.findMany({
        where: {
          status: 'PUBLISHED',
          submission: { quiz: { createdById: teacherId } },
        },
        select: { overallScore: true, maxScore: true },
      }),

      // Index: quiz_submissions(updatedAt DESC) — top 10, select only needed columns
      this.prisma.quizSubmission.findMany({
        where: { quiz: { createdById: teacherId } },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          updatedAt: true,
          student: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
          grade: {
            select: { overallScore: true },
          },
          quiz: {
            select: {
              title: true,
              class: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        totalQuizzes,
        // $queryRaw returns BigInt for COUNT; cast to Number for JSON serialisation
        activeStudents: Number(activeStudents),
        averageScore: Number(
          (avgScoreResult._avg?.overallScore ?? 0).toFixed(1),
        ),
      },
      performanceTrend: this.buildWeeklyTrend(weeklyGrades),
      scoreDistribution: this.buildScoreDistribution(allGrades),
      recentActivity: recentSubmissions.map((s) => ({
        id: s.id,
        studentName: `${s.student.firstName} ${s.student.lastName}`,
        studentAvatar: s.student.avatarUrl ?? '',
        quizName: s.quiz.title,
        score: s.grade?.overallScore ?? null,
        date: s.updatedAt,
        status: this.mapSubmissionStatus(s.status),
      })),
    };
  }

  // ─── Student Overview ────────────────────────────────────────────────────────

  async studentOverview(studentId: string): Promise<StudentOverviewResult> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // classIds are a hard prerequisite for pendingQuizzes and upcomingQuizzes —
    // this is the only justified sequential step. One cheap index scan on
    // class_memberships(studentId).
    const memberships = await this.prisma.classMembership.findMany({
      where: { studentId },
      select: { classId: true },
    });
    const classIds = memberships.map((m) => m.classId);

    const [
      quizzesCompleted,
      pendingQuizzes,
      avgScoreResult,
      weeklyGrades,
      upcomingQuizzesRaw,
      recentGrades,
    ] = await Promise.all([
      // Index: quiz_submissions(studentId, status) composite
      this.prisma.quizSubmission.count({
        where: {
          studentId,
          status: { in: ['SUBMITTED', 'GRADED', 'AUTO_GRADED'] },
        },
      }),

      // Index: quizzes(classId, status, dueAt) composite
      this.prisma.quiz.count({
        where: {
          classId: { in: classIds },
          status: 'PUBLISHED',
          submissions: { none: { studentId } },
        },
      }),

      // Index: grades(status, submissionId) via submission.studentId
      this.prisma.grade.aggregate({
        _avg: { overallScore: true },
        where: {
          status: 'PUBLISHED',
          submission: { studentId },
        },
      }),

      // Index: grades(status, createdAt) — bounded date-range scan
      this.prisma.grade.findMany({
        where: {
          status: 'PUBLISHED',
          createdAt: { gte: sevenDaysAgo },
          submission: { studentId },
        },
        select: { createdAt: true, overallScore: true, maxScore: true },
      }),

      // Index: quizzes(classId, status, dueAt) — ORDER BY dueAt served from index
      this.prisma.quiz.findMany({
        where: {
          classId: { in: classIds },
          status: 'PUBLISHED',
          dueAt: { gt: new Date() },
          submissions: { none: { studentId } },
        },
        orderBy: { dueAt: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          dueAt: true,
          class: { select: { name: true } },
        },
      }),

      // Index: grades(status) + createdAt DESC — top 5 only
      this.prisma.grade.findMany({
        where: {
          status: 'PUBLISHED',
          submission: { studentId },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          overallScore: true,
          createdAt: true,
          submission: {
            select: {
              quiz: {
                select: {
                  title: true,
                  class: { select: { name: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        averageScore: Number(
          (avgScoreResult._avg?.overallScore ?? 0).toFixed(0),
        ),
        quizzesCompleted,
        pendingQuizzes,
      },
      weeklyPerformance: this.buildWeeklyTrend(weeklyGrades).map(
        ({ day, value }) => ({
          day,
          score: value,
        }),
      ),
      upcomingQuizzes: upcomingQuizzesRaw.map((q) => ({
        id: q.id,
        title: q.title,
        subject: q.class.name,
        dueAt: q.dueAt,
        action: 'Start Quiz',
      })),
      recentResults: recentGrades.map((g) => ({
        id: g.id,
        quizTitle: g.submission.quiz.title,
        subject: g.submission.quiz.class.name,
        score: g.overallScore,
        date: g.createdAt,
      })),
    };
  }
}
