const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig');
const createProposal = async (req, res, next) => {
  try {
    const { coverLetter, bidAmount, deliveryTime } = req.body;
    const gigId = req.params.gigId;

    // Gig exist karta hai?
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig nahi mila!' });
    }

    // Sirf open gigs pe proposal bhej sakte hain
    if (gig.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Yeh gig open nahi hai!' });
    }

    // Client apne gig pe proposal nahi bhej sakta
    if (gig.client.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Apne gig pe proposal nahi bhej sakte!' });
    }

    // Pehle se proposal bheja hai?
    const existingProposal = await Proposal.findOne({
      gig: gigId,
      freelancer: req.user._id
    });
    if (existingProposal) {
      return res.status(400).json({ success: false, message: 'Pehle se proposal bhej chuke ho!' });
    }

    // Proposal banao
    const proposal = await Proposal.create({
      gig: gigId,
      freelancer: req.user._id,
      coverLetter,
      bidAmount,
      deliveryTime
    });

    // Gig mein proposal add karo
    gig.proposals.push(proposal._id);
    await gig.save();

    res.status(201).json({
      success: true,
      message: 'Proposal bhej diya!',
      proposal
    });

  } catch (error) {
    next(error);
  }
};

// @GET /api/proposals/gig/:gigId — Gig ke proposals dekho
const getGigProposals = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig nahi mila!' });
    }

    // Sirf gig owner dekh sakta hai
    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi hai!' });
    }

    const proposals = await Proposal.find({ gig: req.params.gigId })
      .populate('freelancer', 'name avatar skills bio hourlyRate location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: proposals.length, proposals });

  } catch (error) {
    next(error);
  }
};

// @GET /api/proposals/my — Apne proposals dekho (Freelancer)
const getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user._id })
      .populate('gig', 'title budget status deadline category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: proposals.length, proposals });

  } catch (error) {
    next(error);
  }
};

// @PUT /api/proposals/:id/accept — Proposal accept karo
const acceptProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal nahi mila!' });
    }

    const gig = await Gig.findById(proposal.gig);

    // Sirf client accept kar sakta hai
    if (gig.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Permission nahi hai!' });
    }

    // Proposal accept karo
    proposal.status = 'accepted';
    await proposal.save();

    // Gig update karo
    gig.status = 'in-progress';
    gig.assignedFreelancer = proposal.freelancer;
    await gig.save();

    // Baki proposals reject karo
    await Proposal.updateMany(
      { gig: proposal.gig, _id: { $ne: proposal._id } },
      { status: 'rejected' }
    );

    res.json({ success: true, message: 'Proposal accept ho gaya!', proposal });

  } catch (error) {
    next(error);
  }
};

// @PUT /api/proposals/:id/reject — Proposal reject karo
const rejectProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal nahi mila!' });
    }

    proposal.status = 'rejected';
    await proposal.save();

    res.json({ success: true, message: 'Proposal reject ho gaya!' });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProposal,
  getGigProposals,
  getMyProposals,
  acceptProposal,
  rejectProposal
};