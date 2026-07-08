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

    const [results, total] = await Promise.all([
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
      prisma.testResult.count({ where: { userId } }),
    ]);

    // Normalize shape for frontend
    const normalized = results.map(r => ({
      id:          r.id,
      bandScore:   r.bandScore,
      correctCount: r.correctCount,
      timeTaken:   r.timeTaken,
      createdAt:   r.createdAt,
      type:        r.test?.type   || 'READING',
      title:       r.test?.title  || 'IELTS Test',
      test:        r.test,
    }));

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

    const hasCheckedInToday = checkIsToday(userRecord?.lastCheckIn);
    const currentStreak = userRecord?.currentStreak || 0;

    let weeksActive = 1;
    if (userRecord?.createdAt) {
      const diffTime = Math.abs(new Date().getTime() - new Date(userRecord.createdAt).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      weeksActive = Math.ceil(diffDays / 7) || 1;
    }

    // Fetch all results for this user
    const results = await prisma.testResult.findMany({
      where: { userId },
      include: { test: { select: { type: true } } },
    });

    if (results.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          overallBand:   null,
          readingBand:   null,
          listeningBand: null,
          writingBand:   null,
          speakingBand:  null,
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
    const byType = { READING: [], LISTENING: [], WRITING: [], SPEAKING: [] };
    results.forEach(r => {
      const type = r.test?.type;
      if (type && byType[type] !== undefined) {
        byType[type].push(r.bandScore || 0);
      }
    });

    const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    const readingBand   = avg(byType.READING);
    const listeningBand = avg(byType.LISTENING);
    const writingBand   = avg(byType.WRITING);
    const speakingBand  = avg(byType.SPEAKING);

    const definedBands = [readingBand, listeningBand, writingBand, speakingBand].filter(b => b !== null);
    const overallBand  = definedBands.length > 0
      ? parseFloat((definedBands.reduce((a, b) => a + b, 0) / definedBands.length).toFixed(1))
      : null;

    const topScore = Math.max(...results.map(r => r.bandScore || 0));

    // Rough study hours: sum of timeTaken (in seconds) / 3600
    const totalSeconds = results.reduce((sum, r) => sum + (r.timeTaken || 0), 0);
    const studyHours   = parseFloat((totalSeconds / 3600).toFixed(1));

    return res.status(200).json({
      success: true,
      data: {
        overallBand,
        readingBand:   readingBand   ? parseFloat(readingBand.toFixed(1))   : null,
        listeningBand: listeningBand ? parseFloat(listeningBand.toFixed(1)) : null,
        writingBand:   writingBand   ? parseFloat(writingBand.toFixed(1))   : null,
        speakingBand:  speakingBand  ? parseFloat(speakingBand.toFixed(1))  : null,
        totalTests:    results.length,
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
