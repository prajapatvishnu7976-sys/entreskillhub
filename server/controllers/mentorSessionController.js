// ============================================
// EntreSkillHub - Mentor Session Controller
// Session bookings, scheduling, reviews
// ============================================

const MentorSession = require('../models/MentorSession');
const Mentor = require('../models/Mentor');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendSessionConfirmation } = require('../utils/sendEmail');

// ============================================
// @desc    Book a mentor session
// @route   POST /api/v1/sessions/book
// @access  Private
// ============================================
exports.bookSession = asyncHandler(async (req, res) => {
  const {
    mentor: mentorId,
    title,
    description,
    sessionType,
    mode,
    scheduledDate,
    startTime,
    endTime,
    duration,
    timezone,
    relatedBusinessIdea,
    relatedRoadmap,
    topics,
    menteeGoals,
  } = req.body;

  // Get mentor details
  const mentor = await Mentor.findById(mentorId).populate('user', 'name email');
  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor not found.');
  }

  if (mentor.verification.status !== 'verified' || !mentor.isActive) {
    return ApiResponse.badRequest(res, 'This mentor is not currently available.');
  }

  // Prevent self-booking
  if (mentor.user._id.toString() === req.user._id.toString()) {
    return ApiResponse.badRequest(res, 'You cannot book a session with yourself.');
  }

  // Check availability
  const isAvailable = await MentorSession.checkAvailability(
    mentorId,
    new Date(scheduledDate),
    startTime,
    endTime
  );

  if (!isAvailable) {
    return ApiResponse.conflict(res, 'This time slot is not available. Please choose another time.');
  }

  // Check if user is on vacation
  if (mentor.availability.vacationMode?.isOn) {
    const sessionDate = new Date(scheduledDate);
    const vacStart = new Date(mentor.availability.vacationMode.startDate);
    const vacEnd = new Date(mentor.availability.vacationMode.endDate);

    if (sessionDate >= vacStart && sessionDate <= vacEnd) {
      return ApiResponse.badRequest(
        res,
        `Mentor is on vacation from ${vacStart.toLocaleDateString()} to ${vacEnd.toLocaleDateString()}.`
      );
    }
  }

  // Calculate pricing
  const sessionRate = mentor.pricing.sessionRates.find(
    (r) => r.duration === duration && r.type === 'individual'
  );

  const baseAmount = mentor.pricing.isFree ? 0 : (sessionRate?.price || 0);

  // Check if it's first session (may be free)
  const previousSessions = await MentorSession.countDocuments({
    mentor: mentorId,
    mentee: req.user._id,
    status: 'completed',
  });

  const isFirstSession = previousSessions === 0;
  const finalAmount = isFirstSession && mentor.pricing.firstSessionFree ? 0 : baseAmount;

  // Create session
  const session = await MentorSession.create({
    mentor: mentorId,
    mentorUser: mentor.user._id,
    mentee: req.user._id,
    title,
    description,
    sessionType,
    mode,
    scheduledDate: new Date(scheduledDate),
    startTime,
    endTime,
    duration,
    timezone: timezone || 'Asia/Kolkata',
    relatedBusinessIdea,
    relatedRoadmap,
    topics: topics || [],
    menteeGoals: menteeGoals || {},
    pricing: {
      amount: baseAmount,
      currency: mentor.pricing.currency || 'INR',
      isFree: finalAmount === 0,
      finalAmount,
    },
    payment: {
      status: finalAmount === 0 ? 'not_required' : 'pending',
      method: finalAmount === 0 ? 'free' : undefined,
    },
    status: mentor.preferences.autoAccept ? 'confirmed' : 'pending',
    isFirstSession,
  });

  // Update mentor's current load
  mentor.availability.currentLoad += 1;
  await mentor.save({ validateBeforeSave: false });

  // Send confirmation email
  try {
    await sendSessionConfirmation(req.user, session, mentor.user);
  } catch (emailError) {
    console.error('Email sending failed:', emailError.message);
  }

  console.log(`✅ Session booked: ${req.user.email} → ${mentor.user.email}`);

  return ApiResponse.created(res, 'Session booked successfully!', {
    session,
    requiresPayment: finalAmount > 0,
    isFirstSession,
  });
});

// ============================================
// @desc    Get user's upcoming sessions
// @route   GET /api/v1/sessions/upcoming
// @access  Private
// ============================================
exports.getUpcomingSessions = asyncHandler(async (req, res) => {
  const { role = 'mentee' } = req.query;

  const isMentor = role === 'mentor';
  const sessions = await MentorSession.getUpcomingForUser(req.user._id, isMentor);

  return ApiResponse.success(res, 'Upcoming sessions fetched.', {
    sessions,
    total: sessions.length,
  });
});

// ============================================
// @desc    Get user's past sessions
// @route   GET /api/v1/sessions/past
// @access  Private
// ============================================
exports.getPastSessions = asyncHandler(async (req, res) => {
  const { role = 'mentee', limit = 20 } = req.query;

  const isMentor = role === 'mentor';
  const sessions = await MentorSession.getPastForUser(req.user._id, isMentor, parseInt(limit));

  return ApiResponse.success(res, 'Past sessions fetched.', {
    sessions,
    total: sessions.length,
  });
});

// ============================================
// @desc    Get all my sessions
// @route   GET /api/v1/sessions/my
// @access  Private
// ============================================
exports.getMySessions = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20, role = 'mentee' } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const isMentor = role === 'mentor';

  const filter = isMentor ? { mentorUser: req.user._id } : { mentee: req.user._id };
  if (status) filter.status = status;

  const [sessions, total] = await Promise.all([
    MentorSession.find(filter)
      .populate('mentor', 'title profileCompletion rating')
      .populate('mentorUser mentee', 'name email profileImage')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    MentorSession.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, 'Sessions fetched.', sessions, {
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
    totalItems: total,
    itemsPerPage: parseInt(limit),
    hasNext: skip + sessions.length < total,
    hasPrev: parseInt(page) > 1,
  });
});

// ============================================
// @desc    Get session details
// @route   GET /api/v1/sessions/:id
// @access  Private
// ============================================
exports.getSessionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await MentorSession.findById(id)
    .populate('mentor', 'title tagline rating')
    .populate('mentorUser mentee', 'name email profileImage')
    .populate('relatedBusinessIdea', 'title category')
    .populate('relatedRoadmap', 'title category');

  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  // Verify user has access
  const isParticipant =
    session.mentorUser._id.toString() === req.user._id.toString() ||
    session.mentee._id.toString() === req.user._id.toString();

  if (!isParticipant && !['admin', 'superadmin'].includes(req.user.role)) {
    return ApiResponse.forbidden(res, 'You do not have access to this session.');
  }

  return ApiResponse.success(res, 'Session details fetched.', { session });
});

// ============================================
// @desc    Confirm session (Mentor)
// @route   PUT /api/v1/sessions/:id/confirm
// @access  Private (Mentor)
// ============================================
exports.confirmSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { meetingLink, meetingId, password } = req.body;

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  if (session.mentorUser.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Only the mentor can confirm this session.');
  }

  if (session.status !== 'pending') {
    return ApiResponse.badRequest(res, `Cannot confirm session with status: ${session.status}`);
  }

  // Add meeting details if online session
  if (session.mode === 'online' && meetingLink) {
    session.meetingDetails.meetingLink = meetingLink;
    session.meetingDetails.meetingId = meetingId || '';
    session.meetingDetails.password = password || '';
  }

  await session.confirm(req.user._id);

  return ApiResponse.success(res, 'Session confirmed successfully!', { session });
});

// ============================================
// @desc    Cancel session
// @route   PUT /api/v1/sessions/:id/cancel
// @access  Private
// ============================================
exports.cancelSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason, description } = req.body;

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  // Check permission
  const isMentor = session.mentorUser.toString() === req.user._id.toString();
  const isMentee = session.mentee.toString() === req.user._id.toString();
  const isAdmin = ['admin', 'superadmin'].includes(req.user.role);

  if (!isMentor && !isMentee && !isAdmin) {
    return ApiResponse.forbidden(res, 'You cannot cancel this session.');
  }

  if (!session.canBeCancelled) {
    return ApiResponse.badRequest(res, 'This session cannot be cancelled at this time.');
  }

  const role = isMentor ? 'mentor' : isMentee ? 'mentee' : 'admin';

  await session.cancel(req.user._id, role, reason, description);

  // Update mentor's load
  const mentor = await Mentor.findById(session.mentor);
  if (mentor) {
    mentor.availability.currentLoad = Math.max(0, mentor.availability.currentLoad - 1);
    mentor.stats.cancelledSessions += 1;
    await mentor.save({ validateBeforeSave: false });
  }

  console.log(`❌ Session cancelled: ${session.sessionId} by ${role}`);

  return ApiResponse.success(res, 'Session cancelled.', { session });
});

// ============================================
// @desc    Reschedule session
// @route   PUT /api/v1/sessions/:id/reschedule
// @access  Private
// ============================================
exports.rescheduleSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newDate, newStartTime, newEndTime, reason } = req.body;

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  const isParticipant =
    session.mentorUser.toString() === req.user._id.toString() ||
    session.mentee.toString() === req.user._id.toString();

  if (!isParticipant) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  // Check availability of new slot
  const isAvailable = await MentorSession.checkAvailability(
    session.mentor,
    new Date(newDate),
    newStartTime,
    newEndTime
  );

  if (!isAvailable) {
    return ApiResponse.conflict(res, 'The new time slot is not available.');
  }

  try {
    await session.reschedule(
      new Date(newDate),
      newStartTime,
      newEndTime,
      req.user._id,
      reason
    );

    return ApiResponse.success(res, 'Session rescheduled successfully.', { session });
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
});

// ============================================
// @desc    Start session
// @route   PUT /api/v1/sessions/:id/start
// @access  Private
// ============================================
exports.startSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  const isMentor = session.mentorUser.toString() === req.user._id.toString();
  const isMentee = session.mentee.toString() === req.user._id.toString();

  if (!isMentor && !isMentee) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  const role = isMentor ? 'mentor' : 'mentee';

  try {
    await session.startSession(role);
    return ApiResponse.success(res, 'Session started.', { session });
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
});

// ============================================
// @desc    Complete session
// @route   PUT /api/v1/sessions/:id/complete
// @access  Private (Mentor)
// ============================================
exports.completeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { summary, nextSteps, followUpRequired } = req.body;

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  if (session.mentorUser.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Only the mentor can complete this session.');
  }

  try {
    await session.completeSession();

    // Add post-session details
    session.postSession = {
      summary,
      nextSteps,
      followUpRequired,
    };
    await session.save();

    // Update mentor stats
    const mentor = await Mentor.findById(session.mentor);
    if (mentor) {
      await mentor.completeSession(session.actualDuration || session.duration, session.pricing.mentorEarnings);
    }

    return ApiResponse.success(res, 'Session marked as completed.', { session });
  } catch (error) {
    return ApiResponse.badRequest(res, error.message);
  }
});

// ============================================
// @desc    Add session notes
// @route   PUT /api/v1/sessions/:id/notes
// @access  Private
// ============================================
exports.addSessionNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes, isShared = false } = req.body;

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  const isMentor = session.mentorUser.toString() === req.user._id.toString();
  const isMentee = session.mentee.toString() === req.user._id.toString();

  if (!isMentor && !isMentee) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  if (isShared) {
    session.sessionNotes.sharedNotes = notes;
  } else if (isMentor) {
    session.sessionNotes.mentorNotes = notes;
  } else {
    session.sessionNotes.menteeNotes = notes;
  }

  await session.save();

  return ApiResponse.success(res, 'Notes saved successfully.');
});

// ============================================
// @desc    Add action item
// @route   POST /api/v1/sessions/:id/action-items
// @access  Private
// ============================================
exports.addActionItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { item, assignedTo, dueDate, priority } = req.body;

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  const isParticipant =
    session.mentorUser.toString() === req.user._id.toString() ||
    session.mentee.toString() === req.user._id.toString();

  if (!isParticipant) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  await session.addActionItem(item, assignedTo, dueDate, priority);

  return ApiResponse.created(res, 'Action item added.', {
    actionItems: session.sessionNotes.actionItems,
  });
});

// ============================================
// @desc    Send message in session
// @route   POST /api/v1/sessions/:id/messages
// @access  Private
// ============================================
exports.sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, attachments = [] } = req.body;

  if (!content || content.trim().length < 1) {
    return ApiResponse.badRequest(res, 'Message content is required.');
  }

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  const isMentor = session.mentorUser.toString() === req.user._id.toString();
  const isMentee = session.mentee.toString() === req.user._id.toString();

  if (!isMentor && !isMentee) {
    return ApiResponse.forbidden(res, 'Access denied.');
  }

  const senderRole = isMentor ? 'mentor' : 'mentee';

  await session.addMessage(req.user._id, senderRole, content, attachments);

  return ApiResponse.created(res, 'Message sent.', {
    messagesCount: session.messages.length,
  });
});

// ============================================
// @desc    Submit review by mentee
// @route   POST /api/v1/sessions/:id/review/mentee
// @access  Private (Mentee)
// ============================================
exports.submitMenteeReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reviewData = req.body;

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  if (session.mentee.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Only the mentee can submit this review.');
  }

  if (session.status !== 'completed') {
    return ApiResponse.badRequest(res, 'Can only review completed sessions.');
  }

  if (session.menteeReview.rating) {
    return ApiResponse.conflict(res, 'You have already reviewed this session.');
  }

  await session.submitMenteeReview(reviewData);

  // Update mentor's overall rating
  const mentor = await Mentor.findById(session.mentor);
  if (mentor) {
    await mentor.addReview(req.user._id, session._id, reviewData);
  }

  return ApiResponse.success(res, 'Review submitted successfully.');
});

// ============================================
// @desc    Submit review by mentor
// @route   POST /api/v1/sessions/:id/review/mentor
// @access  Private (Mentor)
// ============================================
exports.submitMentorReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reviewData = req.body;

  const session = await MentorSession.findById(id);
  if (!session) {
    return ApiResponse.notFound(res, 'Session not found.');
  }

  if (session.mentorUser.toString() !== req.user._id.toString()) {
    return ApiResponse.forbidden(res, 'Only the mentor can submit this review.');
  }

  if (session.status !== 'completed') {
    return ApiResponse.badRequest(res, 'Can only review completed sessions.');
  }

  await session.submitMentorReview(reviewData);

  return ApiResponse.success(res, 'Mentee review submitted.');
});

// ============================================
// @desc    Get mentor's schedule
// @route   GET /api/v1/sessions/mentor/schedule
// @access  Private (Mentor)
// ============================================
exports.getMentorSchedule = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const mentor = await Mentor.findOne({ user: req.user._id });
  if (!mentor) {
    return ApiResponse.notFound(res, 'Mentor profile not found.');
  }

  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

  const schedule = await MentorSession.getMentorSchedule(mentor._id, start, end);

  return ApiResponse.success(res, 'Schedule fetched.', {
    schedule,
    total: schedule.length,
    dateRange: { start, end },
  });
});