/*
  Warnings:

  - You are about to drop the `Class` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassInvite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ClassMembership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GradeItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quiz` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizExtensionRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizSubmission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "ClassInvite" DROP CONSTRAINT "ClassInvite_acceptedById_fkey";

-- DropForeignKey
ALTER TABLE "ClassInvite" DROP CONSTRAINT "ClassInvite_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassInvite" DROP CONSTRAINT "ClassInvite_invitedById_fkey";

-- DropForeignKey
ALTER TABLE "ClassMembership" DROP CONSTRAINT "ClassMembership_classId_fkey";

-- DropForeignKey
ALTER TABLE "ClassMembership" DROP CONSTRAINT "ClassMembership_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "Grade" DROP CONSTRAINT "Grade_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "GradeItem" DROP CONSTRAINT "GradeItem_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "GradeItem" DROP CONSTRAINT "GradeItem_questionId_fkey";

-- DropForeignKey
ALTER TABLE "GradeItem" DROP CONSTRAINT "GradeItem_quizAnswerId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_classId_fkey";

-- DropForeignKey
ALTER TABLE "Quiz" DROP CONSTRAINT "Quiz_createdById_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_selectedOptionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAnswer" DROP CONSTRAINT "QuizAnswer_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizExtensionRequest" DROP CONSTRAINT "QuizExtensionRequest_createdBySubmissionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizExtensionRequest" DROP CONSTRAINT "QuizExtensionRequest_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizExtensionRequest" DROP CONSTRAINT "QuizExtensionRequest_studentId_fkey";

-- DropForeignKey
ALTER TABLE "QuizExtensionRequest" DROP CONSTRAINT "QuizExtensionRequest_teacherId_fkey";

-- DropForeignKey
ALTER TABLE "QuizOption" DROP CONSTRAINT "QuizOption_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_correctOptionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmission" DROP CONSTRAINT "QuizSubmission_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizSubmission" DROP CONSTRAINT "QuizSubmission_studentId_fkey";

-- DropTable
DROP TABLE "Class";

-- DropTable
DROP TABLE "ClassInvite";

-- DropTable
DROP TABLE "ClassMembership";

-- DropTable
DROP TABLE "Grade";

-- DropTable
DROP TABLE "GradeItem";

-- DropTable
DROP TABLE "Quiz";

-- DropTable
DROP TABLE "QuizAnswer";

-- DropTable
DROP TABLE "QuizExtensionRequest";

-- DropTable
DROP TABLE "QuizOption";

-- DropTable
DROP TABLE "QuizQuestion";

-- DropTable
DROP TABLE "QuizSubmission";

-- DropTable
DROP TABLE "Subject";

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classCode" TEXT NOT NULL,
    "subjectId" TEXT,
    "category" TEXT,
    "levelLabel" TEXT,
    "joinCode" TEXT,
    "status" "ClassStatus" NOT NULL DEFAULT 'ACTIVE',
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_memberships" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_invites" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "email" TEXT,
    "inviteCode" TEXT NOT NULL,
    "status" "ExtensionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "acceptedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "dueAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "correctOptionId" TEXT,
    "correctAnswerText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_submissions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_answers" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "answerText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "status" "GradeStatus" NOT NULL DEFAULT 'DRAFT',
    "overallScore" INTEGER,
    "maxScore" INTEGER,
    "overallFeedback" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_items" (
    "id" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "status" "GradeItemStatus" NOT NULL,
    "score" INTEGER,
    "maxScore" INTEGER,
    "feedback" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "quizAnswerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_extension_requests" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "status" "ExtensionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),
    "newDueAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBySubmissionId" TEXT,

    CONSTRAINT "quiz_extension_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subjects_name_key" ON "subjects"("name");

-- CreateIndex
CREATE UNIQUE INDEX "classes_classCode_key" ON "classes"("classCode");

-- CreateIndex
CREATE UNIQUE INDEX "classes_joinCode_key" ON "classes"("joinCode");

-- CreateIndex
CREATE INDEX "classes_teacherId_idx" ON "classes"("teacherId");

-- CreateIndex
CREATE INDEX "classes_subjectId_idx" ON "classes"("subjectId");

-- CreateIndex
CREATE INDEX "class_memberships_studentId_idx" ON "class_memberships"("studentId");

-- CreateIndex
CREATE INDEX "class_memberships_classId_idx" ON "class_memberships"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "class_memberships_classId_studentId_key" ON "class_memberships"("classId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "class_invites_inviteCode_key" ON "class_invites"("inviteCode");

-- CreateIndex
CREATE INDEX "class_invites_classId_idx" ON "class_invites"("classId");

-- CreateIndex
CREATE INDEX "class_invites_invitedById_idx" ON "class_invites"("invitedById");

-- CreateIndex
CREATE INDEX "quizzes_classId_idx" ON "quizzes"("classId");

-- CreateIndex
CREATE INDEX "quizzes_createdById_idx" ON "quizzes"("createdById");

-- CreateIndex
CREATE INDEX "quizzes_dueAt_idx" ON "quizzes"("dueAt");

-- CreateIndex
CREATE INDEX "quizzes_classId_status_dueAt_idx" ON "quizzes"("classId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "quizzes_createdById_status_idx" ON "quizzes"("createdById", "status");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_correctOptionId_key" ON "quiz_questions"("correctOptionId");

-- CreateIndex
CREATE INDEX "quiz_questions_quizId_idx" ON "quiz_questions"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_quizId_orderIndex_key" ON "quiz_questions"("quizId", "orderIndex");

-- CreateIndex
CREATE INDEX "quiz_options_questionId_idx" ON "quiz_options"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_options_questionId_orderIndex_key" ON "quiz_options"("questionId", "orderIndex");

-- CreateIndex
CREATE INDEX "quiz_submissions_quizId_idx" ON "quiz_submissions"("quizId");

-- CreateIndex
CREATE INDEX "quiz_submissions_studentId_idx" ON "quiz_submissions"("studentId");

-- CreateIndex
CREATE INDEX "quiz_submissions_studentId_status_idx" ON "quiz_submissions"("studentId", "status");

-- CreateIndex
CREATE INDEX "quiz_submissions_quizId_studentId_idx" ON "quiz_submissions"("quizId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_submissions_quizId_studentId_attemptNumber_key" ON "quiz_submissions"("quizId", "studentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "quiz_answers_questionId_idx" ON "quiz_answers"("questionId");

-- CreateIndex
CREATE INDEX "quiz_answers_submissionId_idx" ON "quiz_answers"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_answers_submissionId_questionId_key" ON "quiz_answers"("submissionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "grades_submissionId_key" ON "grades"("submissionId");

-- CreateIndex
CREATE INDEX "grades_teacherId_idx" ON "grades"("teacherId");

-- CreateIndex
CREATE INDEX "grades_status_createdAt_idx" ON "grades"("status", "createdAt");

-- CreateIndex
CREATE INDEX "grades_status_submissionId_idx" ON "grades"("status", "submissionId");

-- CreateIndex
CREATE INDEX "grade_items_questionId_idx" ON "grade_items"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "grade_items_gradeId_questionId_key" ON "grade_items"("gradeId", "questionId");

-- CreateIndex
CREATE INDEX "quiz_extension_requests_quizId_idx" ON "quiz_extension_requests"("quizId");

-- CreateIndex
CREATE INDEX "quiz_extension_requests_studentId_idx" ON "quiz_extension_requests"("studentId");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_memberships" ADD CONSTRAINT "class_memberships_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_memberships" ADD CONSTRAINT "class_memberships_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_invites" ADD CONSTRAINT "class_invites_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_invites" ADD CONSTRAINT "class_invites_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_invites" ADD CONSTRAINT "class_invites_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_correctOptionId_fkey" FOREIGN KEY ("correctOptionId") REFERENCES "quiz_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_submissions" ADD CONSTRAINT "quiz_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "quiz_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_answers" ADD CONSTRAINT "quiz_answers_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "quiz_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "quiz_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_items" ADD CONSTRAINT "grade_items_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_items" ADD CONSTRAINT "grade_items_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_items" ADD CONSTRAINT "grade_items_quizAnswerId_fkey" FOREIGN KEY ("quizAnswerId") REFERENCES "quiz_answers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_extension_requests" ADD CONSTRAINT "quiz_extension_requests_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_extension_requests" ADD CONSTRAINT "quiz_extension_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_extension_requests" ADD CONSTRAINT "quiz_extension_requests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_extension_requests" ADD CONSTRAINT "quiz_extension_requests_createdBySubmissionId_fkey" FOREIGN KEY ("createdBySubmissionId") REFERENCES "quiz_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
