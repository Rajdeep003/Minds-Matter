const USER_ROLES = {
  USER: "user",
  VOLUNTEER: "volunteer",
  ADMIN: "admin",
};

const RESOURCE_TYPES = {
  EBOOK: "ebook",
  AUDIO: "audio",
};

const RESOURCE_CATEGORIES = [
  "Stress",
  "Anxiety",
  "Depression",
  "Motivation",
  "Mindfulness",
  "Sleep",
  "Self-Care",
];

const BOOKING_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
};

const MOOD_OPTIONS = [
  { value: 1, label: "Very Low", emoji: "😞" },
  { value: 2, label: "Low", emoji: "😕" },
  { value: 3, label: "Neutral", emoji: "😐" },
  { value: 4, label: "Good", emoji: "🙂" },
  { value: 5, label: "Great", emoji: "😄" },
];

const EMERGENCY_CONTACTS = [
  { country: "Global", name: "988 Suicide & Crisis Lifeline", phone: "988" },
  { country: "UK", name: "Samaritans", phone: "116 123" },
  { country: "India", name: "Kiran Mental Health Helpline", phone: "1800-599-0019" },
];

const BOT_RESPONSES = {
  anxious:
    "It sounds like things feel overwhelming right now. Try a 60-second reset: inhale for 4, hold for 4, exhale for 6, and notice five things around you. If you feel unsafe, use the emergency help button immediately.",
  low:
    "You do not need to solve everything today. Pick one gentle next step: drink water, stretch, or message someone you trust. Small actions count as progress.",
  lonely:
    "Feeling disconnected can be heavy. Consider posting anonymously in the community space or requesting a volunteer support session. Reaching out is a strength.",
  default:
    "I am here to offer basic support, not crisis care. Tell me if you are feeling anxious, low, stressed, lonely, or unmotivated, and I will suggest a simple coping step.",
};

module.exports = {
  USER_ROLES,
  RESOURCE_TYPES,
  RESOURCE_CATEGORIES,
  BOOKING_STATUS,
  MOOD_OPTIONS,
  EMERGENCY_CONTACTS,
  BOT_RESPONSES,
};
