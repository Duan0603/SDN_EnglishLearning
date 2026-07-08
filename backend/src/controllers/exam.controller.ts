import { Request, Response, NextFunction } from 'express';
import { ExamService } from '../services/exam.service';
import { ApiError } from '../middlewares/error.middleware';

export class ExamController {
  /**
   * POST /api/v1/exams
   * Create an exam with nested sections and questions.
   */
  static async createExam(req: Request, res: Response, next: NextFunction) {
    try {
      const exam = await ExamService.createExam(req.body);
      res.status(201).json({
        success: true,
        data: exam,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to create exam.', 400));
    }
  }

  /**
   * GET /api/v1/exams
   * Retrieve list of exams (paginated, with optional type filter).
   */
  static async getExams(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, page, limit } = req.query;
      const parsedPage = page ? parseInt(page as string, 10) : 1;
      const parsedLimit = limit ? parseInt(limit as string, 10) : 10;

      const result = await ExamService.getExams(
        type as string,
        parsedPage,
        parsedLimit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to retrieve exams.', 400));
    }
  }

  /**
   * GET /api/v1/exams/:id
   * Get complete exam details including sections and questions.
   */
  static async getExamById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const exam = await ExamService.getExamById(id);
      if (!exam) {
        return next(new ApiError('Exam not found.', 404));
      }
      res.status(200).json({
        success: true,
        data: exam,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to retrieve exam.', 400));
    }
  }

  /**
   * POST /api/v1/exams/:id/submit
   * Submit exam answers for grading.
   */
  static async submitExam(req: any, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { answers, timeTaken } = req.body;
      const userId = req.user?.userId || req.user?.id || req.user?._id;

      if (!userId) {
        return next(new ApiError('Unauthorized', 401));
      }

      if (!answers || !Array.isArray(answers)) {
        return next(new ApiError('Invalid answers payload', 400));
      }

      const result = await ExamService.submitExam(userId, id, answers, timeTaken || 0);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to submit exam.', 400));
    }
  }

  /**
   * PUT /api/v1/exams/:id
   * Fully update/replace an exam and its nested content.
   */
  static async updateExam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const exam = await ExamService.updateExam(id, req.body);
      if (!exam) {
        return next(new ApiError('Exam not found.', 404));
      }
      res.status(200).json({
        success: true,
        data: exam,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to update exam.', 400));
    }
  }

  /**
   * DELETE /api/v1/exams/:id
   * Delete an exam and clean up nested sections/questions.
   */
  static async deleteExam(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedExam = await ExamService.deleteExam(id);
      if (!deletedExam) {
        return next(new ApiError('Exam not found.', 404));
      }
      res.status(200).json({
        success: true,
        data: {
          id: deletedExam.id,
          message: 'Exam deleted successfully.',
        },
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Failed to delete exam.', 400));
    }
  }

  /**
   * POST /api/v1/exams/bulk-import
   * Imports an array of exams.
   */
  static async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      const { exams } = req.body;
      const result = await ExamService.bulkImport(exams);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(new ApiError(error.message || 'Bulk import failed.', 400));
    }
  }

  /**
   * POST /api/v1/exams/evaluate-writing
   * Evaluate a student's writing response with Gemini AI.
   */
  static async evaluateWriting(req: any, res: Response, next: NextFunction) {
    try {
      const { testId, prompt, essayText } = req.body;
      const userId = req.user?.userId || req.user?.id || req.user?._id;

      if (!userId) {
        return next(new ApiError('Unauthorized', 401));
      }

      if (!essayText) {
        return next(new ApiError('essayText is required.', 400));
      }

      if (!prompt) {
        return next(new ApiError('prompt is required.', 400));
      }

      const validTestId = (typeof testId === 'string' && testId.length === 24) ? testId : null;

      const result = await ExamService.evaluateWriting(userId, validTestId, prompt, essayText);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Evaluate writing error:', error);
      next(new ApiError(error.message || 'Failed to evaluate writing.', 400));
    }
  }

  /**
   * POST /api/v1/exams/evaluate-speaking
   * Evaluate a student's speaking response.
   */
  static async evaluateSpeaking(req: any, res: Response, next: NextFunction) {
    try {
      const { testId, prompt, audioBase64, durationSeconds, mimeType = 'audio/m4a' } = req.body;
      const userId = req.user?.userId || req.user?.id || req.user?._id;

      if (!userId) {
        return next(new ApiError('Unauthorized', 401));
      }

      if (!audioBase64) {
        return next(new ApiError('audioBase64 is required.', 400));
      }

      if (!prompt) {
        return next(new ApiError('prompt is required.', 400));
      }

      const validTestId = (typeof testId === 'string' && testId.length === 24) ? testId : null;

      const result = await ExamService.evaluateSpeaking(userId, validTestId, prompt, audioBase64, durationSeconds || 0, mimeType);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Evaluate speaking error:', error);
      next(new ApiError(error.message || 'Failed to evaluate speaking.', 400));
    }
  }
}
