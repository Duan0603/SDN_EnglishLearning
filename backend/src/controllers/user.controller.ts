import { prisma } from '../config/prisma.config';

/**
 * GET /api/v1/users/me/results
 * Returns the authenticated user's test results (paginated), including the test title and type.
 */
export const getUserResults = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const page  = parseInt(req.query.page  || '1',  10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip  = (page - 1) * limit;

    const [results, writingSubmissions, speakingSubmissions, totalResults, totalWriting, totalSpeaking] = await Promise.all([
      prisma.testResult.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          test: {
            select: { id: true, title: true, type: true, duration: true },
          },
        },
      }),
      prisma.writingSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          test: { select: { id: true, title: true, type: true, duration: true } }
        }
      }),
      prisma.speakingSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          test: { select: { id: true, title: true, type: true, duration: true } }
        }
      }),
      prisma.testResult.count({ where: { userId } }),
      prisma.writingSubmission.count({ where: { userId } }),
      prisma.speakingSubmission.count({ where: { userId } }),
    ]);

    const total = totalResults + totalWriting + totalSpeaking;

    // Normalize shape for frontend
    const normalizedResults = results.map(r => ({
      id:          r.id,
      bandScore:   r.bandScore,
      correctCount: r.correctCount,
      timeTaken:   r.timeTaken,
      createdAt:   r.createdAt,
      type:        r.test?.type   || 'READING',
      title:       r.test?.title  || 'IELTS Test',
      test:        r.test,
    }));

    const normalizedWriting = writingSubmissions.map(w => ({
      id:          w.id,
      bandScore:   w.bandScore,
      correctCount: null,
      timeTaken:   null,
      createdAt:   w.createdAt,
      type:        'WRITING',
      title:       w.test?.title || w.prompt || 'Writing Test',
      test:        w.test,
    }));

    const normalizedSpeaking = speakingSubmissions.map(s => ({
      id:          s.id,
      bandScore:   s.bandScore,
      correctCount: null,
      timeTaken:   null,
      createdAt:   s.createdAt,
      type:        'SPEAKING',
      title:       s.test?.title || s.prompt || 'Speaking Test',
      test:        s.test,
    }));

    // Merge and sort
    const allNormalized = [...normalizedResults, ...normalizedWriting, ...normalizedSpeaking]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit); // Apply limit after merging locally since we fetched limit for each type

    const normalized = allNormalized;

    return res.status(200).json({
      success: true,
      data: {
        results: normalized,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/me/stats
 * Returns aggregate statistics for the authenticated user:
 * - overallBand (average of best band per skill)
 * - bandScore per skill (READING, LISTENING, WRITING, SPEAKING)
 * - totalTests
 * - topScore
 */
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Fetch user for streak stats
    const userRecord = await (prisma.user as any).findUnique({
      where: { id: userId },
      select: { currentStreak: true, lastCheckIn: true, createdAt: true }
    });

    const checkIsToday = (date) => {
      if (!date) return false;
      const today = new Date();
      const d = new Date(date);
      return today.getFullYear() === d.getFullYear() &&
             today.getMonth() === d.getMonth() &&
             today.getDate() === d.getDate();
    };

    const checkIsYesterday = (date) => {
      if (!date) return false;
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const d = new Date(date);
      return yesterday.getFullYear() === d.getFullYear() &&
             yesterday.getMonth() === d.getMonth() &&
             yesterday.getDate() === d.getDate();
    };

    const hasCheckedInToday = checkIsToday(userRecord?.lastCheckIn);
    const hasCheckedInYesterday = checkIsYesterday(userRecord?.lastCheckIn);
    
    let currentStreak = userRecord?.currentStreak || 0;
    if (!hasCheckedInToday && !hasCheckedInYesterday && currentStreak > 0) {
      currentStreak = 0;
    }
    let weeksActive = 1;
    if (userRecord?.createdAt) {
      const diffTime = Math.abs(new Date().getTime() - new Date(userRecord.createdAt).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      weeksActive = Math.ceil(diffDays / 7) || 1;
    }

    // Fetch all results for this user and total test counts
    const [results, writingSubmissions, speakingSubmissions, totalReading, totalListening, totalWriting, totalSpeaking] = await Promise.all([
      prisma.testResult.findMany({
        where: { userId },
        include: { test: { select: { type: true } } },
      }),
      prisma.writingSubmission.findMany({
        where: { userId },
        select: { testId: true, bandScore: true, createdAt: true }
      }),
      prisma.speakingSubmission.findMany({
        where: { userId },
        select: { testId: true, bandScore: true, createdAt: true }
      }),
      prisma.test.count({ where: { type: 'READING' } }),
      prisma.test.count({ where: { type: 'LISTENING' } }),
      prisma.test.count({ where: { type: 'WRITING' } }),
      prisma.test.count({ where: { type: 'SPEAKING' } }),
    ]);

    const totalTestsCount = results.length + writingSubmissions.length + speakingSubmissions.length;

    const completedReadingCount = new Set(results.filter(r => r.test?.type === 'READING').map(r => r.testId)).size;
    const completedListeningCount = new Set(results.filter(r => r.test?.type === 'LISTENING').map(r => r.testId)).size;
    const completedWritingCount = new Set(writingSubmissions.filter(w => w.testId).map(w => w.testId)).size;
    const completedSpeakingCount = new Set(speakingSubmissions.filter(s => s.testId).map(s => s.testId)).size;

    const readingProgress = totalReading > 0 ? Math.min(100, Math.round((completedReadingCount / totalReading) * 100)) : 0;
    const listeningProgress = totalListening > 0 ? Math.min(100, Math.round((completedListeningCount / totalListening) * 100)) : 0;
    const writingProgress = totalWriting > 0 ? Math.min(100, Math.round((completedWritingCount / totalWriting) * 100)) : 0;
    const speakingProgress = totalSpeaking > 0 ? Math.min(100, Math.round((completedSpeakingCount / totalSpeaking) * 100)) : 0;

    if (totalTestsCount === 0) {
      return res.status(200).json({
        success: true,
        data: {
          overallBand:   null,
          readingBand:   null,
          listeningBand: null,
          writingBand:   null,
          speakingBand:  null,
          readingProgress:  0,
          listeningProgress: 0,
          writingProgress:   0,
          speakingProgress:  0,
          totalTests:    0,
          topScore:      null,
          studyHours:    0,
          currentStreak,
          hasCheckedInToday,
          weeksActive
        },
      });
    }

    // Group by test type and calculate average band score per type
    const byType = { READING: [] as number[], LISTENING: [] as number[], WRITING: [] as number[], SPEAKING: [] as number[] };
    
    results.forEach(r => {
      const type = r.test?.type;
      if (type && byType[type as keyof typeof byType] !== undefined) {
        byType[type as keyof typeof byType].push(r.bandScore || 0);
      }
    });

    writingSubmissions.forEach(w => {
      byType.WRITING.push(w.bandScore || 0);
    });

    speakingSubmissions.forEach(s => {
      byType.SPEAKING.push(s.bandScore || 0);
    });

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const readingBand   = avg(byType.READING);
    const listeningBand = avg(byType.LISTENING);
    const writingBand   = avg(byType.WRITING);
    const speakingBand  = avg(byType.SPEAKING);

    const definedBands = [readingBand, listeningBand, writingBand, speakingBand].filter(b => b !== null) as number[];
    const overallBand  = definedBands.length > 0
      ? parseFloat((definedBands.reduce((a, b) => a + b, 0) / definedBands.length).toFixed(1))
      : null;

    const allScores = [
      ...results.map(r => r.bandScore || 0),
      ...writingSubmissions.map(w => w.bandScore || 0),
      ...speakingSubmissions.map(s => s.bandScore || 0)
    ];
    const topScore = allScores.length > 0 ? Math.max(...allScores) : 0;

    // Rough study hours: sum of timeTaken (in seconds) / 3600
    // Give 15 mins (900s) per writing/speaking submission as an estimate if timeTaken isn't tracked
    const totalSeconds = results.reduce((sum, r) => sum + (r.timeTaken || 0), 0) 
                       + (writingSubmissions.length * 900) 
                       + (speakingSubmissions.length * 900);
    const studyHours   = parseFloat((totalSeconds / 3600).toFixed(1));

    return res.status(200).json({
      success: true,
      data: {
        overallBand,
        readingBand:   readingBand   ? parseFloat(readingBand.toFixed(1))   : null,
        listeningBand: listeningBand ? parseFloat(listeningBand.toFixed(1)) : null,
        writingBand:   writingBand   ? parseFloat(writingBand.toFixed(1))   : null,
        speakingBand:  speakingBand  ? parseFloat(speakingBand.toFixed(1))  :  null,
        readingProgress,
        listeningProgress,
        writingProgress,
        speakingProgress,
        totalTests:    totalTestsCount,
        topScore:      parseFloat(topScore.toFixed(1)),
        studyHours,
        currentStreak,
        hasCheckedInToday,
        weeksActive
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/users/me/checkin
 * Checks in the authenticated user and increments their streak.
 */
export const checkInUser = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userRecord = await (prisma.user as any).findUnique({
      where: { id: userId },
      select: { currentStreak: true, lastCheckIn: true }
    });

    if (!userRecord) return res.status(404).json({ success: false, message: 'User not found' });

    const lastCheckIn = userRecord.lastCheckIn;
    const today = new Date();

    const checkIsToday = (date) => {
      if (!date) return false;
      const d = new Date(date);
      return today.getFullYear() === d.getFullYear() &&
             today.getMonth() === d.getMonth() &&
             today.getDate() === d.getDate();
    };

    if (checkIsToday(lastCheckIn)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã điểm danh hôm nay rồi!'
      });
    }

    const checkIsYesterday = (date) => {
      if (!date) return false;
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const d = new Date(date);
      return yesterday.getFullYear() === d.getFullYear() &&
             yesterday.getMonth() === d.getMonth() &&
             yesterday.getDate() === d.getDate();
    };

    let newStreak = 1;
    if (lastCheckIn) {
      if (checkIsYesterday(lastCheckIn)) {
        newStreak = (userRecord.currentStreak || 0) + 1;
      } else {
        newStreak = 1;
      }
    }

    await (prisma.user as any).update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        lastCheckIn: today
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Điểm danh thành công!',
      data: {
        currentStreak: newStreak,
        lastCheckIn: today
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * MOCK ENDPOINT FOR TESTING STREAK
 * POST /api/v1/users/me/test-streak
 * Body: { lastCheckIn: Date string or null, checkInStreak: number }
 */
export const updateTestStreak = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.headers['x-client-id'] as string;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { lastCheckIn, checkInStreak } = req.body;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastCheckIn: lastCheckIn ? new Date(lastCheckIn) : null,
        currentStreak: checkInStreak || 0
      }
    });

    res.status(200).json({
      success: true,
      message: 'Test streak updated successfully!',
      data: { lastCheckIn, checkInStreak }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/me/results/test/:id
 * Get detail of a specific Reading/Listening TestResult
 */
export const getTestResultDetail = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.headers['x-client-id'] as string;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const result = await prisma.testResult.findFirst({
      where: { id, userId },
      include: {
        test: {
          include: {
            sections: {
              include: {
                questions: true
              }
            }
          }
        }
      }
    });

    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/me/results/writing/:id
 * Get detail of a specific WritingSubmission
 */
export const getWritingSubmissionDetail = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.headers['x-client-id'] as string;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const submission = await prisma.writingSubmission.findFirst({
      where: { id, userId },
      include: {
        test: true
      }
    });

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    res.status(200).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/users/me/results/speaking/:id
 * Get detail of a specific SpeakingSubmission
 */
export const getSpeakingSubmissionDetail = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.userId || req.user?.id || req.headers['x-client-id'] as string;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const submission = await prisma.speakingSubmission.findFirst({
      where: { id, userId },
      include: {
        test: true
      }
    });

    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    res.status(200).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};
