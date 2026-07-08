import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.config';
import { ApiError } from '../middlewares/error.middleware';

export class AdminSubmissionController {
  /**
   * GET /api/v1/admin/submissions
   * List all student submissions/results across Reading, Listening, Writing, and Speaking
   */
  static async getAllSubmissions(req: any, res: Response, next: NextFunction) {
    try {
      const { type, search, page = 1, limit = 50 } = req.query;
      const p = parseInt(page as string, 10) || 1;
      const l = parseInt(limit as string, 10) || 50;

      // 1. Reading & Listening (TestResult)
      let testResults: any[] = [];
      if (!type || type === 'Reading' || type === 'Listening') {
        testResults = await prisma.testResult.findMany({
          include: {
            user: {
              select: { id: true, fullName: true, email: true, username: true }
            },
            test: {
              select: { id: true, title: true, type: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        
        // Filter by test type if type is set
        if (type) {
          testResults = testResults.filter(r => r.test?.type === type);
        }
      }

      // 2. Writing (WritingSubmission)
      let writingSubmissions: any[] = [];
      if (!type || type === 'Writing') {
        writingSubmissions = await prisma.writingSubmission.findMany({
          include: {
            user: {
              select: { id: true, fullName: true, email: true, username: true }
            },
            test: {
              select: { id: true, title: true, type: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      // 3. Speaking (SpeakingSubmission)
      let speakingSubmissions: any[] = [];
      if (!type || type === 'Speaking') {
        speakingSubmissions = await prisma.speakingSubmission.findMany({
          include: {
            user: {
              select: { id: true, fullName: true, email: true, username: true }
            },
            test: {
              select: { id: true, title: true, type: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      }

      // Format all to a unified structure
      const unified: any[] = [];

      testResults.forEach((r: any) => {
        unified.push({
          id: r.id,
          userId: r.userId,
          student: r.user,
          testId: r.testId,
          test: r.test || { title: 'Unknown Test', type: 'Reading' },
          type: r.test?.type || 'Reading',
          bandScore: r.bandScore,
          correctCount: r.correctCount,
          timeTaken: r.timeTaken,
          answers: r.answers, // Array of answers with explanation & correct/incorrect info
          createdAt: r.createdAt,
        });
      });

      writingSubmissions.forEach((w: any) => {
        unified.push({
          id: w.id,
          userId: w.userId,
          student: w.user,
          testId: w.testId,
          test: w.test || { title: w.prompt ? `Custom: ${w.prompt.substring(0, 30)}...` : 'Writing Practice', type: 'Writing' },
          prompt: w.prompt,
          type: 'Writing',
          essayText: w.essayText,
          bandScore: w.bandScore,
          taskAchievement: w.taskAchievement,
          coherenceCohesion: w.coherenceCohesion,
          lexicalResource: w.lexicalResource,
          grammarAccuracy: w.grammarAccuracy,
          aiFeedback: w.aiFeedback,
          createdAt: w.createdAt,
        });
      });

      speakingSubmissions.forEach((s: any) => {
        unified.push({
          id: s.id,
          userId: s.userId,
          student: s.user,
          testId: s.testId,
          test: s.test || { title: s.prompt ? `Custom: ${s.prompt.substring(0, 30)}...` : 'Speaking Practice', type: 'Speaking' },
          prompt: s.prompt,
          type: 'Speaking',
          audioUrl: s.audioUrl,
          transcription: s.transcription,
          bandScore: s.bandScore,
          fluencyCoherence: s.fluencyCoherence,
          lexicalResource: s.lexicalResource,
          grammarAccuracy: s.grammarAccuracy,
          pronunciation: s.pronunciation,
          aiFeedback: s.aiFeedback,
          createdAt: s.createdAt,
        });
      });

      // Filter by search query on unified list (student name, email, or test title)
      let filtered = unified;
      if (search) {
        const query = (search as string).toLowerCase();
        filtered = unified.filter(item => {
          const studentName = item.student?.fullName?.toLowerCase() || '';
          const studentEmail = item.student?.email?.toLowerCase() || '';
          const testTitle = item.test?.title?.toLowerCase() || '';
          return studentName.includes(query) || studentEmail.includes(query) || testTitle.includes(query);
        });
      }

      // Sort by createdAt descending
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Pagination
      const total = filtered.length;
      const startIndex = (p - 1) * l;
      const paginated = filtered.slice(startIndex, startIndex + l);

      res.status(200).json({
        success: true,
        message: 'Submissions retrieved successfully.',
        metadata: {
          submissions: paginated,
          total,
          page: p,
          limit: l,
          pages: Math.ceil(total / l),
        }
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to retrieve submissions.', 400));
    }
  }

  /**
   * DELETE /api/v1/admin/submissions/:id
   * Delete a student's result or submission
   */
  static async deleteSubmission(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { type } = req.query; // 'Reading' | 'Listening' | 'Writing' | 'Speaking'

      if (!id || !type) {
        return next(new ApiError('ID and type query parameters are required.', 400));
      }

      if (type === 'Reading' || type === 'Listening') {
        await prisma.testResult.delete({ where: { id } });
      } else if (type === 'Writing') {
        await prisma.writingSubmission.delete({ where: { id } });
      } else if (type === 'Speaking') {
        await prisma.speakingSubmission.delete({ where: { id } });
      } else {
        return next(new ApiError('Invalid type parameter.', 400));
      }

      res.status(200).json({
        success: true,
        message: 'Submission deleted successfully.',
        metadata: { id }
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to delete submission.', 400));
    }
  }
}
