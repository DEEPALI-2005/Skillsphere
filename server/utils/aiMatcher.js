const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// Text ko embedding mein convert karo
const getEmbedding = async (text) => {
  try {
    const response = await hf.featureExtraction({
      model:  'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text
    });
    return response;
  } catch (error) {
    console.error('Embedding error:', error.message);
    return null;
  }
};

// Cosine similarity calculate karo
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB) return 0;
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

// Freelancers ko gig ke saath match karo
const matchFreelancers = async (gig, freelancers) => {
  try {
    // Gig ka text banao
    const gigText = `${gig.title} ${gig.description} ${gig.skills?.join(' ')} ${gig.category}`;
    const gigEmbedding = await getEmbedding(gigText);

    const scoredFreelancers = await Promise.all(
      freelancers.map(async (freelancer) => {
        // Freelancer ka text banao
        const freelancerText = `
          ${freelancer.skills?.join(' ')}
          ${freelancer.bio || ''}
          ${freelancer.location || ''}
        `.trim();

        const freelancerEmbedding = await getEmbedding(freelancerText);

        // AI similarity score
        const aiScore = cosineSimilarity(gigEmbedding, freelancerEmbedding);

        // Rating score (0-1)
        const ratingScore = (freelancer.rating || 0) / 5;

        // Location bonus
        const locationBonus = gig.location && freelancer.location &&
          freelancer.location.toLowerCase().includes(gig.location.toLowerCase())
          ? 0.1 : 0;

        // Skill match bonus
        const gigSkills        = gig.skills?.map(s => s.toLowerCase()) || [];
        const freelancerSkills = freelancer.skills?.map(s => s.toLowerCase()) || [];
        const matchedSkills    = gigSkills.filter(s => freelancerSkills.includes(s));
        const skillBonus       = gigSkills.length > 0
          ? (matchedSkills.length / gigSkills.length) * 0.2 : 0;

        // Final score — AI + Rating + Location + Skills
        const finalScore = (aiScore * 0.5) + (ratingScore * 0.2) + locationBonus + skillBonus;

        return {
          freelancer,
          aiScore:      Math.round(aiScore * 100),
          ratingScore:  Math.round(ratingScore * 100),
          skillMatch:   matchedSkills,
          finalScore:   Math.round(finalScore * 100),
          matchedSkills: matchedSkills.length
        };
      })
    );

    // Score ke hisaab se sort karo
    return scoredFreelancers.sort((a, b) => b.finalScore - a.finalScore);

  } catch (error) {
    console.error('AI Matching error:', error.message);
    // Fallback — simple skill matching
    return freelancers.map(freelancer => {
      const gigSkills        = gig.skills?.map(s => s.toLowerCase()) || [];
      const freelancerSkills = freelancer.skills?.map(s => s.toLowerCase()) || [];
      const matchedSkills    = gigSkills.filter(s => freelancerSkills.includes(s));
      const skillScore       = gigSkills.length > 0
        ? Math.round((matchedSkills.length / gigSkills.length) * 100) : 0;

      return {
        freelancer,
        aiScore:       skillScore,
        ratingScore:   Math.round((freelancer.rating || 0) * 20),
        skillMatch:    matchedSkills,
        finalScore:    skillScore,
        matchedSkills: matchedSkills.length
      };
    }).sort((a, b) => b.finalScore - a.finalScore);
  }
};

module.exports = { matchFreelancers };