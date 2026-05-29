const Progress = require('../models/Progress');
const Gig      = require('../models/Gig');

// @POST /api/progress — Progress tracker banao
const createProgress = async (req, res, next) => {
  try {
    const { gigId, tasks, deadline } = req.body;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig nahi mila!' });
    }

    // Pehle se exist karta hai?
    const existing = await Progress.findOne({ gig: gigId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Progress tracker pehle se hai!' });
    }

    const progress = await Progress.create({
      gig:        gigId,
      freelancer: gig.assignedFreelancer,
      client:     gig.client,
      tasks:      tasks || [],
      deadline:   deadline || gig.deadline
    });

    res.status(201).json({
      success: true,
      message: 'Progress tracker ban gaya!',
      progress
    });
  } catch (error) {
    next(error);
  }
};

// @GET /api/progress/:gigId — Progress dekho
const getProgress = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ gig: req.params.gigId })
      .populate('freelancer', 'name avatar')
      .populate('client',     'name avatar')
      .populate('gig',        'title deadline');

    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress tracker nahi mila!' });
    }

    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
};

// @PUT /api/progress/:gigId/task/:taskId — Task complete karo
const completeTask = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ gig: req.params.gigId });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress nahi mila!' });
    }

    const task = progress.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task nahi mila!' });
    }

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;

    // Percentage update karo
    const completed  = progress.tasks.filter(t => t.isCompleted).length;
    progress.percentage = Math.round((completed / progress.tasks.length) * 100);

    // Log add karo
    progress.logs.push({
      message: `Task "${task.title}" ${task.isCompleted ? 'complete' : 'incomplete'} hua!`
    });

    await progress.save();

    res.json({
      success:    true,
      message:    `Task ${task.isCompleted ? 'complete' : 'incomplete'} ho gaya!`,
      progress
    });
  } catch (error) {
    next(error);
  }
};

// @POST /api/progress/:gigId/log — Log add karo
const addLog = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ gig: req.params.gigId });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress nahi mila!' });
    }

    progress.logs.push({ message: req.body.message });
    await progress.save();

    res.json({ success: true, message: 'Log add ho gaya!', progress });
  } catch (error) {
    next(error);
  }
};

// @POST /api/progress/:gigId/task — Naya task add karo
const addTask = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ gig: req.params.gigId });
    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress nahi mila!' });
    }

    progress.tasks.push({
      title:       req.body.title,
      description: req.body.description
    });

    await progress.save();

    res.json({ success: true, message: 'Task add ho gaya!', progress });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProgress,
  getProgress,
  completeTask,
  addLog,
  addTask
};