const mongoose = require("mongoose");
const { BOOKING_STATUS, RESOURCE_CATEGORIES, RESOURCE_TYPES, USER_ROLES } = require("../utils/constants");

const { Schema, model, models } = mongoose;

const bookmarkSchema = new Schema(
  {
    resource: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const progressSchema = new Schema(
  {
    resource: { type: Schema.Types.ObjectId, ref: "Resource", required: true },
    completed: { type: Boolean, default: false },
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    lastAccessedAt: Date,
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.USER },
    avatarUrl: String,
    bio: { type: String, default: "" },
    blocked: { type: Boolean, default: false },
    expertise: [{ type: String }],
    bookmarks: [bookmarkSchema],
    progress: [progressSchema],
  },
  { timestamps: true }
);

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, enum: RESOURCE_CATEGORIES, required: true },
    type: { type: String, enum: Object.values(RESOURCE_TYPES), required: true },
    author: { type: String, required: true },
    coverImage: String,
    fileUrl: String,
    durationMinutes: Number,
    featured: { type: Boolean, default: false },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const forumPostSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "General" },
    anonymous: { type: Boolean, default: false },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    flagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "ForumPost", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const conversationSchema = new Schema(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    type: { type: String, enum: ["direct", "support"], default: "direct" },
    requestedVolunteer: { type: Schema.Types.ObjectId, ref: "User", default: null },
    latestMessage: { type: Schema.Types.ObjectId, ref: "Message", default: null },
  },
  { timestamps: true }
);

const messageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const bookingSchema = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
    volunteer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    notes: { type: String, default: "" },
    scheduledFor: { type: Date, required: true },
    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING },
  },
  { timestamps: true }
);

const moodEntrySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    mood: { type: Number, min: 1, max: 5, required: true },
    note: { type: String, default: "" },
    loggedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const notificationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, default: "general" },
    read: { type: Boolean, default: false },
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

const reportSchema = new Schema(
  {
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["post", "comment", "message"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = models.User || model("User", userSchema);
const Resource = models.Resource || model("Resource", resourceSchema);
const ForumPost = models.ForumPost || model("ForumPost", forumPostSchema);
const Comment = models.Comment || model("Comment", commentSchema);
const Conversation = models.Conversation || model("Conversation", conversationSchema);
const Message = models.Message || model("Message", messageSchema);
const Booking = models.Booking || model("Booking", bookingSchema);
const MoodEntry = models.MoodEntry || model("MoodEntry", moodEntrySchema);
const Notification = models.Notification || model("Notification", notificationSchema);
const Report = models.Report || model("Report", reportSchema);

module.exports = {
  User,
  Resource,
  ForumPost,
  Comment,
  Conversation,
  Message,
  Booking,
  MoodEntry,
  Notification,
  Report,
};
