import express from 'express';
import Grade from '../modules/grade.mjs'; 

const router = express.Router();

/**
 * Grading Weights by Score Type:
 * - Exams: 50%
 * - Quizzes: 30%
 * - Homework: 20%
 */

// Get the weighted average of a specified learner's grades per class
router.get('/learner/:id/avg-class', async (req, res) => {
  try {
    const learnerId = Number(req.params.id);

    const result = await Grade.aggregate([
      { $match: { learner_id: learnerId } },
      { $unwind: '$scores' },
      {
        $group: {
          _id: '$class_id',
          exams: {
            $push: {
              $cond: [
                { $eq: ['$scores.type', 'exam'] },
                '$scores.score',
                '$$REMOVE'
              ]
            }
          },
          quizzes: {
            $push: {
              $cond: [
                { $eq: ['$scores.type', 'quiz'] },
                '$scores.score',
                '$$REMOVE'
              ]
            }
          },
          homework: {
            $push: {
              $cond: [
                { $eq: ['$scores.type', 'homework'] },
                '$scores.score',
                '$$REMOVE'
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          class_id: '$_id',
          avg: {
            $sum: [
              { $multiply: [{ $avg: '$exams' }, 0.5] },
              { $multiply: [{ $avg: '$quizzes' }, 0.3] },
              { $multiply: [{ $avg: '$homework' }, 0.2] }
            ]
          }
        }
      }
    ]);

    if (!result || result.length === 0) {
      return res.status(404).send('Not found');
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).send('Server error');
  }
});

export default router;
