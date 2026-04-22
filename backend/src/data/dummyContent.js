const { BOT_RESPONSES, EMERGENCY_CONTACTS, MOOD_OPTIONS, RESOURCE_CATEGORIES, RESOURCE_TYPES, USER_ROLES } = require("../utils/constants");

const users = [
  {
    name: "Ava Johnson",
    email: "ava@example.com",
    password: "Password123!",
    role: USER_ROLES.ADMIN,
    bio: "Platform administrator focused on content safety and volunteer support.",
    expertise: ["Moderation", "Operations"],
  },
  {
    name: "Noah Patel",
    email: "noah@example.com",
    password: "Password123!",
    role: USER_ROLES.VOLUNTEER,
    bio: "Volunteer listener with mindfulness and anxiety support experience.",
    expertise: ["Anxiety", "Mindfulness", "Student wellbeing"],
  },
  {
    name: "Mia Carter",
    email: "mia@example.com",
    password: "Password123!",
    role: USER_ROLES.USER,
    bio: "Using Minds Matter to build healthier daily routines.",
    expertise: [],
  },
];

const resources = [
  {
    title: "Calm Under Pressure",
    description: "A short guide to breathing techniques and grounding exercises for stressful days.",
    category: "Stress",
    type: RESOURCE_TYPES.EBOOK,
    author: "Dr. Elena Brooks",
    coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    tags: ["breathing", "grounding", "stress relief"],
    featured: true,
  },
  {
    title: "Gentle Motivation Reset",
    description: "A restorative audio session for rebuilding focus when motivation feels low.",
    category: "Motivation",
    type: RESOURCE_TYPES.AUDIO,
    author: "Jordan Lee",
    coverImage: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=900&q=80",
    fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    durationMinutes: 18,
    tags: ["motivation", "routine", "reset"],
    featured: true,
  },
  {
    title: "Anxiety Toolkit Basics",
    description: "Practical exercises to identify triggers and calm racing thoughts.",
    category: "Anxiety",
    type: RESOURCE_TYPES.EBOOK,
    author: "Nina Flores",
    coverImage: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=900&q=80",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    tags: ["anxiety", "journaling", "coping"],
  },
  {
    title: "Sleep Wind-Down Audio",
    description: "A soothing audio session designed to ease bedtime restlessness.",
    category: "Sleep",
    type: RESOURCE_TYPES.AUDIO,
    author: "Maya Chen",
    coverImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    durationMinutes: 24,
    tags: ["sleep", "rest", "calm"],
  },
];

const forumPosts = [
  {
    title: "What helps you recover after a hard day?",
    content: "I am trying to build healthier evening routines. What small rituals help you feel grounded again?",
    category: "Self-Care",
    anonymous: false,
  },
  {
    title: "Anonymous: Feeling overwhelmed with classes",
    content: "I feel like I am falling behind and it is affecting my sleep. Looking for gentle advice from people who have been there.",
    category: "Stress",
    anonymous: true,
  },
];

const comments = [
  { content: "A 10-minute walk without my phone helps more than I expect." },
  { content: "I set a tiny goal for the evening so I can still end the day feeling capable." },
];

const bookings = [
  {
    topic: "Managing exam anxiety",
    notes: "Looking for strategies before finals week.",
    daysFromNow: 3,
  },
];

const conversations = [
  {
    type: "support",
    messages: [
      "Hi, I saw your support request. How are you feeling right now?",
      "A bit tense and tired. I would like help building a simple routine.",
    ],
  },
];

module.exports = {
  users,
  resources,
  forumPosts,
  comments,
  bookings,
  conversations,
  EMERGENCY_CONTACTS,
  MOOD_OPTIONS,
  RESOURCE_CATEGORIES,
  BOT_RESPONSES,
};
