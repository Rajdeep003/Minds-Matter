import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { commonApi, notificationsApi, supportApi } from "../services/api";
import { Badge, Button, Card, EmptyState, LoadingView, SectionHeading, TextArea, Input } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function SupportPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [bookingForm, setBookingForm] = useState({ volunteer: "", topic: "", notes: "", scheduledFor: "" });
  const [prompt, setPrompt] = useState("");
  const [aiReply, setAiReply] = useState("");

  const volunteersQuery = useQuery({ queryKey: ["volunteers"], queryFn: supportApi.volunteers });
  const conversationsQuery = useQuery({ queryKey: ["conversations"], queryFn: supportApi.conversations });
  const bookingsQuery = useQuery({ queryKey: ["bookings"], queryFn: supportApi.bookings });
  const emergencyQuery = useQuery({ queryKey: ["emergency"], queryFn: commonApi.emergency });
  const notificationsQuery = useQuery({ queryKey: ["notifications"], queryFn: notificationsApi.list });

  const messagesQuery = useQuery({
    queryKey: ["messages", selectedConversation?._id],
    queryFn: () => supportApi.messages(selectedConversation._id),
    enabled: Boolean(selectedConversation?._id),
  });

  useEffect(() => {
    if (!selectedConversation && conversationsQuery.data?.length) {
      setSelectedConversation(conversationsQuery.data[0]);
    }
  }, [conversationsQuery.data, selectedConversation]);

  const createSupportMutation = useMutation({
    mutationFn: supportApi.createConversation,
    onSuccess: () => {
      toast.success("Support conversation started");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, payload }) => supportApi.sendMessage(id, payload),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", selectedConversation?._id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const bookingMutation = useMutation({
    mutationFn: supportApi.createBooking,
    onSuccess: () => {
      toast.success("Booking request sent");
      setBookingForm({ volunteer: "", topic: "", notes: "", scheduledFor: "" });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const bookingStatusMutation = useMutation({
    mutationFn: ({ id, payload }) => supportApi.updateBooking(id, payload),
    onSuccess: () => {
      toast.success("Booking updated");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const aiMutation = useMutation({
    mutationFn: commonApi.aiSupport,
    onSuccess: (data) => setAiReply(data.response),
  });

  const unreadNotifications = useMemo(
    () => (notificationsQuery.data || []).filter((item) => !item.read).slice(0, 5),
    [notificationsQuery.data]
  );

  if (
    volunteersQuery.isLoading ||
    conversationsQuery.isLoading ||
    bookingsQuery.isLoading ||
    emergencyQuery.isLoading ||
    notificationsQuery.isLoading
  ) {
    return <LoadingView />;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Support"
        title="Messages, bookings, and urgent help"
        description="Connect with volunteers, manage upcoming sessions, and use the emergency panel when immediate help is needed."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr_0.8fr]">
        <Card className="space-y-4">
          <SectionHeading title="Volunteer chat" description="Start a direct support conversation without waiting for realtime sockets." />
          <div className="flex flex-wrap gap-2">
            {volunteersQuery.data.map((volunteer) => (
              <Button
                key={volunteer._id}
                variant="secondary"
                onClick={() =>
                  createSupportMutation.mutate({
                    participants: [volunteer._id],
                    type: "support",
                    requestedVolunteer: volunteer._id,
                  })
                }
              >
                Request {volunteer.name}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.45fr_1fr]">
            <div className="space-y-3">
              {conversationsQuery.data.length ? (
                conversationsQuery.data.map((conversation) => (
                  <button
                    key={conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedConversation?._id === conversation._id
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10"
                        : "border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <p className="font-semibold">
                      {conversation.participants.filter((participant) => participant._id !== user._id).map((participant) => participant.name).join(", ") ||
                        "Support channel"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{conversation.type}</p>
                  </button>
                ))
              ) : (
                <EmptyState title="No conversations yet" description="Request a volunteer chat to get started." />
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 p-4 dark:border-white/10">
              <div className="mb-4 max-h-96 space-y-3 overflow-y-auto">
                {messagesQuery.data?.map((item) => (
                  <div
                    key={item._id}
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      item.sender?._id === user._id
                        ? "ml-auto bg-teal-600 text-white"
                        : "bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-white"
                    }`}
                  >
                    <p className="font-semibold">{item.sender?.name}</p>
                    <p className="mt-1">{item.content}</p>
                  </div>
                ))}
              </div>
              {selectedConversation ? (
                <div className="flex gap-2">
                  <Input placeholder="Write a message" value={message} onChange={(event) => setMessage(event.target.value)} />
                  <Button onClick={() => sendMessageMutation.mutate({ id: selectedConversation._id, payload: { content: message } })}>
                    Send
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeading title="Book a session" description="Request a time slot with a volunteer or counselor." />
          <div className="space-y-3">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
              value={bookingForm.volunteer}
              onChange={(event) => setBookingForm((current) => ({ ...current, volunteer: event.target.value }))}
            >
              <option value="">Choose a volunteer</option>
              {volunteersQuery.data.map((volunteer) => (
                <option key={volunteer._id} value={volunteer._id}>
                  {volunteer.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="Session topic"
              value={bookingForm.topic}
              onChange={(event) => setBookingForm((current) => ({ ...current, topic: event.target.value }))}
            />
            <Input
              type="datetime-local"
              value={bookingForm.scheduledFor}
              onChange={(event) => setBookingForm((current) => ({ ...current, scheduledFor: event.target.value }))}
            />
            <TextArea
              placeholder="Add context or goals for the session"
              value={bookingForm.notes}
              onChange={(event) => setBookingForm((current) => ({ ...current, notes: event.target.value }))}
            />
            <Button onClick={() => bookingMutation.mutate(bookingForm)}>Request booking</Button>
          </div>
          <div className="space-y-3">
            {bookingsQuery.data.map((booking) => (
              <div key={booking._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{booking.topic}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {new Date(booking.scheduledFor).toLocaleString()}
                    </p>
                  </div>
                  <Badge>{booking.status}</Badge>
                </div>
                {(user.role === "volunteer" || user.role === "admin") && booking.status === "pending" ? (
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => bookingStatusMutation.mutate({ id: booking._id, payload: { status: "approved" } })}
                    >
                      Approve
                    </Button>
                    <Button variant="danger" onClick={() => bookingStatusMutation.mutate({ id: booking._id, payload: { status: "rejected" } })}>
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4">
            <SectionHeading title="Emergency help" description="Immediate crisis contacts when you need fast support." />
            <div className="space-y-3">
              {emergencyQuery.data.contacts.map((contact) => (
                <div key={contact.phone} className="rounded-2xl bg-rose-50 p-4 dark:bg-rose-500/10">
                  <p className="font-semibold">{contact.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{contact.country}</p>
                  <a href={`tel:${contact.phone}`} className="mt-2 inline-flex text-sm font-semibold text-rose-700 dark:text-rose-200">
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <SectionHeading title="AI support" description="A basic guided helper with predefined coping prompts." />
            <TextArea placeholder="Try: I feel anxious before meetings" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
            <Button onClick={() => aiMutation.mutate({ message: prompt })}>Ask support bot</Button>
            {aiReply ? <div className="rounded-2xl bg-slate-50 p-4 text-sm dark:bg-white/5">{aiReply}</div> : null}
          </Card>

          <Card className="space-y-4">
            <SectionHeading title="Notifications" description="Recent alerts for bookings, replies, and messages." />
            <div className="space-y-3">
              {unreadNotifications.map((notification) => (
                <div key={notification._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.body}</p>
                </div>
              ))}
              {!unreadNotifications.length ? <EmptyState title="All caught up" description="No unread notifications right now." /> : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
