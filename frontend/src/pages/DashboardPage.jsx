import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
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
      toast.success("Mood logged successfully");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["moods"] });
    },
    onError: (error) => toast.error(error.response?.data?.message || "Unable to log mood."),
  });

  if (dashboardQuery.isLoading) return <LoadingView />;
  if (dashboardQuery.isError) {
    return <EmptyState title="Dashboard unavailable" description="We could not load your dashboard right now." />;
  }

  const dashboard = dashboardQuery.data;

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 lg:p-8">
      {/* Header Section */}
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Personal Overview"
          title={`Welcome back, ${dashboard.user.name}`}
          description="Track how you feel and revisit your support habits."
        />
        <div className="hidden md:block">
           <Badge variant="outline" className="px-3 py-1">Last login: Today</Badge>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Saved resources" value={dashboard.stats.savedResources} hint="Across ebooks and audio." />
        <StatCard label="Completed" value={dashboard.stats.completedResources} hint="Finished content sessions." />
        <StatCard label="Mood entries" value={dashboard.stats.moodStreakEntries} hint="Latest seven check-ins." />
        <StatCard label="Volunteers" value={dashboard.stats.volunteersAvailable} hint="Currently online to help." />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        
        {/* Mood Tracker Card */}
        <Card className="flex flex-col shadow-sm transition-all hover:shadow-md">
          <div className="p-6">
            <SectionHeading title="Mood tracker" description="Your weekly emotional trend." />
            <div className="mt-8 h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard.moodEntries.map((entry) => ({ ...entry, label: new Date(entry.loggedAt).toLocaleDateString([], { weekday: 'short' }) }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[1, 5]} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="mood" stroke="#0f766e" strokeWidth={4} dot={{ r: 4, fill: "#0f766e" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="mt-auto border-t border-slate-100 bg-slate-50/50 p-6 dark:border-white/5 dark:bg-white/5">
            <div className="grid gap-4 md:grid-cols-[140px_1fr_auto]">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Score</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm ring-teal-500 transition-all focus:ring-2 dark:border-white/10 dark:bg-slate-950"
                  value={mood}
                  onChange={(e) => setMood(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((i) => <option key={i} value={i}>{i} — {i > 3 ? 'Good' : i === 3 ? 'Neutral' : 'Low'}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Daily Note</label>
                <TextArea
                  placeholder="What's on your mind?"
                  className="min-h-[42px] resize-none rounded-xl"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  className="h-[42px] w-full md:w-auto"
                  onClick={() => moodMutation.mutate({ mood, note })} 
                  disabled={moodMutation.isPending}
                >
                  {moodMutation.isPending ? "Saving..." : "Log Mood"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendations Column */}
        <Card className="shadow-sm">
          <div className="p-6">
            <SectionHeading title="Recommended" description="Next steps for you." />
            <div className="mt-6 space-y-4">
              {dashboard.recommendations.length ? (
                dashboard.recommendations.map((resource) => (
                  <div key={resource._id} className="group relative rounded-2xl border border-transparent bg-slate-50 p-4 transition-all hover:border-teal-500/30 hover:bg-white hover:shadow-sm dark:bg-white/5">
                    <Badge variant="secondary" className="mb-2 text-[10px]">{resource.category}</Badge>
                    <p className="font-semibold text-slate-900 dark:text-white">{resource.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">{resource.description}</p>
                  </div>
                ))
              ) : (
                <EmptyState title="All caught up" description="Check back later for more." />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Saved & Community */}
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-6 shadow-sm">
          <SectionHeading title="Saved resources" description="Jump back in." />
          <div className="mt-6 space-y-3">
            {dashboard.user.bookmarks?.length ? (
              dashboard.user.bookmarks.map((item) => (
                <div key={item.resource?._id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5">
                  <div className="flex flex-col">
                    <span className="font-medium">{item.resource?.title}</span>
                    <span className="text-xs text-slate-500">{item.resource?.category}</span>
                  </div>
                  <Badge variant="outline" className="bg-white dark:bg-slate-900">{item.resource?.type}</Badge>
                </div>
              ))
            ) : (
              <EmptyState title="Empty bookmarks" description="Save items to see them here." />
            )}
          </div>
        </Card>

        <Card className="p-6 shadow-sm">
          <SectionHeading title="Community highlights" description="Trending in the forum." />
          <div className="mt-6 space-y-4">
            {dashboard.latestPosts.map((post) => (
              <div key={post._id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-white/5">
                <p className="font-medium text-slate-900 hover:text-teal-600 dark:text-white dark:hover:text-teal-400 cursor-pointer transition-colors">
                  {post.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{post.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}