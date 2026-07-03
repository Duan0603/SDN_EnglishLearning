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
      },
    });
  } catch (err) {
    next(err);
  }
};
