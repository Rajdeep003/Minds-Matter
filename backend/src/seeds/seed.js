require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB } = require("../config/db");
const { bookings, comments, conversations, forumPosts, resources, users } = require("../data/dummyContent");
const { Booking, Comment, Conversation, ForumPost, Message, MoodEntry, Notification, Report, Resource, User } = require("../models");

const resetCollections = async () => {
  await Promise.all([
    User.deleteMany(),
    Resource.deleteMany(),
    ForumPost.deleteMany(),
    Comment.deleteMany(),
    Conversation.deleteMany(),
    Message.deleteMany(),
    Booking.deleteMany(),
    MoodEntry.deleteMany(),
    Notification.deleteMany(),
    Report.deleteMany(),
  ]);
};

const seed = async () => {
  await connectDB();
  await resetCollections();

  const createdUsers = [];
  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);
    createdUsers.push(await User.create({ ...user, password: hashed }));
  }

  const admin = createdUsers.find((user) => user.role === "admin");
  const volunteer = createdUsers.find((user) => user.role === "volunteer");
  const member = createdUsers.find((user) => user.role === "user");

  const createdResources = [];
  for (const resource of resources) {
    createdResources.push(await Resource.create({ ...resource, uploadedBy: admin._id }));
  }

  member.bookmarks = createdResources.slice(0, 2).map((resource) => ({ resource: resource._id }));
  member.progress = createdResources.map((resource, index) => ({
    resource: resource._id,
    completed: index === 0,
    progressPercent: index === 0 ? 100 : 45,
    lastAccessedAt: new Date(),
  }));
  await member.save();

  const createdPosts = [];
  for (const [index, post] of forumPosts.entries()) {
    createdPosts.push(await ForumPost.create({ ...post, author: index === 0 ? member._id : volunteer._id }));
  }

  for (const [index, comment] of comments.entries()) {
    await Comment.create({
      post: createdPosts[index % createdPosts.length]._id,
      author: index % 2 === 0 ? volunteer._id : member._id,
      content: comment.content,
    });
  }

  for (const booking of bookings) {
    await Booking.create({
      requester: member._id,
      volunteer: volunteer._id,
      topic: booking.topic,
      notes: booking.notes,
      scheduledFor: new Date(Date.now() + booking.daysFromNow * 24 * 60 * 60 * 1000),
      status: "pending",
    });
  }

  for (const item of conversations) {
    const conversation = await Conversation.create({
      participants: [member._id, volunteer._id],
      type: item.type,
      requestedVolunteer: volunteer._id,
    });

    let latestMessage = null;
    for (const [index, content] of item.messages.entries()) {
      latestMessage = await Message.create({
        conversation: conversation._id,
        sender: index % 2 === 0 ? volunteer._id : member._id,
        content,
        readBy: [member._id, volunteer._id],
      });
    }

    conversation.latestMessage = latestMessage._id;
    await conversation.save();
  }

  await MoodEntry.insertMany([
    { user: member._id, mood: 3, note: "A busy day but manageable.", loggedAt: new Date(Date.now() - 4 * 86400000) },
    { user: member._id, mood: 4, note: "Took a walk and felt calmer.", loggedAt: new Date(Date.now() - 3 * 86400000) },
    { user: member._id, mood: 2, note: "Stress spiked before a deadline.", loggedAt: new Date(Date.now() - 2 * 86400000) },
    { user: member._id, mood: 4, note: "Had a good support chat.", loggedAt: new Date(Date.now() - 86400000) },
  ]);

  await Notification.insertMany([
    {
      user: member._id,
      title: "Welcome to Minds Matter",
      body: "Explore the dashboard and save resources that match your needs.",
      type: "general",
      link: "/dashboard",
    },
    {
      user: volunteer._id,
      title: "Volunteer dashboard ready",
      body: "You can now review support requests and bookings.",
      type: "general",
      link: "/support",
    },
  ]);

  console.log("Seed complete");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
