import { Router } from 'express';
import { authentication } from '../auth/authUtils.js';
import { roleGuard } from '../middlewares/role.middleware';
import { ExamController } from '../controllers/exam.controller';

export const examRouter = Router();

// Enforce authentication for all exam endpoints
examRouter.use(authentication as any);

// Read-only endpoints: open to STUDENT, MENTOR, and ADMIN
examRouter.get('/', ExamController.getExams);
examRouter.get('/:id', ExamController.getExamById);

// Write/Mutate endpoints: restricted to ADMIN only
examRouter.post('/', roleGuard(['ADMIN']), ExamController.createExam);
examRouter.put('/:id', roleGuard(['ADMIN']), ExamController.updateExam);
examRouter.delete('/:id', roleGuard(['ADMIN']), ExamController.deleteExam);
examRouter.post('/bulk-import', roleGuard(['ADMIN']), ExamController.bulkImport);
