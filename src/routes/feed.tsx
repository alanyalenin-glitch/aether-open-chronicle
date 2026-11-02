import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Heart, ImagePlus, MessageCircle, Share2, Check, X } from "lucide-react";
import { AppShell, Avatar } from "@/components/AppShell";
import { timeAgo, useStore, type Post } from "@/lib/store";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Inicio — Luna" },
      { name: "description", content: "Tu muro cronológico en Luna, sin algoritmos ocultos." },
      { property: "og:title", content: "Inicio — Luna" },
      { property: "og:description", content: "Publicaciones en orden cronológico." },
    ],
  }),
  component: Feed,
});

const card = "rounded-2xl border bg-card/70 backdrop-blur transition-colors";

function Feed() {
  const { me, posts, addPost } = useStore();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };
  const publish = () => {
    if (!text.trim() && !image) return;
    addPost(text.trim(), image);
    setText("");
    setImage(undefined);
  };
  const sorted = [...posts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <AppShell title="Inicio">
      <div className={`${card} p-4`}>
        <div className="flex gap-3">
          <Avatar user={me ?? undefined} />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="¿Qué estás pensando?"
              rows={2}
              className="w-full resize-none bg-transparent pt-2 outline-none placeholder:text-muted-foreground"
            />
            {image && (
              <div className="relative mt-2 overflow-hidden rounded-xl border">
                <img src={image} alt="" className="max-h-80 w-full object-cover" />
                <button onClick={() => setImage(undefined)} className="glass absolute right-2 top-2 rounded-full p-1.5" aria-label="Quitar imagen">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t pt-3">
              <button onClick={() => fileRef.current?.click()} className="rounded-full p-2 text-primary transition hover:bg-accent" aria-label="Añadir imagen">
                <ImagePlus size={20} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
              <button
                onClick={publish}
                disabled={!text.trim() && !image}
                className="bg-luna rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="px-1 py-4 text-xs uppercase tracking-widest text-muted-foreground">Orden cronológico · sin algoritmos</p>
      <div className="space-y-4">
        {sorted.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </AppShell>
  );
}

function PostCard({ post: p }: { post: Post }) {
  const { getUser, toggleLike, addComment } = useStore();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [shared, setShared] = useState(false);
  const u = getUser(p.userId);
  const liked = p.likes.includes("me");

  const share = async () => {
    const url = `${window.location.origin}/feed#${p.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Luna", text: p.text, url });
      else await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {}
  };

  const btn = "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition hover:bg-secondary";

  return (
    <article className={`${card} fade-up overflow-hidden hover:bg-card`}>
      <div className="flex items-center gap-3 px-4 pt-4">
        <Avatar user={u} />
        <div className="leading-tight">
          <p className="font-semibold">{u?.name}</p>
          <p className="text-xs text-muted-foreground">@{u?.handle} · {timeAgo(p.createdAt)}</p>
        </div>
      </div>
      {p.text && <p className="whitespace-pre-wrap px-4 pt-3 leading-relaxed">{p.text}</p>}
      {p.image && <img src={p.image} alt="" loading="lazy" className="mt-3 max-h-[28rem] w-full object-cover" />}
      <div className="flex items-center gap-1 border-t px-2 py-1.5 mt-3">
        <button onClick={() => toggleLike(p.id)} className={`${btn} ${liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}>
          <Heart size={18} className={`transition-transform ${liked ? "scale-110 fill-current" : ""}`} /> {p.likes.length}
        </button>
        <button onClick={() => setOpen(!open)} className={`${btn} ${open ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
          <MessageCircle size={18} /> {p.comments.length}
        </button>
        <button onClick={share} className={`${btn} ml-auto text-muted-foreground hover:text-primary`}>
          {shared ? <><Check size={18} /> Copiado</> : <><Share2 size={18} /> Compartir</>}
        </button>
      </div>
      {open && (
        <div className="fade-up space-y-3 border-t bg-background/40 p-4">
          {p.comments.map((c) => {
            const cu = getUser(c.userId);
            return (
              <div key={c.id} className="flex gap-2">
                <Avatar user={cu} size={28} />
                <div className="rounded-2xl bg-secondary px-3 py-2 text-sm">
                  <span className="font-semibold">{cu?.name}</span> <span className="text-xs text-muted-foreground">{timeAgo(c.at)}</span>
                  <p>{c.text}</p>
                </div>
              </div>
            );
          })}
          <form
            onSubmit={(e) => { e.preventDefault(); if (comment.trim()) { addComment(p.id, comment.trim()); setComment(""); } }}
            className="flex gap-2"
          >
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Escribe un comentario…" className="flex-1 rounded-full border bg-input px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button className="bg-luna rounded-full px-4 text-sm font-semibold text-primary-foreground disabled:opacity-40" disabled={!comment.trim()}>Enviar</button>
          </form>
        </div>
      )}
    </article>
  );
}
