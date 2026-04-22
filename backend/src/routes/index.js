const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  adminOverview,
  askAiSupport,
  authLogin,
  authMe,
  authSignup,
  createBooking,
  createComment,
  createConversation,
  createForumPost,
  createMoodEntry,
  createResource,
  getDashboard,
  getEmergencyInfo,
  getPlatformMeta,
  likeForumPost,
  listAdminUsers,
  listBookings,
  listConversations,
  listForumPosts,
  listMessages,
  listMoodEntries,
  listNotifications,
  listResources,
  listVolunteers,
  markNotificationRead,
  reportContent,
  sendMessage,
  toggleBlockUser,
  toggleBookmark,
  updateBookingStatus,
  updateProgress,
} = require("../controllers/appController");
const { authorize, protect } = require("../middleware/auth");
const { USER_ROLES } = require("../utils/constants");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  },
});

const upload = multer({ storage });

router.get("/health", (req, res) => res.json({ status: "ok" }));

router.post("/auth/signup", authSignup);
router.post("/auth/login", authLogin);
router.get("/auth/me", protect, authMe);

router.get("/meta", protect, getPlatformMeta);
router.get("/dashboard", protect, getDashboard);

router.get("/resources", protect, listResources);
router.post("/resources", protect, authorize(USER_ROLES.ADMIN), upload.single("file"), createResource);
router.patch("/resources/:id/bookmark", protect, toggleBookmark);
router.patch("/resources/:id/progress", protect, updateProgress);

router.get("/forum/posts", protect, listForumPosts);
router.post("/forum/posts", protect, createForumPost);
router.patch("/forum/posts/:id/like", protect, likeForumPost);
router.post("/forum/posts/:id/comments", protect, createComment);
router.post("/forum/reports", protect, reportContent);

router.get("/conversations", protect, listConversations);
router.post("/conversations", protect, createConversation);
router.get("/conversations/:id/messages", protect, listMessages);
router.post("/conversations/:id/messages", protect, sendMessage);

router.get("/volunteers", protect, listVolunteers);
router.get("/bookings", protect, listBookings);
router.post("/bookings", protect, createBooking);
router.patch("/bookings/:id", protect, authorize(USER_ROLES.ADMIN, USER_ROLES.VOLUNTEER), updateBookingStatus);

router.get("/moods", protect, listMoodEntries);
router.post("/moods", protect, createMoodEntry);

router.get("/notifications", protect, listNotifications);
router.patch("/notifications/:id/read", protect, markNotificationRead);

router.post("/ai/support", protect, askAiSupport);
router.get("/emergency", getEmergencyInfo);

router.get("/admin/overview", protect, authorize(USER_ROLES.ADMIN), adminOverview);
router.get("/admin/users", protect, authorize(USER_ROLES.ADMIN), listAdminUsers);
router.patch("/admin/users/:id/block", protect, authorize(USER_ROLES.ADMIN), toggleBlockUser);

module.exports = router;
