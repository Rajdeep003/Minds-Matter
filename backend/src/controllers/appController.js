const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  Booking,
  Comment,
  Conversation,
  ForumPost,
  Message,
  MoodEntry,
  Notification,
  Report,
  Resource,
  User,
} = require("../models");
const { buildStoredFile } = require("../services/storageService");
const { BOOKING_STATUS, BOT_RESPONSES, EMERGENCY_CONTACTS, MOOD_OPTIONS, USER_ROLES } = require("../utils/constants");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const sanitizeUser = (user) => {
  const object = user.toObject ? user.toObject() : user;
  delete object.password;
  return object;
};

const createNotification = async (user, title, body, type = "general", link = "") => {
  if (!user) {
    return null;
  }

  return Notification.create({ user, title, body, type, link });
};

const authSignup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: Object.values(USER_ROLES).includes(role) ? role : USER_ROLES.USER,
  });

  const token = signToken(user._id);
  await createNotification(user._id, "Welcome to Minds Matter", "Your account is ready. Explore resources and track your wellbeing.");

  res.status(201).json({ token, user: sanitizeUser(user) });
});

const authLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  if (!user || !(await bcrypt.compare(password || "", user.password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (user.blocked) {
    res.status(403);
    throw new Error("This account is blocked.");
  }

  const token = signToken(user._id);
  res.json({ token, user: sanitizeUser(user) });
});

const authMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

const getDashboard = asyncHandler(async (req, res) => {
  const [moodEntries, allResources, latestPosts, volunteerCount] = await Promise.all([
    MoodEntry.find({ user: req.user._id }).sort({ loggedAt: -1 }).limit(7),
    Resource.find().sort({ createdAt: -1 }).limit(6),
    ForumPost.find().populate("author", "name").sort({ createdAt: -1 }).limit(3),
    User.countDocuments({ role: USER_ROLES.VOLUNTEER, blocked: false }),
  ]);

  const me = await User.findById(req.user._id).populate("bookmarks.resource").populate("progress.resource");
  const recommendations = allResources.filter((resource) => {
    const hasBookmark = me.bookmarks.some((bookmark) => String(bookmark.resource?._id) === String(resource._id));
    return !hasBookmark;
  });

  res.json({
    user: sanitizeUser(me),
    stats: {
      savedResources: me.bookmarks.length,
      completedResources: me.progress.filter((item) => item.completed).length,
      moodStreakEntries: moodEntries.length,
      volunteersAvailable: volunteerCount,
    },
    moodEntries,
    resources: allResources,
    recommendations: recommendations.slice(0, 4),
    latestPosts,
  });
});

const listResources = asyncHandler(async (req, res) => {
  const { search = "", category, type, bookmarked } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (type) {
    query.type = type;
  }

  let resources = await Resource.find(query).sort({ featured: -1, createdAt: -1 });

  if (bookmarked === "true") {
    const user = await User.findById(req.user._id);
    const bookmarkedIds = user.bookmarks.map((item) => String(item.resource));
    resources = resources.filter((resource) => bookmarkedIds.includes(String(resource._id)));
  }

  res.json(resources);
});

const createResource = asyncHandler(async (req, res) => {
  const stored = buildStoredFile(req.file);
  const resource = await Resource.create({
    ...req.body,
    uploadedBy: req.user._id,
    fileUrl: stored?.publicUrl || req.body.fileUrl,
    coverImage: req.body.coverImage || "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=900&q=80",
    tags: req.body.tags ? String(req.body.tags).split(",").map((tag) => tag.trim()).filter(Boolean) : [],
  });

  res.status(201).json(resource);
});

const toggleBookmark = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const resourceId = req.params.id;
  const existingIndex = user.bookmarks.findIndex((item) => String(item.resource) === resourceId);

  if (existingIndex >= 0) {
    user.bookmarks.splice(existingIndex, 1);
  } else {
    user.bookmarks.push({ resource: resourceId });
  }

  await user.save();
  res.json({ bookmarks: user.bookmarks });
});

const updateProgress = asyncHandler(async (req, res) => {
  const { progressPercent = 0, completed = false } = req.body;
  const user = await User.findById(req.user._id);
  const resourceId = req.params.id;
  const existing = user.progress.find((item) => String(item.resource) === resourceId);

  if (existing) {
    existing.progressPercent = progressPercent;
    existing.completed = completed;
    existing.lastAccessedAt = new Date();
  } else {
    user.progress.push({
      resource: resourceId,
      progressPercent,
      completed,
      lastAccessedAt: new Date(),
    });
  }

  await user.save();
  res.json({ progress: user.progress });
});

const listForumPosts = asyncHandler(async (req, res) => {
  const posts = await ForumPost.find()
    .populate("author", "name role")
    .sort({ createdAt: -1 })
    .lean();

  const postIds = posts.map((post) => post._id);
  const comments = await Comment.find({ post: { $in: postIds } }).populate("author", "name role").lean();

  const commentsByPost = comments.reduce((accumulator, comment) => {
    const key = String(comment.post);
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(comment);
    return accumulator;
  }, {});

  const mapped = posts.map((post) => ({
    ...post,
    author: post.anonymous ? { name: "Anonymous", role: "user" } : post.author,
    comments: commentsByPost[String(post._id)] || [],
  }));

  res.json(mapped);
});

const createForumPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.create({
    author: req.user._id,
    title: req.body.title,
    content: req.body.content,
    category: req.body.category,
    anonymous: Boolean(req.body.anonymous),
  });

  res.status(201).json(post);
});

const likeForumPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found.");
  }

  const userId = String(req.user._id);
  const liked = post.likes.some((item) => String(item) === userId);
  post.likes = liked ? post.likes.filter((item) => String(item) !== userId) : [...post.likes, req.user._id];
  await post.save();

  res.json(post);
});

const createComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({
    post: req.params.id,
    author: req.user._id,
    content: req.body.content,
    parentComment: req.body.parentComment || null,
  });

  res.status(201).json(comment);
});

const reportContent = asyncHandler(async (req, res) => {
  const report = await Report.create({
    reporter: req.user._id,
    targetType: req.body.targetType,
    targetId: req.body.targetId,
    reason: req.body.reason,
  });

  res.status(201).json(report);
});

const listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id })
    .populate("participants", "name role")
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name" },
    })
    .sort({ updatedAt: -1 });

  res.json(conversations);
});

const createConversation = asyncHandler(async (req, res) => {
  const participantIds = [...new Set([String(req.user._id), ...(req.body.participants || []).map(String)])];
  const conversation = await Conversation.create({
    participants: participantIds,
    type: req.body.type || "direct",
    requestedVolunteer: req.body.requestedVolunteer || null,
  });

  if (req.body.requestedVolunteer) {
    await createNotification(
      req.body.requestedVolunteer,
      "New support request",
      `${req.user.name} requested a volunteer chat session.`,
      "message",
      "/support"
    );
  }

  res.status(201).json(conversation);
});

const listMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ conversation: req.params.id })
    .populate("sender", "name role")
    .sort({ createdAt: 1 });

  res.json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);

  if (!conversation || !conversation.participants.some((item) => String(item) === String(req.user._id))) {
    res.status(404);
    throw new Error("Conversation not found.");
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    content: req.body.content,
    readBy: [req.user._id],
  });

  conversation.latestMessage = message._id;
  await conversation.save();

  const recipients = conversation.participants.filter((item) => String(item) !== String(req.user._id));
  await Promise.all(
    recipients.map((userId) =>
      createNotification(userId, "New message", `${req.user.name} sent you a new message.`, "message", "/support")
    )
  );

  res.status(201).json(await message.populate("sender", "name role"));
});

const listVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await User.find({ role: USER_ROLES.VOLUNTEER, blocked: false }).select("-password");
  res.json(volunteers);
});

const listBookings = asyncHandler(async (req, res) => {
  const query =
    req.user.role === USER_ROLES.USER
      ? { requester: req.user._id }
      : req.user.role === USER_ROLES.VOLUNTEER
        ? { volunteer: req.user._id }
        : {};

  const bookings = await Booking.find(query)
    .populate("requester", "name email")
    .populate("volunteer", "name email expertise")
    .sort({ scheduledFor: 1 });

  res.json(bookings);
});

const createBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.create({
    requester: req.user._id,
    volunteer: req.body.volunteer,
    topic: req.body.topic,
    notes: req.body.notes,
    scheduledFor: req.body.scheduledFor,
  });

  await createNotification(
    req.body.volunteer,
    "New booking request",
    `${req.user.name} requested a session on ${new Date(req.body.scheduledFor).toLocaleString()}.`,
    "booking",
    "/support"
  );

  res.status(201).json(booking);
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    res.status(404);
    throw new Error("Booking not found.");
  }

  booking.status = req.body.status;
  await booking.save();

  await createNotification(
    booking.requester,
    "Booking updated",
    `Your booking request is now ${req.body.status}.`,
    "booking",
    "/support"
  );

  res.json(booking);
});

const listMoodEntries = asyncHandler(async (req, res) => {
  const moods = await MoodEntry.find({ user: req.user._id }).sort({ loggedAt: 1 });
  res.json({ moods, options: MOOD_OPTIONS });
});

const createMoodEntry = asyncHandler(async (req, res) => {
  const moodEntry = await MoodEntry.create({
    user: req.user._id,
    mood: Number(req.body.mood),
    note: req.body.note || "",
    loggedAt: req.body.loggedAt || new Date(),
  });

  res.status(201).json(moodEntry);
});

const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
  res.json(notifications);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found.");
  }

  res.json(notification);
});

const askAiSupport = asyncHandler(async (req, res) => {
  const input = String(req.body.message || "").toLowerCase();
  let response = BOT_RESPONSES.default;

  if (input.includes("anx")) {
    response = BOT_RESPONSES.anxious;
  } else if (input.includes("low") || input.includes("sad") || input.includes("down")) {
    response = BOT_RESPONSES.low;
  } else if (input.includes("lonely") || input.includes("alone")) {
    response = BOT_RESPONSES.lonely;
  }

  res.json({ response });
});

const getEmergencyInfo = asyncHandler(async (req, res) => {
  res.json({ contacts: EMERGENCY_CONTACTS });
});

const getPlatformMeta = asyncHandler(async (req, res) => {
  res.json({
    roles: USER_ROLES,
    bookingStatus: BOOKING_STATUS,
    moodOptions: MOOD_OPTIONS,
    emergencyContacts: EMERGENCY_CONTACTS,
  });
});

const listAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  user.blocked = !user.blocked;
  await user.save();
  res.json(sanitizeUser(user));
});

const adminOverview = asyncHandler(async (req, res) => {
  const [userCount, volunteerCount, postCount, reportCount, resourceCount, bookingCount] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: USER_ROLES.VOLUNTEER }),
    ForumPost.countDocuments(),
    Report.countDocuments({ resolved: false }),
    Resource.countDocuments(),
    Booking.countDocuments(),
  ]);

  res.json({
    userCount,
    volunteerCount,
    postCount,
    reportCount,
    resourceCount,
    bookingCount,
  });
});

module.exports = {
  authSignup,
  authLogin,
  authMe,
  getDashboard,
  listResources,
  createResource,
  toggleBookmark,
  updateProgress,
  listForumPosts,
  createForumPost,
  likeForumPost,
  createComment,
  reportContent,
  listConversations,
  createConversation,
  listMessages,
  sendMessage,
  listVolunteers,
  listBookings,
  createBooking,
  updateBookingStatus,
  listMoodEntries,
  createMoodEntry,
  listNotifications,
  markNotificationRead,
  askAiSupport,
  getEmergencyInfo,
  getPlatformMeta,
  listAdminUsers,
  toggleBlockUser,
  adminOverview,
};
