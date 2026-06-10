import { prisma } from '../config/prisma.config';
import { TestType } from '@prisma/client';

export class ExamService {
  /**
   * Creates a new IELTS Test with sections and questions in a single transaction.
   */
  static async createExam(data: any) {
    const { title, description, type, duration, sections } = data;

    if (!title || !type || !duration) {
      throw new Error('Title, type, and duration are required.');
    }

    return prisma.$transaction(async (tx) => {
      const test = await tx.test.create({
        data: {
          title,
          description,
          type: type as TestType,
          duration: parseInt(duration, 10),
        },
      });

      if (sections && sections.length > 0) {
        for (const section of sections) {
          const createdSection = await tx.testSection.create({
            data: {
              testId: test.id,
              sectionOrder: parseInt(section.sectionOrder, 10),
              title: section.title || null,
              passageText: section.passageText || null,
              audioUrl: section.audioUrl || null,
              images: section.images || [],
            },
          });

          if (section.questions && section.questions.length > 0) {
            await tx.question.createMany({
              data: section.questions.map((q: any) => ({
                sectionId: createdSection.id,
                questionNumber: parseInt(q.questionNumber, 10),
                type: q.type,
                content: q.content,
                options: q.options || null,
                answer: String(q.answer),
                explanation: q.explanation || null,
              })),
            });
          }
        }
      }

      return test;
    });
  }

  /**
   * Returns a paginated list of all exams (excluding detailed nested section content to optimize payload).
   */
  static async getExams(type?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    // Build query conditions
    const where: any = {};
    if (type) {
      where.type = type as TestType;
    }

    const [exams, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.test.count({ where }),
    ]);

    return {
      exams,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetches full exam details, including sections and questions.
   */
  static async getExamById(id: string) {
    const test = await prisma.test.findUnique({
      where: { id },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (test && test.sections) {
      // Sort sections by sectionOrder
      test.sections.sort((a, b) => a.sectionOrder - b.sectionOrder);
      
      // Sort questions within sections by questionNumber
      for (const sec of test.sections) {
        if (sec.questions) {
          sec.questions.sort((a, b) => a.questionNumber - b.questionNumber);
        }
      }
    }

    return test;
  }

  /**
   * Updates an existing exam, replacing all sections and questions transactionally if provided.
   */
  static async updateExam(id: string, data: any) {
    const { title, description, type, duration, sections } = data;

    // Check if the exam exists first
    const existingExam = await prisma.test.findUnique({ where: { id } });
    if (!existingExam) {
      return null;
    }

    return prisma.$transaction(async (tx) => {
      const updatedTest = await tx.test.update({
        where: { id },
        data: {
          title: title !== undefined ? title : existingExam.title,
          description: description !== undefined ? description : existingExam.description,
          type: type !== undefined ? (type as TestType) : existingExam.type,
          duration: duration !== undefined ? parseInt(duration, 10) : existingExam.duration,
        },
      });

      // If sections are provided, we replace the existing ones
      if (sections !== undefined) {
        // Delete all old sections (cascade delete automatically cleans up questions)
        await tx.testSection.deleteMany({
          where: { testId: id },
        });

        // Create new sections and questions
        for (const section of sections) {
          const createdSection = await tx.testSection.create({
            data: {
              testId: id,
              sectionOrder: parseInt(section.sectionOrder, 10),
              title: section.title || null,
              passageText: section.passageText || null,
              audioUrl: section.audioUrl || null,
              images: section.images || [],
            },
          });

          if (section.questions && section.questions.length > 0) {
            await tx.question.createMany({
              data: section.questions.map((q: any) => ({
                sectionId: createdSection.id,
                questionNumber: parseInt(q.questionNumber, 10),
                type: q.type,
                content: q.content,
                options: q.options || null,
                answer: String(q.answer),
                explanation: q.explanation || null,
              })),
            });
          }
        }
      }

      return updatedTest;
    });
  }

  /**
   * Deletes an exam and all related sections/questions.
   */
  static async deleteExam(id: string) {
    const existingExam = await prisma.test.findUnique({ where: { id } });
    if (!existingExam) {
      return null;
    }

    return prisma.$transaction(async (tx) => {
      // Explicitly delete sections first (and cascade delete will handle questions)
      // then delete the test itself
      await tx.testSection.deleteMany({
        where: { testId: id },
      });

      return tx.test.delete({
        where: { id },
      });
    });
  }

  /**
   * Handles bulk importing of multiple exams.
   */
  static async bulkImport(exams: any[]) {
    if (!Array.isArray(exams)) {
      throw new Error('Import data must be an array of exams.');
    }

    const results = [];
    for (const examData of exams) {
      try {
        const created = await this.createExam(examData);
        results.push({
          title: examData.title,
          success: true,
          examId: created.id,
        });
      } catch (err: any) {
        results.push({
          title: examData.title,
          success: false,
          error: err.message || 'Unknown error occurred.',
        });
      }
    }
    return results;
  }
}
