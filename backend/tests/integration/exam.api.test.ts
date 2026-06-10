import request from 'supertest';
import { createApp } from '../../src/app';
import { ExamService } from '../../src/services/exam.service';

// Mock Redis to avoid connection issues during tests
jest.mock('../../src/config/redis.config', () => ({
  getRedisClient: jest.fn().mockResolvedValue({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Mock authentication middleware to bypass JWT validation but keep routing logic
jest.mock('../../src/auth/authUtils.js', () => ({
  authentication: (req: any, res: any, next: any) => {
    const userId = req.headers['x-client-id'] || 'student-id';
    req.user = { userId, email: 'test@example.com' };
    next();
  },
  createTokenPair: jest.fn(),
}));

// Mock prisma for roleGuard database lookup
jest.mock('../../src/config/prisma.config', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === 'admin-id') {
          return Promise.resolve({
            id: 'admin-id',
            role: 'ADMIN',
            status: 'active',
          });
        }
        if (where.id === 'inactive-admin-id') {
          return Promise.resolve({
            id: 'inactive-admin-id',
            role: 'ADMIN',
            status: 'inactive',
          });
        }
        return Promise.resolve({
          id: 'student-id',
          role: 'STUDENT',
          status: 'active',
        });
      }),
    },
  },
}));

jest.mock('../../src/services/exam.service');

describe('Exam API Integration Tests', () => {
  const app = createApp();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/exams', () => {
    it('should return 200 and list of exams', async () => {
      const mockResult = {
        exams: [{ id: 'exam-1', title: 'IELTS Listening Practice', type: 'LISTENING', duration: 40 }],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      };

      // @ts-ignore
      ExamService.getExams.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/v1/exams?type=LISTENING&page=1&limit=10')
        .set('x-client-id', 'student-id');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(ExamService.getExams).toHaveBeenCalledWith('LISTENING', 1, 10);
    });
  });

  describe('GET /api/v1/exams/:id', () => {
    it('should return 200 and exam details if found', async () => {
      const mockExam = {
        id: 'exam-1',
        title: 'IELTS Reading',
        type: 'READING',
        duration: 60,
        sections: [
          {
            id: 'sec-1',
            sectionOrder: 1,
            title: 'Reading Section 1',
            questions: [{ id: 'q-1', questionNumber: 1, content: 'Q1' }],
          },
        ],
      };

      // @ts-ignore
      ExamService.getExamById.mockResolvedValue(mockExam);

      const response = await request(app)
        .get('/api/v1/exams/exam-1')
        .set('x-client-id', 'student-id');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockExam);
    });

    it('should return 404 if exam not found', async () => {
      // @ts-ignore
      ExamService.getExamById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/exams/non-existent-id')
        .set('x-client-id', 'student-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Exam not found.');
    });
  });

  describe('POST /api/v1/exams', () => {
    const examPayload = {
      title: 'New Exam',
      type: 'READING',
      duration: 60,
      sections: [],
    };

    it('should allow admin to create an exam and return 201', async () => {
      const mockCreatedExam = { id: 'new-exam-id', ...examPayload };
      // @ts-ignore
      ExamService.createExam.mockResolvedValue(mockCreatedExam);

      const response = await request(app)
        .post('/api/v1/exams')
        .set('x-client-id', 'admin-id')
        .send(examPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedExam);
    });

    it('should forbid students from creating exams', async () => {
      const response = await request(app)
        .post('/api/v1/exams')
        .set('x-client-id', 'student-id')
        .send(examPayload);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/Forbidden: Insufficient permissions/);
    });

    it('should forbid inactive admins from creating exams', async () => {
      const response = await request(app)
        .post('/api/v1/exams')
        .set('x-client-id', 'inactive-admin-id')
        .send(examPayload);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toMatch(/Forbidden: User account is inactive/);
    });
  });

  describe('PUT /api/v1/exams/:id', () => {
    const updatePayload = { title: 'Updated Exam Title' };

    it('should allow admin to update an exam and return 200', async () => {
      const mockUpdatedExam = { id: 'exam-1', title: 'Updated Exam Title', type: 'READING', duration: 60 };
      // @ts-ignore
      ExamService.updateExam.mockResolvedValue(mockUpdatedExam);

      const response = await request(app)
        .put('/api/v1/exams/exam-1')
        .set('x-client-id', 'admin-id')
        .send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUpdatedExam);
    });

    it('should return 404 when updating non-existent exam', async () => {
      // @ts-ignore
      ExamService.updateExam.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/v1/exams/non-existent-id')
        .set('x-client-id', 'admin-id')
        .send(updatePayload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Exam not found.');
    });

    it('should forbid students from updating exams', async () => {
      const response = await request(app)
        .put('/api/v1/exams/exam-1')
        .set('x-client-id', 'student-id')
        .send(updatePayload);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/exams/:id', () => {
    it('should allow admin to delete an exam and return 200', async () => {
      const mockDeletedExam = { id: 'exam-1', title: 'Deleted Exam' };
      // @ts-ignore
      ExamService.deleteExam.mockResolvedValue(mockDeletedExam);

      const response = await request(app)
        .delete('/api/v1/exams/exam-1')
        .set('x-client-id', 'admin-id');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Exam deleted successfully.');
    });

    it('should return 404 when deleting non-existent exam', async () => {
      // @ts-ignore
      ExamService.deleteExam.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/v1/exams/non-existent-id')
        .set('x-client-id', 'admin-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should forbid students from deleting exams', async () => {
      const response = await request(app)
        .delete('/api/v1/exams/exam-1')
        .set('x-client-id', 'student-id');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/exams/bulk-import', () => {
    it('should allow admin to bulk-import exams and return 200', async () => {
      const mockImportResult = [{ title: 'Exam 1', success: true, examId: 'id-1' }];
      // @ts-ignore
      ExamService.bulkImport.mockResolvedValue(mockImportResult);

      const response = await request(app)
        .post('/api/v1/exams/bulk-import')
        .set('x-client-id', 'admin-id')
        .send({ exams: [] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockImportResult);
    });

    it('should forbid students from bulk importing', async () => {
      const response = await request(app)
        .post('/api/v1/exams/bulk-import')
        .set('x-client-id', 'student-id')
        .send({ exams: [] });

      expect(response.status).toBe(403);
    });
  });
});
