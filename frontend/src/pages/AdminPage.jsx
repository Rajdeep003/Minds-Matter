import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminApi, resourcesApi } from "../services/api";
import { Badge, Button, Card, EmptyState, LoadingView, SectionHeading, Input, TextArea, StatCard } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    category: "Stress",
    type: "ebook",
    author: "",
    fileUrl: "",
    coverImage: "",
    tags: "",
  });

  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: adminApi.overview,
    enabled: user?.role === "admin",
  });
  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: adminApi.users,
    enabled: user?.role === "admin",
  });

  const toggleBlockMutation = useMutation({
    mutationFn: adminApi.toggleBlock,
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const uploadResourceMutation = useMutation({
    mutationFn: resourcesApi.create,
    onSuccess: () => {
      toast.success("Resource uploaded");
      setResourceForm({
        title: "",
        description: "",
        category: "Stress",
        type: "ebook",
        author: "",
        fileUrl: "",
        coverImage: "",
        tags: "",
      });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });

  if (user?.role !== "admin") {
    return <EmptyState title="Admin access only" description="Only administrators can manage users and resources." />;
  }

  if (overviewQuery.isLoading || usersQuery.isLoading) {
    return <LoadingView />;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Administration"
        title="Moderation and content management"
        description="Review users, flag trends, and keep the resource library current."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Users" value={overviewQuery.data.userCount} />
        <StatCard label="Volunteers" value={overviewQuery.data.volunteerCount} />
        <StatCard label="Posts" value={overviewQuery.data.postCount} />
        <StatCard label="Reports" value={overviewQuery.data.reportCount} />
        <StatCard label="Resources" value={overviewQuery.data.resourceCount} />
        <StatCard label="Bookings" value={overviewQuery.data.bookingCount} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <SectionHeading title="User management" description="Block or unblock accounts that violate community standards." />
          <div className="space-y-3">
            {usersQuery.data.map((account) => (
              <div key={account._id} className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{account.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {account.email} · {account.role}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={account.blocked ? "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200" : ""}>
                    {account.blocked ? "Blocked" : "Active"}
                  </Badge>
                  <Button variant={account.blocked ? "secondary" : "danger"} onClick={() => toggleBlockMutation.mutate(account._id)}>
                    {account.blocked ? "Unblock" : "Block"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeading title="Upload resource" description="Add a new ebook or audio resource to the library." />
          <div className="space-y-3">
            <Input placeholder="Title" value={resourceForm.title} onChange={(event) => setResourceForm((current) => ({ ...current, title: event.target.value }))} />
            <TextArea
              placeholder="Description"
              value={resourceForm.description}
              onChange={(event) => setResourceForm((current) => ({ ...current, description: event.target.value }))}
            />
            <div className="grid gap-3 md:grid-cols-2">
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
                value={resourceForm.category}
                onChange={(event) => setResourceForm((current) => ({ ...current, category: event.target.value }))}
              >
                {["Stress", "Anxiety", "Depression", "Motivation", "Mindfulness", "Sleep", "Self-Care"].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
                value={resourceForm.type}
                onChange={(event) => setResourceForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="ebook">E-book</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <Input placeholder="Author" value={resourceForm.author} onChange={(event) => setResourceForm((current) => ({ ...current, author: event.target.value }))} />
            <Input placeholder="File URL" value={resourceForm.fileUrl} onChange={(event) => setResourceForm((current) => ({ ...current, fileUrl: event.target.value }))} />
            <Input
              placeholder="Cover image URL"
              value={resourceForm.coverImage}
              onChange={(event) => setResourceForm((current) => ({ ...current, coverImage: event.target.value }))}
            />
            <Input placeholder="Comma separated tags" value={resourceForm.tags} onChange={(event) => setResourceForm((current) => ({ ...current, tags: event.target.value }))} />
            <Button onClick={() => uploadResourceMutation.mutate(resourceForm)}>Upload resource</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
