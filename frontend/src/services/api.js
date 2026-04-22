import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mm_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  signup: (payload) => api.post("/auth/signup", payload).then((res) => res.data),
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),
  me: () => api.get("/auth/me").then((res) => res.data),
};

export const dashboardApi = {
  get: () => api.get("/dashboard").then((res) => res.data),
};

export const resourcesApi = {
  list: (params) => api.get("/resources", { params }).then((res) => res.data),
  bookmark: (id) => api.patch(`/resources/${id}/bookmark`).then((res) => res.data),
  progress: (id, payload) => api.patch(`/resources/${id}/progress`, payload).then((res) => res.data),
  create: (formData) => api.post("/resources", formData).then((res) => res.data),
};

export const forumApi = {
  list: () => api.get("/forum/posts").then((res) => res.data),
  create: (payload) => api.post("/forum/posts", payload).then((res) => res.data),
  like: (id) => api.patch(`/forum/posts/${id}/like`).then((res) => res.data),
  comment: (id, payload) => api.post(`/forum/posts/${id}/comments`, payload).then((res) => res.data),
  report: (payload) => api.post("/forum/reports", payload).then((res) => res.data),
};

export const supportApi = {
  conversations: () => api.get("/conversations").then((res) => res.data),
  createConversation: (payload) => api.post("/conversations", payload).then((res) => res.data),
  messages: (id) => api.get(`/conversations/${id}/messages`).then((res) => res.data),
  sendMessage: (id, payload) => api.post(`/conversations/${id}/messages`, payload).then((res) => res.data),
  volunteers: () => api.get("/volunteers").then((res) => res.data),
  bookings: () => api.get("/bookings").then((res) => res.data),
  createBooking: (payload) => api.post("/bookings", payload).then((res) => res.data),
  updateBooking: (id, payload) => api.patch(`/bookings/${id}`, payload).then((res) => res.data),
};

export const moodApi = {
  list: () => api.get("/moods").then((res) => res.data),
  create: (payload) => api.post("/moods", payload).then((res) => res.data),
};

export const notificationsApi = {
  list: () => api.get("/notifications").then((res) => res.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((res) => res.data),
};

export const commonApi = {
  meta: () => api.get("/meta").then((res) => res.data),
  emergency: () => api.get("/emergency").then((res) => res.data),
  aiSupport: (payload) => api.post("/ai/support", payload).then((res) => res.data),
};

export const adminApi = {
  overview: () => api.get("/admin/overview").then((res) => res.data),
  users: () => api.get("/admin/users").then((res) => res.data),
  toggleBlock: (id) => api.patch(`/admin/users/${id}/block`).then((res) => res.data),
};

export default api;
