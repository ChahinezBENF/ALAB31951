import express from "express";

import Grade from '../models/grade.mjs';

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to the API.");
});

// Create a single grade entry
router.post('/', async (req, res) => {
  try {
    const newGrade = await Grade.create(req.body);
    res.status(201).json(newGrade);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Get a single grade entry
router.get('/:id', async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json(grade);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Add a score to a grade entry
router.patch('/:id/add', async (req, res) => {
  try {
    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      { $push: { scores: req.body } },
      { new: true, runValidators: true }
    );
    if (!updatedGrade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json(updatedGrade);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Remove a score from a grade entry
router.patch('/:id/remove', async (req, res) => {
  try {
    const updatedGrade = await Grade.findByIdAndUpdate(
      req.params.id,
      { $pull: { scores: req.body } },
      { new: true }
    );
    if (!updatedGrade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json(updatedGrade);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Delete a single grade entry
router.delete('/:id', async (req, res) => {
  try {
    const deletedGrade = await Grade.findByIdAndDelete(req.params.id);
    if (!deletedGrade) {
      return res.status(404).json({ message: 'Grade not found' });
    }
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Get route for backwards compatibility
router.get("/student/:id", async (req, res) => {
  res.redirect(`learner/${req.params.id}`);
});

// Get a learner's grade data
router.get('/learner/:id', async (req, res) => {
  try {
    const query = { learner_id: Number(req.params.id) };
    if (req.query.class) {
      query.class_id = Number(req.query.class);
    }
    const grades = await Grade.find(query);
    res.json(grades);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Delete a learner's grade data

router.delete('/learner/:id', async (req, res) => {
  try {
    const result = await Grade.deleteMany({ learner_id: Number(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Learner's grade entries not found" });
    }
    res.json({ message: "Learner's grade entries deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Get a class's grade data
router.get('/class/:id', async (req, res) => {
  try {
    const query = { class_id: Number(req.params.id) };
    if (req.query.learner) {
      query.learner_id = Number(req.query.learner);
    }
    const grades = await Grade.find(query);
    res.json(grades);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Update a class id
router.patch('/class/:id', async (req, res) => {
  try {
    const oldClassId = Number(req.params.id);
    const newClassId = Number(req.body.class_id);
    const result = await Grade.updateMany(
      { class_id: oldClassId },
      { class_id: newClassId }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'No grade entries found for the specified class ID' });
    }
    res.json({ message: `Updated ${result.modifiedCount} grade entries from class ID ${oldClassId} to ${newClassId}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Delete a class
router.delete('/class/:id', async (req, res) => {
  try {
    const result = await Grade.deleteMany({ class_id: Number(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No grade entries found for the specified class ID' });
    }
    res.json({ message: 'Class grade entries deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


export default router;
