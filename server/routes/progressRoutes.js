const express = require('express');
const router  = express.Router();
const {
  createProgress,
  getProgress,
  completeTask,
  addLog,
  addTask
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',                           protect, createProgress);
router.get('/:gigId',                      protect, getProgress);
router.put('/:gigId/task/:taskId',         protect, completeTask);
router.post('/:gigId/log',                 protect, addLog);
router.post('/:gigId/task',                protect, addTask);

module.exports = router;