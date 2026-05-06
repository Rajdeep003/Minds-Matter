import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import toast from "react-hot-toast";
import { ArrowRight, BookmarkIcon, TrendingUp } from "lucide-react";
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
      setMood(4);
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

  // Prepare mood chart data with better formatting
  const moodChartData = dashboard.moodEntries.map((entry) => ({
    ...entry,
    label: new Date(entry.loggedAt).toLocaleDateString([], { weekday: 'short' }),
    displayDate: new Date(entry.loggedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
  }));

  const moodLabels = {
    1: { label: 'Very Low', color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200' },
    2: { label: 'Low', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-200' },
    3: { label: 'Neutral', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-200' },
    4: { label: 'Good', color: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200' },
    5: { label: 'Excellent', color: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-200' },
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      {/* Header Section */}
      <header className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <SectionHeading
            eyebrow="Personal Overview"
            title={`Welcome back, ${dashboard.user.name || 'Friend'}`}
            description="Track how you feel and revisit your support habits."
          />
        </div>
        <div className="hidden md:block">
          <Badge variant="outline" className="px-4 py-2 text-xs sm:text-sm">
            ✓ Last login: Today
          </Badge>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Saved resources" 
          value={dashboard.stats.savedResources} 
          hint="Across ebooks and audio." 
        />
        <StatCard 
          label="Completed" 
          value={dashboard.stats.completedResources} 
          hint="Finished content sessions." 
        />
        <StatCard 
          label="Mood entries" 
          value={dashboard.stats.moodStreakEntries} 
          hint="Latest seven check-ins." 
        />
        <StatCard 
          label="Volunteers" 
          value={dashboard.stats.volunteersAvailable} 
          hint="Currently online to help." 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        
        {/* Mood Tracker Card */}
        <Card className="flex flex-col overflow-hidden shadow-sm transition-all hover:shadow-md">
          <div className="space-y-6 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <SectionHeading 
                title="Mood tracker" 
                description="Your weekly emotional trend." 
              />
              <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            </div>

            {/* Chart Section */}
            <div className="space-y-4">
              <div className="h-[280px] w-full rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 lg:h-[300px]">
                {moodChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={moodChartData}>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="#e2e8f0" 
                        className="dark:stroke-white/10"
                      />
                      <XAxis 
                        dataKey="label" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        className="dark:stroke-slate-400"
                      />
                      <YAxis 
                        domain={[1, 5]} 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        ticks={[1, 2, 3, 4, 5]}
                        className="dark:stroke-slate-400"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                          backgroundColor: '#f8fafc',
                          color: '#1e293b',
                        }}
                        formatter={(value) => [`Mood: ${value}`, 'Score']}
                        labelFormatter={(label) => label}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#0f766e" 
                        strokeWidth={3} 
                        dot={{ r: 5, fill: "#0f766e", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 7, fill: "#0f766e" }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-slate-500 dark:text-slate-400">No mood data yet. Start logging!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Input Section */}
          <div className="border-t border-slate-100 bg-slate-50/50 p-5 sm:p-6 dark:border-white/5 dark:bg-white/5">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Log your mood today
              </p>
              <div className="grid gap-4 md:grid-cols-[140px_1fr_auto]">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Score
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium ring-teal-500 transition-all focus:ring-2 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                    value={mood}
                    onChange={(e) => setMood(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <option key={i} value={i}>
                        {i} — {moodLabels[i].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Daily Note
                  </label>
                  <TextArea
                    placeholder="What's on your mind? (optional)"
                    className="min-h-[42px] resize-none rounded-xl"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <div className="flex items-end pt-1 md:pt-0">
                  <Button 
                    className="h-[42px] w-full whitespace-nowrap md:w-auto"
                    onClick={() => moodMutation.mutate({ mood, note })} 
                    disabled={moodMutation.isPending}
                  >
                    {moodMutation.isPending ? "Saving..." : "Log Mood"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendations Column */}
        <Card className="flex flex-col shadow-sm">
          <div className="space-y-4 p-5 sm:p-6">
            <SectionHeading 
              title="Recommended" 
              description="Next steps for you." 
            />
            <div className="space-y-3">
              {dashboard.recommendations.length > 0 ? (
                dashboard.recommendations.map((resource) => (
                  <button
                    key={resource._id}
                    className="group relative flex w-full flex-col gap-2 rounded-2xl border border-transparent bg-slate-50 p-4 text-left transition-all hover:border-teal-500/30 hover:bg-white hover:shadow-sm dark:bg-slate-800/50 dark:hover:bg-slate-800"
                  >
                    <Badge variant="secondary" className="mb-1 text-[10px] w-fit">
                      {resource.category}
                    </Badge>
                    <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {resource.title}
                    </p>
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                      {resource.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium text-teal-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-teal-400">
                      View <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState 
                  title="All caught up" 
                  description="Check back later for more recommendations." 
                />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Saved & Community */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Saved Resources */}
        <Card className="flex flex-col shadow-sm">
          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <SectionHeading 
                title="Saved resources" 
                description="Jump back in." 
              />
              <BookmarkIcon className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            </div>
            <div className="space-y-3">
              {dashboard.user.bookmarks && dashboard.user.bookmarks.length > 0 ? (
                dashboard.user.bookmarks.slice(0, 5).map((item) => (
                  <div 
                    key={item.resource?._id} 
                    className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-4 transition-all hover:border-teal-200 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className="font-medium text-slate-900 dark:text-white truncate">
                        {item.resource?.title || 'Untitled'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.resource?.category || 'General'}
                      </span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="bg-white dark:bg-slate-900 flex-shrink-0 text-xs"
                    >
                      {item.resource?.type || 'Item'}
                    </Badge>
                  </div>
                ))
              ) : (
                <EmptyState 
                  title="Empty bookmarks" 
                  description="Save items to see them here." 
                />
              )}
            </div>
          </div>
        </Card>

        {/* Community Highlights */}
        <Card className="flex flex-col shadow-sm">
          <div className="space-y-4 p-5 sm:p-6">
            <SectionHeading 
              title="Community highlights" 
              description="Trending in the forum." 
            />
            <div className="space-y-4">
              {dashboard.latestPosts && dashboard.latestPosts.length > 0 ? (
                dashboard.latestPosts.slice(0, 5).map((post) => (
                  <button
                    key={post._id}
                    className="group flex flex-col gap-2 rounded-xl border border-transparent p-3 text-left transition-all hover:border-teal-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <p className="font-semibold text-slate-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400 transition-colors line-clamp-1">
                      {post.title || 'Untitled Post'}
                    </p>
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                      {post.content}
                    </p>
                  </button>
                ))
              ) : (
                <EmptyState 
                  title="No posts yet" 
                  description="Be the first to start a discussion!" 
                />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
