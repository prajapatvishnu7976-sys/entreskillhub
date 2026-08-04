// ============================================
// EntreSkillHub - Mentor Controller
// Mentor profiles, registration, search
// ============================================

const Mentor = require('../models/Mentor');
const User = require('../models/User');
const MentorSession = require('../models/MentorSession');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { deleteFromCloudinary } = require('../config/cloudinary');

// ============================================
// @desc    Register as mentor
// @route   POST /api/v1/mentors/register
// @access  Private
// ============================================
exports.registerAsMentor = asyncHandler(async (req, res) => {
  // Check if user already has a mentor profile
  const existingMentor = await Mentor.findOne({ user: req.user._id });
  if (existingMentor) {
    return ApiResponse.conflict(res, 'You are already registered as a mentor.');
  }

  const mentorData = {
    ...req.body,
    user: req.user._id,
    status: 'pending_approval',
    verification: {
      status: 'pending',
    },
  };

  const mentor = await Mentor.create(mentorData);

  // Update user role
  await User.findByIdAndUpdate(req.user._id, { role: 'mentor' });

  console.log(`✅ Mentor registered: ${req.user.email}`);

  return ApiResponse.created(
    res,
    'Mentor registration submitted! Your application is under review.',
    { mentor }
  );
});

// ============================================
// @desc    Get all mentors with filters
// @route   GET /api/v1/mentors
// @access  Public
// ============================================
exports.getAllMentors = asyncHandler(async (req, res) => {
  const {
    q = '',
    category,
    expertise,
    minRating,
    maxPrice,
    mode,
    language,
    country,
    city,
    mentorLevel,
    isTopMentor,
    isFeatured,
    isAvailable,
    page = 1,
    limit = 12,
    sortBy = 'rating',
    sortOrder = 'desc',
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = {
    isActive: true,
    'verification.status': 'verified',
  };

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { professionalBio: { $regex: q, $options: 'i' } },
      { specializations: { $in: [new RegExp(q, 'i')] } },
      { industries: { $in: [new RegExp(q, 'i')] } },
    ];
  }

  if (category) filter.expertiseCategories = category;
  if (expertise) filter.specializations = { $in: [new RegExp(expertise, 'i')] };
  if (minRating) filter['rating.average'] = { $gte: parseFloat(minRating) };
  if (maxPrice) filter['pricing.sessionRates.price'] = { $lte: parseFloat(maxPrice) };
  if (mode) filter.mentorshipMode = mode;
  if (language) filter['languages.language'] = language;
  if (country) filter['location.country'] = country;
  if (city) filter['location.city'] = { $regex: city, $options: 'i' };
  if (mentorLevel) filter.mentorLevel = mentorLevel;
  if (isTopMentor !== undefined) filter.isTopMentor = isTopMentor === 'true';
  if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
  if (isAvailable !== undefined) filter['availability.isAvailable'] = isAvailable === 'true';

  const sortField = {
    rating: 'rating.average',
    experience: 'totalExperience',
    sessions: 'stats.completedSessions',
    price: 'pricing.sessionRates.price',
    newest: 'createdAt',
  }[sortBy] || 'rating.average';

  const sortOptions = {};
  sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

  const [mentors, total] = await Promise.all([
    Mentor.find(filter)
      .populate('user', 'name email profileImage')
      .populate('skills', 'name icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-reviews -qAndA -reports -verification.documents'),
    Mentor.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Mentors fetched.', mentors, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + mentors.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get single mentor by ID or slug
// @route   GET /api/v1/mentors/:identifier
// @access  Public
// ============================================
exports.getMentorById = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const query = isObjectId ? { _id: identifier } : { slug: identifier };

  const mentor = await Mentor.findOne({ ...query, isActive: true })
    .populate('user', 'name email profileImage bio createdAt')
    .populate('skills', 'name category icon description')
    .populate('uploadedResources', 'title resourceType thumbnail rating')
    .populate('createdRoadmaps', 'title category coverImage difficulty')
    .populate('reviews.mentee', 'name profileImage');

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor not found.');
  }

  // Increment profile views (async)
  mentor.incrementProfileViews().catch(console.error);

  // Check if current user has booked with this mentor before
  let hasBookedBefore = false;
  if (req.user) {
    const previousSession = await MentorSession.findOne({
      mentor: mentor._id,
      mentee: req.user._id,
    });
    hasBookedBefore = !!previousSession;
  }

  return ApiResponse.success(res, 'Mentor details fetched.', {
    mentor,
    hasBookedBefore,
  });
});

// ============================================
// @desc    Get top mentors
// @route   GET /api/v1/mentors/top
// @access  Public
// ============================================
exports.getTopMentors = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const mentors = await Mentor.getTopMentors(parseInt(limit));

  return ApiResponse.success(res, 'Top mentors fetched.', {
    mentors,
    total: mentors.length,
  });
});

// ============================================
// @desc    Get featured mentors
// @route   GET /api/v1/mentors/featured
// @access  Public
// ============================================
exports.getFeaturedMentors = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const mentors = await Mentor.getFeatured(parseInt(limit));

  return ApiResponse.success(res, 'Featured mentors fetched.', {
    mentors,
    total: mentors.length,
  });
});

// ============================================
// @desc    Get mentors by expertise category
// @route   GET /api/v1/mentors/category/:category
// @access  Public
// ============================================
exports.getMentorsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { limit = 20 } = req.query;

  const mentors = await Mentor.getByCategory(decodeURIComponent(category), parseInt(limit));

  return ApiResponse.success(res, `Mentors in ${category} fetched.`, {
    mentors,
    total: mentors.length,
  });
});

// ============================================
// @desc    Update mentor profile
// @route   PUT /api/v1/mentors/profile
// @access  Private (Mentor)
// ============================================
exports.updateMentorProfile = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ user: req.user._id });

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  const allowedFields = [
    'title', 'tagline', 'professionalBio', 'shortBio', 'totalExperience',
    'expertise', 'expertiseCategories', 'skills', 'industries', 'specializations',
    'workExperience', 'entrepreneurialExperience', 'education', 'certifications',
    'awards', 'publications', 'mentorshipTypes', 'mentorshipMode', 'mentorshipStyle',
    'preferredMenteeLevel', 'availability', 'pricing', 'languages', 'location',
    'socialLinks', 'portfolio', 'successStories', 'preferences',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      mentor[field] = req.body[field];
    }
  });

  await mentor.save();

  return ApiResponse.success(res, 'Mentor profile updated.', { mentor });
});

// ============================================
// @desc    Update mentor availability
// @route   PUT /api/v1/mentors/availability
// @access  Private (Mentor)
// ============================================
exports.updateAvailability = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ user: req.user._id });

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  mentor.availability = { ...mentor.availability.toObject(), ...req.body };
  await mentor.save();

  return ApiResponse.success(res, 'Availability updated.', {
    availability: mentor.availability,
  });
});

// ============================================
// @desc    Upload verification documents
// @route   POST /api/v1/mentors/verification/documents
// @access  Private (Mentor)
// ============================================
exports.uploadVerificationDocuments = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ user: req.user._id });

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return ApiResponse.badRequest(res, 'Please upload at least one document.');
  }

  const documentTypes = {
    idProof: 'id_proof',
    addressProof: 'address_proof',
    educationCertificate: 'education_certificate',
    experienceLetter: 'experience_letter',
    businessRegistration: 'business_registration',
    professionalLicense: 'professional_license',
  };

  Object.keys(req.files).forEach((fieldName) => {
    const files = Array.isArray(req.files[fieldName])
      ? req.files[fieldName]
      : [req.files[fieldName]];

    files.forEach((file) => {
      mentor.verification.documents.push({
        type: documentTypes[fieldName] || 'other',
        documentUrl: file.path,
        uploadedAt: Date.now(),
      });
    });
  });

  await mentor.save();

  return ApiResponse.success(res, 'Documents uploaded successfully.', {
    documentCount: mentor.verification.documents.length,
  });
});

// ============================================
// @desc    Get my mentor profile (own)
// @route   GET /api/v1/mentors/profile/me
// @access  Private (Mentor)
// ============================================
exports.getMyMentorProfile = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ user: req.user._id })
    .populate('user', 'name email profileImage')
    .populate('skills', 'name category icon')
    .populate('uploadedResources', 'title resourceType stats')
    .populate('createdRoadmaps', 'title stats');

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  return ApiResponse.success(res, 'Your mentor profile fetched.', { mentor });
});

// ============================================
// @desc    Ask question to mentor
// @route   POST /api/v1/mentors/:id/ask
// @access  Private
// ============================================
exports.askMentorQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { question, isPublic = true } = req.body;

  if (!question || question.trim().length < 10) {
    return ApiResponse.badRequest(res, 'Question must be at least 10 characters.');
  }

  const mentor = await Mentor.findById(id);
  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor not found.');
  }

  mentor.qAndA.push({
    question,
    askedBy: req.user._id,
    isPublic,
  });

  await mentor.save();

  return ApiResponse.created(res, 'Question submitted successfully.', {
    totalQuestions: mentor.qAndA.length,
  });
});

// ============================================
// @desc    Answer question (Mentor)
// @route   POST /api/v1/mentors/questions/:questionId/answer
// @access  Private (Mentor)
// ============================================
exports.answerQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { answer } = req.body;

  if (!answer || answer.trim().length < 10) {
    return ApiResponse.badRequest(res, 'Answer must be at least 10 characters.');
  }

  const mentor = await Mentor.findOne({ user: req.user._id });
  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  try {
    await mentor.answerQuestion(questionId, answer);
    return ApiResponse.success(res, 'Answer posted successfully.');
  } catch (error) {
    return ApiResponse.notFound(res, 'Question not found.');
  }
});

// ============================================
// @desc    Get mentor's questions
// @route   GET /api/v1/mentors/:id/questions
// @access  Public
// ============================================
exports.getMentorQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mentor = await Mentor.findById(id)
    .populate('qAndA.askedBy', 'name profileImage')
    .select('qAndA');

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor not found.');
  }

  const publicQuestions = mentor.qAndA.filter((q) => q.isPublic);

  return ApiResponse.success(res, 'Questions fetched.', {
    questions: publicQuestions,
    total: publicQuestions.length,
  });
});

// ============================================
// @desc    Get mentor statistics (Mentor's own)
// @route   GET /api/v1/mentors/stats/me
// @access  Private (Mentor)
// ============================================
exports.getMyMentorStats = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ user: req.user._id });

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  // Get session stats
  const [upcomingSessions, todaySessions, thisMonthEarnings] = await Promise.all([
    MentorSession.countDocuments({
      mentor: mentor._id,
      status: { $in: ['pending', 'confirmed'] },
      scheduledDate: { $gte: new Date() },
    }),
    MentorSession.countDocuments({
      mentor: mentor._id,
      scheduledDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999),
      },
    }),
    MentorSession.aggregate([
      {
        $match: {
          mentor: mentor._id,
          status: 'completed',
          createdAt: {
            $gte: new Date(new Date().setDate(1)),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.mentorEarnings' },
        },
      },
    ]),
  ]);

  const stats = {
    profileCompletion: mentor.stats.profileCompletion,
    profileViews: mentor.stats.profileViews,
    totalSessions: mentor.stats.totalSessions,
    completedSessions: mentor.stats.completedSessions,
    cancelledSessions: mentor.stats.cancelledSessions,
    upcomingSessions,
    todaySessions,
    totalMentees: mentor.stats.totalMentees,
    activeMentees: mentor.stats.activeMentees,
    totalHours: mentor.stats.totalHours,
    totalEarnings: mentor.stats.totalEarnings,
    thisMonthEarnings: thisMonthEarnings[0]?.total || 0,
    rating: {
      average: mentor.rating.average.toFixed(1),
      total: mentor.rating.total,
      distribution: mentor.rating.distribution,
    },
    mentorLevel: mentor.mentorLevel,
    badges: mentor.badges,
    responseRate: mentor.stats.responseRate,
    completionRate: mentor.completionRate,
  };

  return ApiResponse.success(res, 'Mentor stats fetched.', { stats });
});

// ============================================
// @desc    Get mentor's mentees
// @route   GET /api/v1/mentors/mentees/me
// @access  Private (Mentor)
// ============================================
exports.getMyMentees = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ user: req.user._id });

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  const sessions = await MentorSession.aggregate([
    { $match: { mentor: mentor._id } },
    {
      $group: {
        _id: '$mentee',
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        totalEarnings: { $sum: '$pricing.mentorEarnings' },
        lastSession: { $max: '$scheduledDate' },
      },
    },
    { $sort: { lastSession: -1 } },
  ]);

  // Populate mentee details
  const menteeIds = sessions.map((s) => s._id);
  const mentees = await User.find({ _id: { $in: menteeIds } })
    .select('name email profileImage location');

  const menteesWithStats = sessions.map((s) => {
    const menteeDetails = mentees.find((m) => m._id.toString() === s._id.toString());
    return {
      mentee: menteeDetails,
      totalSessions: s.totalSessions,
      completedSessions: s.completedSessions,
      totalEarnings: s.totalEarnings,
      lastSession: s.lastSession,
    };
  });

  return ApiResponse.success(res, 'Mentees fetched.', {
    mentees: menteesWithStats,
    total: menteesWithStats.length,
  });
});

// ============================================
// @desc    Verify mentor (Admin)
// @route   PUT /api/v1/mentors/:id/verify
// @access  Private (Admin)
// ============================================
exports.verifyMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  const mentor = await Mentor.findById(id).populate('user', 'name email');
  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor not found.');
  }

  mentor.verification.status = status;
  mentor.verification.verifiedAt = Date.now();
  mentor.verification.verifiedBy = req.user._id;

  if (status === 'verified') {
    mentor.status = 'active';
    mentor.isActive = true;
  } else if (status === 'rejected') {
    mentor.status = 'inactive';
    mentor.verification.rejectionReason = rejectionReason;
  }

  await mentor.save();

  console.log(`✅ Mentor ${status}: ${mentor.user.email}`);

  return ApiResponse.success(res, `Mentor ${status} successfully.`, { mentor });
});

// ============================================
// @desc    Get pending mentor applications (Admin)
// @route   GET /api/v1/mentors/pending
// @access  Private (Admin)
// ============================================
exports.getPendingMentors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [pending, total] = await Promise.all([
    Mentor.find({ 'verification.status': 'pending' })
      .populate('user', 'name email profileImage createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Mentor.countDocuments({ 'verification.status': 'pending' }),
  ]);

  return ApiResponse.paginated(res, 'Pending mentors fetched.', pending, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + pending.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Delete mentor profile
// @route   DELETE /api/v1/mentors/profile
// @access  Private (Mentor)
// ============================================
exports.deleteMentorProfile = asyncHandler(async (req, res) => {
  const mentor = await Mentor.findOne({ user: req.user._id });

  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  // Check for upcoming sessions
  const upcomingSessions = await MentorSession.countDocuments({
    mentor: mentor._id,
    status: { $in: ['pending', 'confirmed'] },
    scheduledDate: { $gte: new Date() },
  });

  if (upcomingSessions > 0) {
    return ApiResponse.badRequest(
      res,
      `You have ${upcomingSessions} upcoming sessions. Please complete or cancel them first.`
    );
  }

  mentor.isActive = false;
  mentor.status = 'inactive';
  await mentor.save();

  // Revert user role to 'user'
  await User.findByIdAndUpdate(req.user._id, { role: 'user' });

  return ApiResponse.success(res, 'Mentor profile deactivated.');
});