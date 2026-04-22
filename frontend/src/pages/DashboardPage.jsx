import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";
import { dashboardApi, moodApi } from "../services/api";
import { Badge, Button, Card, EmptyState, LoadingView, SectionHeading, StatCard, TextArea } from "../components/ui";
import { useState } from "react";

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
    onError: (error) => toast.error(error.response?.data?.message || "Unable to log mood."),
  });

  if (dashboardQuery.isLoading) {
    return <LoadingView />;
  }

  if (dashboardQuery.isError) {
    return <EmptyState title="Dashboard unavailable" description="We could not load your dashboard right now." />;
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Today"
        title={`Welcome back, ${dashboard.user.name}`}
        description="Track how you feel, revisit saved resources, and keep your support habits consistent."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saved resources" value={dashboard.stats.savedResources} hint="Bookmarks across ebooks and audio." />
        <StatCard label="Completed resources" value={dashboard.stats.completedResources} hint="Finished content sessions." />
        <StatCard label="Mood entries" value={dashboard.stats.moodStreakEntries} hint="Your latest seven check-ins." />
        <StatCard label="Active volunteers" value={dashboard.stats.volunteersAvailable} hint="People currently available to help." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <SectionHeading title="Mood tracker" description="Log how you feel and watch your weekly trend build over time." />
          <div className="mb-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboard.moodEntries.map((entry) => ({ ...entry, label: new Date(entry.loggedAt).toLocaleDateString() }))}>
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis domain={[1, 5]} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#0f766e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-3 md:grid-cols-[0.35fr_1fr_auto]">
            <select
              aria-label="Mood score"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
              value={mood}
              onChange={(event) => setMood(Number(event.target.value))}
            >
              {[1, 2, 3, 4, 5].map((item) => (
                <option key={item} value={item}>
                  {item} / 5
                </option>
              ))}
            </select>
            <TextArea
              aria-label="Mood note"
              placeholder="What influenced your mood today?"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
            <Button onClick={() => moodMutation.mutate({ mood, note })} disabled={moodMutation.isPending}>
              Save mood
            </Button>
          </div>
        </Card>

        <Card>
          <SectionHeading title="Recommended next steps" description="Based on your recent activity and saved resources." />
          <div className="space-y-3">
            {dashboard.recommendations.length ? (
              dashboard.recommendations.map((resource) => (
                <div key={resource._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{resource.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{resource.description}</p>
                    </div>
                    <Badge>{resource.category}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="Everything is bookmarked" description="Try a community discussion or support booking next." />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionHeading title="Saved resources" description="Jump back into what you were learning." />
          <div className="space-y-3">
            {dashboard.user.bookmarks?.length ? (
              dashboard.user.bookmarks.map((item) => (
                <div key={item.resource?._id} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                  <div>
                    <p className="font-medium">{item.resource?.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.resource?.category}</p>
                  </div>
                  <Badge>{item.resource?.type}</Badge>
                </div>
              ))
            ) : (
              <EmptyState title="No saved resources yet" description="Bookmark an ebook or audio session from the library." />
            )}
          </div>
        </Card>

        <Card>
          <SectionHeading title="Community highlights" description="Recent posts from the support forum." />
          <div className="space-y-3">
            {dashboard.latestPosts.map((post) => (
              <div key={post._id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="font-medium">{post.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{post.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
