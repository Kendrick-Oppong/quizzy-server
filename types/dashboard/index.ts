// ─── Shared ───────────────────────────────────────────────────────────────────

export interface TrendPoint {
  day: string;
  value: number;
}

export interface DistributionBucket {
  range: string;
  count: number;
}

// ─── Teacher Overview ─────────────────────────────────────────────────────────

export interface RecentActivityItem {
  id: string;
  studentName: string;
  studentAvatar: string;
  quizName: string;
  score: number | null;
  date: Date;
  status: 'Completed' | 'Needs Review' | 'Taking Quiz';
}

export interface TeacherOverviewResult {
  stats: {
    totalQuizzes: number;
    activeStudents: number;
    averageScore: number;
  };
  performanceTrend: TrendPoint[];
  scoreDistribution: DistributionBucket[];
  recentActivity: RecentActivityItem[];
}

// ─── Student Overview ─────────────────────────────────────────────────────────

export interface WeeklyPerformancePoint {
  day: string;
  score: number;
}

export interface UpcomingQuiz {
  id: string;
  title: string;
  subject: string;
  dueAt: Date | null;
  action: string;
}

export interface RecentResult {
  id: string;
  quizTitle: string;
  subject: string;
  score: number | null;
  date: Date;
}

export interface StudentOverviewResult {
  stats: {
    averageScore: number;
    quizzesCompleted: number;
    pendingQuizzes: number;
  };
  weeklyPerformance: WeeklyPerformancePoint[];
  upcomingQuizzes: UpcomingQuiz[];
  recentResults: RecentResult[];
}

// ─── Internal / Raw query ─────────────────────────────────────────────────────

export interface ActiveStudentsRow {
  count: bigint;
}
