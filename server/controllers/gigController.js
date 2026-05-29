const Gig = require('../models/Gig');

// @POST /api/gigs — Naya gig banao (Client only)
const createGig = async (req, res, next) => {
  try {
    const { title, description, category, skills, budget, deadline, location, milestones } = req.body;

    const gig = await Gig.create({
      title,
      description,
      category,
      skills,
      budget,
      deadline,
      location,
      milestones,
      client: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Gig ban gaya!',
      gig
    });

  } catch (error) {
    next(error);
  }
};

// @GET /api/gigs — Sab gigs dekho (with search + filter)
const getAllGigs = async (req, res, next) => {
  try {
    const { search, category, minBudget, maxBudget, location, status } = req.query;

    let filter = { status: status || 'open' };

    // Search
    if (search) {
      filter.$text = { $search: search };
    }

    // Filters
    if (category)  filter.category = category;
    if (location)  filter.location = new RegExp(location, 'i');
    if (minBudget || maxBudget) {
      filter['budget.min'] = {};
      if (minBudget) filter['budget.min'].$gte = Number(minBudget);
      if (maxBudget) filter['budget.min'].$lte = Number(maxBudget);
    }

    const gigs = await Gig.find(filter)
      .populate('client', 'name avatar location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: gigs.length,
      gigs
    });

  } catch (error) {
    next(error);
  }
};
const getGigById = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('client', 'name avatar location bio')
      .populate('assignedFreelancer', 'name avatar')
      .populate({
        path: 'proposals',
        populate: { path: 'freelancer', select: 'name avatar skills' }
      });

    if (!gig) {
      return res.status(404).json({
        success: false,
        message: 'Gig nahi mila!'
      });
    }

    res.json({ success: true, gig });

  } catch (error) {
    next(error);
  }
};
const updateGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig nahi mila!' });
    }

    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi hai!' });
    }

    const updatedGig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Gig update ho gaya!', gig: updatedGig });

  } catch (error) {
    next(error);
  }
};
const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig nahi mila!' });
    }

    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi hai!' });
    }

    await gig.deleteOne();

    res.json({ success: true, message: 'Gig delete ho gaya!' });

  } catch (error) {
    next(error);
  }
};

// @GET /api/gigs/my — Apne gigs dekho
const getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ client: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: gigs.length, gigs });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGig,
  getAllGigs,
  getGigById,
  updateGig,
  deleteGig,
  getMyGigs
};