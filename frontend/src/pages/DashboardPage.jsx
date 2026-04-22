import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import toast from "react-hot-toast";
import { dashboardApi, moodApi } from "../services/api";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  LoadingView,
  SectionHeading,
  StatCard,
  TextArea,
} from "../components/ui";
import { useState } from "react";
import { motion } from "framer-motion";

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [mood, setMood] = useState(4);
  const [note, setNote] = useState("");

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.get,
  });

  const moodMutation = useMutation({
    mutationFn: moodApi.create,
    onSuccess: () => {
      toast.success("Mood logged");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["moods"] });
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Unable to log mood."),
  });

  if (dashboardQuery.isLoading) return <LoadingView />;
  if (dashboardQuery.isError)
    return (
      <EmptyState
        title="Dashboard unavailable"
        description="We could not load your dashboard right now."
      />
    );

  const dashboard = dashboardQuery.data;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 px-4 md:px-6 xl:px-10"
    >
      {/* Header */}
      <SectionHeading
        eyebrow="Today"
        title={`Welcome back, ${dashboard.user.name}`}
        description="Track your mood, revisit resources, and stay consistent."
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Saved",
            value: dashboard.stats.savedResources,
            icon: "📚",
          },
          {
            label: "Completed",
            value: dashboard.stats.completedResources,
            icon: "✅",
          },
          {
            label: "Mood Entries",
            value: dashboard.stats.moodStreakEntries,
            icon: "🧠",
          },
          {
            label: "Volunteers",
            value: dashboard.stats.volunteersAvailable,
            icon: "🤝",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="rounded-2xl p-5 bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-800 shadow-sm hover:shadow-md transition"
          >
            <div className="text-2xl">{stat.icon}</div>
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Section */}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Mood Tracker */}
        <Card className="p-6 shadow-sm hover:shadow-md transition">
          <SectionHeading
            title="Mood tracker"
            description="Track your weekly mood trend."
          />

          {/* Chart */}
          <div className="h-72 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboard.moodEntries.map((entry) => ({
                  ...entry,
                  label: new Date(entry.loggedAt).toLocaleDateString(),
                }))}
              >
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis domain={[1, 5]} stroke="#94a3b8" />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="mood"
                  stroke="url(#colorMood)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mood Input */}
          <div className="space-y-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((item) => (
                <button
                  key={item}
                  onClick={() => setMood(item)}
                  className={`text-xl p-2 rounded-full transition ${
                    mood === item
                      ? "bg-teal-500 text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {["😞", "😕", "😐", "🙂", "😄"][item - 1]}
                </button>
              ))}
            </div>

            <TextArea
              placeholder="What influenced your mood?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <Button
              onClick={() => moodMutation.mutate({ mood, note })}
              disabled={moodMutation.isPending}
            >
              Save mood
            </Button>
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="p-6 shadow-sm hover:shadow-md transition">
          <SectionHeading
            title="Recommended"
            description="Based on your activity"
          />

          <div className="space-y-3">
            {dashboard.recommendations.length ? (
              dashboard.recommendations.map((res) => (
                <div
                  key={res._id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{res.title}</p>
                      <p className="text-sm text-slate-500">
                        {res.description}
                      </p>
                    </div>
                    <Badge>{res.category}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No recommendations"
                description="Explore more resources"
              />
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Saved */}
        <Card className="p-6 shadow-sm hover:shadow-md transition">
          <SectionHeading title="Saved resources" />

          <div className="space-y-3">
            {dashboard.user.bookmarks?.length ? (
              dashboard.user.bookmarks.map((item) => (
                <div
                  key={item.resource?._id}
                  className="flex justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:shadow transition"
                >
                  <div>
                    <p className="font-medium">
                      {item.resource?.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {item.resource?.category}
                    </p>
                  </div>
                  <Badge>{item.resource?.type}</Badge>
                </div>
              ))
            ) : (
              <EmptyState title="No saved resources" />
            )}
          </div>
        </Card>

        {/* Community */}
        <Card className="p-6 shadow-sm hover:shadow-md transition">
          <SectionHeading title="Community highlights" />

          <div className="space-y-3">
            {dashboard.latestPosts.map((post) => (
              <div
                key={post._id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:shadow transition"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-500 text-white flex items-center justify-center">
                    {post.author?.name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-slate-500">
                      {post.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}