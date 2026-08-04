// ============================================
// EntreSkillHub - Business Idea Matching Engine
// Smart recommendation algorithm based on user profile
// ============================================

const BusinessIdea = require('../models/BusinessIdea');
const Skill = require('../models/Skill');

// ============================================
// Weight Configuration for Matching
// ============================================
const WEIGHTS = {
  SKILLS: 0.40,
  INTERESTS: 0.20,
  INVESTMENT: 0.15,
  DIFFICULTY: 0.10,
  LOCATION: 0.05,
  DEMOGRAPHICS: 0.05,
  POPULARITY: 0.05,
};

// ============================================
// Calculate Skill Match Score
// ============================================
const calculateSkillMatch = (userSkills, requiredSkills) => {
  if (!requiredSkills || requiredSkills.length === 0) return 50;
  if (!userSkills || userSkills.length === 0) return 0;

  const userSkillIds = userSkills.map((s) => s.skill?.toString() || s.toString());
  const proficiencyMap = {};
  userSkills.forEach((s) => {
    const id = s.skill?.toString() || s.toString();
    proficiencyMap[id] = s.proficiency || 'beginner';
  });

  let totalScore = 0;
  let totalWeight = 0;

  requiredSkills.forEach((required) => {
    const requiredId = required.skill?.toString() || required.skill;
    const importance = required.importance || 'important';

    // Weight based on importance
    let weight = 1;
    if (importance === 'essential') weight = 3;
    else if (importance === 'important') weight = 2;
    else if (importance === 'good_to_have') weight = 1;

    totalWeight += weight;

    if (userSkillIds.includes(requiredId)) {
      // User has this skill
      const userLevel = proficiencyMap[requiredId] || 'beginner';
      const requiredLevel = required.minimumLevel || 'beginner';

      const levelValues = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
      const userLevelValue = levelValues[userLevel];
      const requiredLevelValue = levelValues[requiredLevel];

      if (userLevelValue >= requiredLevelValue) {
        totalScore += weight * 100; // Full score
      } else {
        // Partial score based on proximity
        const proximity = userLevelValue / requiredLevelValue;
        totalScore += weight * 100 * proximity;
      }
    }
  });

  return totalWeight > 0 ? Math.min(100, totalScore / totalWeight) : 0;
};

// ============================================
// Calculate Interest Match Score
// ============================================
const calculateInterestMatch = (userInterests, requiredInterests, category) => {
  if (!userInterests || userInterests.length === 0) return 0;

  const normalizedUserInterests = userInterests.map((i) => i.toLowerCase().trim());

  let matches = 0;
  let total = 0;

  // Check required interests
  if (requiredInterests && requiredInterests.length > 0) {
    total = requiredInterests.length;
    requiredInterests.forEach((interest) => {
      const normalized = interest.toLowerCase().trim();
      if (normalizedUserInterests.some((ui) => ui.includes(normalized) || normalized.includes(ui))) {
        matches++;
      }
    });
  }

  // Bonus points if category matches user interests
  if (category) {
    const categoryLower = category.toLowerCase();
    if (normalizedUserInterests.some((i) => categoryLower.includes(i) || i.includes(categoryLower))) {
      matches += 0.5;
      total += 0.5;
    }
  }

  return total > 0 ? Math.min(100, (matches / total) * 100) : 30;
};

// ============================================
// Calculate Investment Match Score
// ============================================
const calculateInvestmentMatch = (userBudget, businessInvestment) => {
  if (!userBudget || !businessInvestment) return 50;

  const { minimum, maximum } = businessInvestment;
  const userMin = userBudget.min || 0;
  const userMax = userBudget.max || Infinity;

  // Perfect match: business investment fits within user budget
  if (minimum >= userMin && maximum <= userMax) return 100;

  // Business minimum is within budget but max exceeds
  if (minimum >= userMin && minimum <= userMax) {
    const overshoot = (maximum - userMax) / userMax;
    return Math.max(50, 100 - overshoot * 50);
  }

  // Business is too expensive
  if (minimum > userMax) {
    const gap = (minimum - userMax) / userMax;
    return Math.max(0, 50 - gap * 50);
  }

  // Business is too cheap (user might want bigger opportunity)
  if (maximum < userMin) {
    return 60; // Still viable but not preferred
  }

  return 50;
};

// ============================================
// Calculate Difficulty Match Score
// ============================================
const calculateDifficultyMatch = (userStage, businessDifficulty) => {
  const stageMap = {
    exploring: ['very_easy', 'easy'],
    planning: ['easy', 'medium'],
    starting: ['medium'],
    operating: ['medium', 'hard'],
    scaling: ['hard', 'very_hard'],
  };

  const preferredDifficulties = stageMap[userStage] || ['medium'];

  if (preferredDifficulties.includes(businessDifficulty)) {
    return 100;
  }

  // Partial score based on proximity
  const difficultyOrder = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
  const userIndex = difficultyOrder.indexOf(preferredDifficulties[0]);
  const businessIndex = difficultyOrder.indexOf(businessDifficulty);

  const distance = Math.abs(userIndex - businessIndex);
  return Math.max(0, 100 - distance * 25);
};

// ============================================
// Calculate Location Match Score
// ============================================
const calculateLocationMatch = (userLocation, businessLocation) => {
  if (!businessLocation || !businessLocation.geography) return 50;

  const geography = businessLocation.geography;

  // Online/international works for everyone
  if (geography === 'international' || geography === 'national') return 100;

  // For location-specific businesses, check compatibility
  if (userLocation && userLocation.city) {
    if (geography === 'hyperlocal' || geography === 'local') return 100;
    if (geography === 'city' || geography === 'state') return 90;
  }

  return 60;
};

// ============================================
// Calculate Demographics Match Score
// ============================================
const calculateDemographicsMatch = (user, businessDemographics) => {
  if (!businessDemographics) return 100;

  let score = 100;
  let checks = 0;

  // Age check
  if (user.age && businessDemographics.ageRange) {
    checks++;
    const { min, max } = businessDemographics.ageRange;
    if (user.age < min || user.age > max) {
      score -= 30;
    }
  }

  // Gender check
  if (user.gender && businessDemographics.gender && businessDemographics.gender !== 'any') {
    checks++;
    if (user.gender !== businessDemographics.gender) {
      score -= 20;
    }
  }

  return Math.max(0, score);
};

// ============================================
// Calculate Popularity Bonus
// ============================================
const calculatePopularityScore = (business) => {
  const viewCount = business.stats?.viewCount || 0;
  const rating = business.rating?.average || 0;
  const startedCount = business.stats?.startedCount || 0;

  let score = 0;
  score += Math.min(30, viewCount / 100);
  score += rating * 10;
  score += Math.min(20, startedCount / 5);

  return Math.min(100, score);
};

// ============================================
// Main Matching Function - Get Recommendations
// ============================================
exports.getRecommendations = async (user, options = {}) => {
  try {
    const {
      limit = 10,
      excludeIds = [],
      category = null,
      minScore = 30,
    } = options;

    // Build query
    const query = {
      isActive: true,
      status: 'approved',
      _id: { $nin: excludeIds },
    };

    if (category) query.category = category;

    // Fetch all eligible business ideas
    const businessIdeas = await BusinessIdea.find(query)
      .populate('requiredSkills.skill')
      .lean();

    if (businessIdeas.length === 0) {
      return { recommendations: [], totalMatched: 0 };
    }

    // Extract user data
    const userSkills = user.skills || [];
    const userInterests = user.interests || [];
    const userBudget = user.preferences?.budget || { min: 0, max: 100000 };
    const userStage = user.entrepreneurshipStage || 'exploring';
    const userLocation = user.location || {};

    // Calculate score for each business idea
    const scoredIdeas = businessIdeas.map((idea) => {
      const skillScore = calculateSkillMatch(userSkills, idea.requiredSkills);
      const interestScore = calculateInterestMatch(userInterests, idea.requiredInterests, idea.category);
      const investmentScore = calculateInvestmentMatch(userBudget, idea.investment);
      const difficultyScore = calculateDifficultyMatch(userStage, idea.difficulty);
      const locationScore = calculateLocationMatch(userLocation, idea.targetMarket);
      const demographicsScore = calculateDemographicsMatch(user, idea.targetMarket?.demographics);
      const popularityScore = calculatePopularityScore(idea);

      // Weighted total score
      const totalScore = Math.round(
        skillScore * WEIGHTS.SKILLS +
        interestScore * WEIGHTS.INTERESTS +
        investmentScore * WEIGHTS.INVESTMENT +
        difficultyScore * WEIGHTS.DIFFICULTY +
        locationScore * WEIGHTS.LOCATION +
        demographicsScore * WEIGHTS.DEMOGRAPHICS +
        popularityScore * WEIGHTS.POPULARITY
      );

      return {
        businessIdea: idea,
        matchScore: totalScore,
        breakdown: {
          skills: Math.round(skillScore),
          interests: Math.round(interestScore),
          investment: Math.round(investmentScore),
          difficulty: Math.round(difficultyScore),
          location: Math.round(locationScore),
          demographics: Math.round(demographicsScore),
          popularity: Math.round(popularityScore),
        },
        matchReasons: generateMatchReasons(idea, {
          skillScore,
          interestScore,
          investmentScore,
          difficultyScore,
        }),
      };
    });

    // Filter by minimum score and sort
    const recommendations = scoredIdeas
      .filter((item) => item.matchScore >= minScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return {
      recommendations,
      totalMatched: recommendations.length,
      totalAnalyzed: businessIdeas.length,
    };
  } catch (error) {
    console.error('Matching engine error:', error.message);
    throw error;
  }
};

// ============================================
// Generate Human-Readable Match Reasons
// ============================================
const generateMatchReasons = (idea, scores) => {
  const reasons = [];

  if (scores.skillScore >= 80) {
    reasons.push('✅ Your skills perfectly match this business');
  } else if (scores.skillScore >= 60) {
    reasons.push('👍 Most of your skills are relevant');
  } else if (scores.skillScore >= 40) {
    reasons.push('📚 Some skill development needed');
  }

  if (scores.interestScore >= 70) {
    reasons.push('❤️ Aligns with your interests');
  }

  if (scores.investmentScore >= 80) {
    reasons.push('💰 Fits your budget perfectly');
  } else if (scores.investmentScore >= 60) {
    reasons.push('💵 Within reasonable budget range');
  }

  if (scores.difficultyScore >= 80) {
    reasons.push('🎯 Right difficulty level for you');
  }

  if (idea.isBeginnerFriendly) {
    reasons.push('🌱 Beginner friendly');
  }

  if (idea.isLowInvestment) {
    reasons.push('💸 Low investment required');
  }

  return reasons.slice(0, 4);
};

// ============================================
// Get Similar Business Ideas
// ============================================
exports.getSimilarBusinesses = async (businessId, limit = 5) => {
  try {
    const business = await BusinessIdea.findById(businessId).lean();
    if (!business) return [];

    const similar = await BusinessIdea.find({
      _id: { $ne: businessId },
      isActive: true,
      status: 'approved',
      $or: [
        { category: business.category },
        { subCategory: business.subCategory },
        { tags: { $in: business.tags } },
      ],
    })
      .sort({ 'stats.viewCount': -1 })
      .limit(limit)
      .lean();

    return similar;
  } catch (error) {
    console.error('Similar businesses error:', error.message);
    return [];
  }
};

// ============================================
// Get Trending Ideas for User
// ============================================
exports.getTrendingForUser = async (user, limit = 10) => {
  try {
    const userCategories = user.interests || [];

    const trending = await BusinessIdea.find({
      isActive: true,
      status: 'approved',
      isTrending: true,
      ...(userCategories.length > 0 && { category: { $in: userCategories } }),
    })
      .sort({ 'stats.viewCount': -1 })
      .limit(limit)
      .lean();

    return trending;
  } catch (error) {
    console.error('Trending for user error:', error.message);
    return [];
  }
};

// ============================================
// Categorize User Profile
// ============================================
exports.categorizeUser = (user) => {
  const skills = user.skills?.length || 0;
  const interests = user.interests?.length || 0;
  const stage = user.entrepreneurshipStage || 'exploring';

  let profileStrength = 'beginner';
  if (skills >= 5 && interests >= 3) profileStrength = 'strong';
  else if (skills >= 3 && interests >= 2) profileStrength = 'moderate';

  return {
    profileStrength,
    stage,
    recommendationType:
      stage === 'exploring' ? 'discovery' : stage === 'scaling' ? 'advanced' : 'growth',
  };
};

module.exports = exports;