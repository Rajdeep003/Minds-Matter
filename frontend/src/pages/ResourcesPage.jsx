import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { resourcesApi } from "../services/api";
import { Badge, Button, Card, EmptyState, LoadingView, SectionHeading } from "../components/ui";

export function ResourcesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: "", category: "", type: "" });

  const resourcesQuery = useQuery({
    queryKey: ["resources", filters],
    queryFn: () => resourcesApi.list(filters),
  });

  const bookmarkMutation = useMutation({
    mutationFn: resourcesApi.bookmark,
    onSuccess: () => {
      toast.success("Resource updated");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({ id, payload }) => resourcesApi.progress(id, payload),
    onSuccess: () => {
      toast.success("Progress saved");
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const grouped = useMemo(() => {
    const items = resourcesQuery.data || [];
    return {
      featured: items.filter((item) => item.featured),
      all: items,
    };
  }, [resourcesQuery.data]);

  if (resourcesQuery.isLoading) {
    return <LoadingView />;
  }

  if (resourcesQuery.isError) {
    return <EmptyState title="Resource library unavailable" description="Please try again in a moment." />;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Library"
        title="Mental health resources"
        description="Browse ebooks and audio sessions by category, then save or track your progress."
      />

      <Card className="grid gap-3 md:grid-cols-4">
        <input
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
          placeholder="Search title, author, topic"
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
        />
        <select
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
          value={filters.category}
          onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
        >
          <option value="">All categories</option>
          {["Stress", "Anxiety", "Depression", "Motivation", "Mindfulness", "Sleep", "Self-Care"].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
          value={filters.type}
          onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
        >
          <option value="">All formats</option>
          <option value="ebook">E-books</option>
          <option value="audio">Audiobooks</option>
        </select>
        <Button variant="secondary" onClick={() => setFilters({ search: "", category: "", type: "" })}>
          Reset filters
        </Button>
      </Card>

      <section className="space-y-4">
        <SectionHeading title="Featured picks" description="A calming place to begin when you are not sure what you need." />
        <div className="grid gap-4 lg:grid-cols-2">
          {grouped.featured.map((resource) => (
            <Card key={resource._id} className="overflow-hidden p-0">
              <img src={resource.coverImage} alt="" className="h-48 w-full object-cover" />
              <div className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <Badge>{resource.type}</Badge>
                  <Badge className="bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-200">
                    {resource.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-xl font-semibold">{resource.title}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{resource.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => bookmarkMutation.mutate(resource._id)}>Bookmark</Button>
                  <Button
                    variant="secondary"
                    onClick={() => progressMutation.mutate({ id: resource._id, payload: { progressPercent: 100, completed: true } })}
                  >
                    Mark complete
                  </Button>
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold dark:bg-white/10"
                  >
                    Open
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading title="All resources" description="Everything available in the current library." />
        {grouped.all.length ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {grouped.all.map((resource) => (
              <Card key={resource._id}>
                <div className="flex items-center justify-between gap-3">
                  <Badge>{resource.type}</Badge>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{resource.author}</span>
                </div>
                <p className="mt-4 text-lg font-semibold">{resource.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{resource.description}</p>
                {resource.type === "audio" ? (
                  <audio controls className="mt-4 w-full">
                    <source src={resource.fileUrl} />
                  </audio>
                ) : (
                  <iframe title={resource.title} src={resource.fileUrl} className="mt-4 h-56 w-full rounded-2xl border border-slate-200 dark:border-white/10" />
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => bookmarkMutation.mutate(resource._id)}>
                    Save
                  </Button>
                  <Button
                    onClick={() => progressMutation.mutate({ id: resource._id, payload: { progressPercent: 50, completed: false } })}
                  >
                    Track progress
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No resources match these filters" description="Try broadening your search or switching category." />
        )}
      </section>
    </div>
  );
}
