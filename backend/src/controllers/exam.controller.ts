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
}
