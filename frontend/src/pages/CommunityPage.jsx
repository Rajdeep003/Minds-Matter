import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { forumApi } from "../services/api";
import { Badge, Button, Card, EmptyState, LoadingView, SectionHeading, TextArea, Input } from "../components/ui";

export function CommunityPage() {
  const queryClient = useQueryClient();
  const [postForm, setPostForm] = useState({ title: "", content: "", category: "General", anonymous: false });
  const [commentDrafts, setCommentDrafts] = useState({});

  const postsQuery = useQuery({
    queryKey: ["forum-posts"],
    queryFn: forumApi.list,
  });

  const createPostMutation = useMutation({
    mutationFn: forumApi.create,
    onSuccess: () => {
      toast.success("Post shared");
      setPostForm({ title: "", content: "", category: "General", anonymous: false });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
  });

  const likeMutation = useMutation({
    mutationFn: forumApi.like,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["forum-posts"] }),
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, payload }) => forumApi.comment(id, payload),
    onSuccess: () => {
      toast.success("Reply posted");
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      setCommentDrafts({});
    },
  });

  const reportMutation = useMutation({
    mutationFn: forumApi.report,
    onSuccess: () => toast.success("Thanks for reporting this content."),
  });

  if (postsQuery.isLoading) {
    return <LoadingView />;
  }

  if (postsQuery.isError) {
    return <EmptyState title="Community feed unavailable" description="Try reloading the page." />;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Community"
        title="Talk openly or anonymously"
        description="Ask questions, share encouragement, and reply supportively while keeping moderation tools close."
      />

      <Card className="space-y-4">
        <Input
          placeholder="Post title"
          value={postForm.title}
          onChange={(event) => setPostForm((current) => ({ ...current, title: event.target.value }))}
        />
        <TextArea
          placeholder="What would you like support with today?"
          value={postForm.content}
          onChange={(event) => setPostForm((current) => ({ ...current, content: event.target.value }))}
        />
        <div className="grid gap-3 md:grid-cols-[0.4fr_auto_auto]">
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
            value={postForm.category}
            onChange={(event) => setPostForm((current) => ({ ...current, category: event.target.value }))}
          >
            {["General", "Stress", "Anxiety", "Depression", "Motivation", "Self-Care"].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm dark:border-white/10">
            <input
              type="checkbox"
              checked={postForm.anonymous}
              onChange={(event) => setPostForm((current) => ({ ...current, anonymous: event.target.checked }))}
            />
            Post anonymously
          </label>
          <Button onClick={() => createPostMutation.mutate(postForm)} disabled={createPostMutation.isPending}>
            Share post
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {postsQuery.data.length ? (
          postsQuery.data.map((post) => (
            <Card key={post._id} className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{post.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {post.author?.name} · {new Date(post.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge>{post.category}</Badge>
              </div>
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{post.content}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => likeMutation.mutate(post._id)}>
                  Like ({post.likes.length})
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    reportMutation.mutate({
                      targetType: "post",
                      targetId: post._id,
                      reason: "Flagged from forum UI",
                    })
                  }
                >
                  Report
                </Button>
              </div>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <p className="text-sm font-semibold">Replies</p>
                {post.comments?.map((comment) => (
                  <div key={comment._id} className="rounded-2xl bg-white p-3 dark:bg-slate-950">
                    <p className="text-sm font-medium">{comment.author?.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a reply"
                    value={commentDrafts[post._id] || ""}
                    onChange={(event) => setCommentDrafts((current) => ({ ...current, [post._id]: event.target.value }))}
                  />
                  <Button onClick={() => commentMutation.mutate({ id: post._id, payload: { content: commentDrafts[post._id] } })}>
                    Reply
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyState title="No forum posts yet" description="Be the first to share a question or encouraging note." />
        )}
      </div>
    </div>
  );
}
