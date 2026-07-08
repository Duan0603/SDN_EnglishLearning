import { prisma } from '../config/prisma.config';
import { TestType } from '@prisma/client';
import { GeminiService } from './gemini.service';
import { STTService } from './stt.service';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
        include: {
          sections: {
            select: {
              _count: {
                select: { questions: true }
              }
            }
          }
        }
      }),
      prisma.test.count({ where }),
    ]);

    const examsWithCount = exams.map(exam => {
      const questionsCount = exam.sections.reduce((sum, sec) => sum + (sec._count?.questions || 0), 0);
      const { sections, ...examData } = exam;
      return {
        ...examData,
        questionsCount
      };
    });

    return {
      exams: examsWithCount,
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
   * Submits an exam, calculates correct answers, and computes the band score.
   */
  static async submitExam(userId: string, testId: string, answers: { questionId: string; userAnswer: string }[], timeTaken: number) {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!test) {
      throw new Error('Test not found.');
    }

    // Flatten all questions into a map for quick lookup
    const questionsMap = new Map();
    let totalQuestions = 0;
    test.sections.forEach(sec => {
      sec.questions.forEach(q => {
        questionsMap.set(q.id, q);
        totalQuestions++;
      });
    });

    let correctCount = 0;
    const gradedAnswers = answers.map(ans => {
      const q = questionsMap.get(ans.questionId);
      let isCorrect = false;
      if (q) {
        if (q.answer.trim().toLowerCase() === ans.userAnswer.trim().toLowerCase()) {
          isCorrect = true;
          correctCount++;
        }
      }
      return {
        ...ans,
        isCorrect,
        correctAnswer: q?.answer,
        explanation: q?.explanation
      };
    });

    let bandScore = 0;
    const scaledScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 40 : 0;

    if (scaledScore >= 39) bandScore = 9.0;
    else if (scaledScore >= 37) bandScore = 8.5;
    else if (scaledScore >= 35) bandScore = 8.0;
    else if (scaledScore >= 33) bandScore = 7.5;
    else if (scaledScore >= 30) bandScore = 7.0;
    else if (scaledScore >= 27) bandScore = 6.5;
    else if (scaledScore >= 23) bandScore = 6.0;
    else if (scaledScore >= 19) bandScore = 5.5;
    else if (scaledScore >= 15) bandScore = 5.0;
    else if (scaledScore >= 13) bandScore = 4.5;
    else if (scaledScore >= 10) bandScore = 4.0;
    else if (scaledScore >= 8) bandScore = 3.5;
    else if (scaledScore >= 6) bandScore = 3.0;
    else if (scaledScore >= 4) bandScore = 2.5;
    else if (scaledScore >= 2) bandScore = 2.0;
    else if (scaledScore >= 1) bandScore = 1.0;
    else bandScore = 0.0;

    const result = await prisma.testResult.create({
      data: {
        userId,
        testId,
        answers: gradedAnswers,
        correctCount,
        bandScore,
        timeTaken,
      },
    });

    return {
      resultId: result.id,
      gradedAnswers,
      correctCount,
      totalQuestions,
      bandScore,
    };
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

  /**
   * Evaluates a student's writing response with Gemini AI and saves it to the database.
   */
  static async evaluateWriting(userId: string, testId: string | null, prompt: string, essayText: string) {
    const evaluation = await GeminiService.scoreWriting(essayText, prompt);

    const submission = await prisma.writingSubmission.create({
      data: {
        userId,
        testId: testId || null,
        prompt,
        essayText,
        bandScore: evaluation.bandScore,
        taskAchievement: evaluation.taskAchievement,
        coherenceCohesion: evaluation.coherenceCohesion,
        lexicalResource: evaluation.lexicalResource,
        grammarAccuracy: evaluation.grammarAccuracy,
        aiFeedback: evaluation.aiFeedback,
      }
    });

    return submission;
  }

  /**
   * Evaluates a student's speaking response with STT and Gemini AI.
   */
  static async evaluateSpeaking(userId: string, testId: string | null, prompt: string, audioBase64: string, durationSeconds: number) {
    // 1. Write base64 to temp file
    const tempFilePath = path.join(os.tmpdir(), `speaking-${Date.now()}.m4a`);
    try {
      fs.writeFileSync(tempFilePath, Buffer.from(audioBase64, 'base64'));

      // 2. Transcribe audio using STTService
      const transcription = await STTService.transcribeAudio(tempFilePath);

      // 3. Evaluate transcription using GeminiService
      const evaluation = await GeminiService.scoreSpeaking(transcription, prompt);

      // 4. Save submission to database
      const submission = await prisma.speakingSubmission.create({
        data: {
          userId,
          testId: testId || null,
          prompt,
          audioUrl: "local/temp/path", // In production, upload to S3/Cloudinary and save the URL
          transcription,
          bandScore: evaluation.bandScore,
          fluencyCoherence: evaluation.fluencyCoherence,
          lexicalResource: evaluation.lexicalResource,
          grammarAccuracy: evaluation.grammarAccuracy,
          pronunciation: evaluation.pronunciation,
          aiFeedback: evaluation.aiFeedback,
        }
      });

      return submission;
    } finally {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }
}

