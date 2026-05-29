const User           = require('../models/User');
const Gig            = require('../models/Gig');
const { matchFreelancers } = require('../utils/aiMatcher');

// @GET /api/ai/match/:gigId — Gig ke liye best freelancers
const getMatchedFreelancers = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig nahi mila!' });
    }

    // Sab freelancers lo
    const freelancers = await User.find({
      role:     'freelancer',
      isActive: true
    }).select('-password');

    if (freelancers.length === 0) {
      return res.json({
        success:    true,
        matches:    [],
        message:    'Koi freelancer nahi mila!'
      });
    }

    // AI se match karo
    const matches = await matchFreelancers(gig, freelancers);

    res.json({
      success:    true,
      gig:        { title: gig.title, skills: gig.skills },
      totalFound: matches.length,
      matches:    matches.slice(0, 10) // Top 10
    });

  } catch (error) {
    next(error);
  }
};

// @GET /api/ai/trending — Trending skills
const getTrendingSkills = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ status: 'open' }).select('skills');

    const skillCount = {};
    gigs.forEach(gig => {
      gig.skills?.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    const trending = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    res.json({ success: true, trending });
  } catch (error) {
    next(error);
  }
};

// @GET /api/ai/recommend — Freelancer ke liye recommended gigs
const getRecommendedGigs = async (req, res, next) => {
  try {
    const freelancer = await User.findById(req.user._id);
    const openGigs   = await Gig.find({ status: 'open' })
      .populate('client', 'name avatar');

    if (openGigs.length === 0) {
      return res.json({ success: true, recommendations: [] });
    }

    // Freelancer skills ke saath gigs match karo
    const recommendations = openGigs.map(gig => {
      const freelancerSkills = freelancer.skills?.map(s => s.toLowerCase()) || [];
      const gigSkills        = gig.skills?.map(s => s.toLowerCase()) || [];
      const matchedSkills    = gigSkills.filter(s => freelancerSkills.includes(s));
      const matchScore       = gigSkills.length > 0
        ? Math.round((matchedSkills.length / gigSkills.length) * 100) : 0;

      return { gig, matchScore, matchedSkills };
    })
    .filter(r => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

    res.json({ success: true, recommendations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatchedFreelancers,
  getTrendingSkills,
  getRecommendedGigs
};