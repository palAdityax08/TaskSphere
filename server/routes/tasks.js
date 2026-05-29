const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }).withMessage('Title too long'),
    body('stage').optional().isIn(['todo', 'inprogress', 'done']).withMessage('Invalid stage'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { title, description, stage, priority, dueDate } = req.body;
      const task = await Task.create({
        user: req.user._id,
        title,
        description,
        stage: stage || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate || null,
      });
      res.status(201).json({ success: true, task });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }
);

router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 100 }),
    body('stage').optional().isIn(['todo', 'inprogress', 'done']).withMessage('Invalid stage'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }

      const allowedFields = ['title', 'description', 'stage', 'priority', 'dueDate'];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          task[field] = req.body[field];
        }
      });

      await task.save();
      res.json({ success: true, task });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }
);

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});

module.exports = router;
