import type { Conversation, Post, User } from "@/lib/store";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function searchLuna(query: string, users: User[], posts: Post[]) {
  const term = normalize(query);
  if (!term) return { users: [], posts: [] };
  return {
    users: users.filter((user) => normalize(`${user.name} ${user.handle}`).includes(term))
      .map(({ id, name, handle, bio }) => ({ id, name, handle, bio })),
    posts: posts.filter((post) => normalize(post.text).includes(term)).sort((a, b) => b.createdAt - a.createdAt),
  };
}

export function lunaActivity(userId: string, posts: Post[], convos: Conversation[]) {
  const comments = posts.filter((post) => post.userId === userId).flatMap((post) =>
    post.comments.filter((comment) => comment.userId !== userId).map((comment) => ({
      id: comment.id, from: comment.userId, text: `Comentó tu publicación: ${comment.text}`, at: comment.at, postId: post.id,
    })),
  );
  const messages = convos.flatMap((convo) => {
    const last = convo.messages.at(-1);
    return last && last.from !== userId ? [{ id: convo.id, from: last.from, text: last.text || `Te envió ${last.attachment?.name ?? "un archivo"}`, at: last.at, postId: null }] : [];
  });
  return [...comments, ...messages].sort((a, b) => b.at - a.at);
}