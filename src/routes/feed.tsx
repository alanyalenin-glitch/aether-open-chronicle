import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ImagePlus, MessageCircle, Share2, Check, X, Plus, Globe, MoreHorizontal, Megaphone } from "lucide-react";
import { AppShell, Avatar } from "@/components/AppShell";
import { promotionalReason } from "@/lib/content-policy";
import { REACTIONS, reactionCount, timeAgo, useStore, type Post } from "@/lib/store";

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

const card = "rounded-2xl border bg-card transition-colors";
const LABELS: Record<string, string> = { "😆": "Risas", "😍": "Amo", "😭": "Triste", "👍": "Me gusta" };

function Feed() {
  const { me, posts, addPost } = useStore();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string>();
  const [blocked, setBlocked] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };
  const publish = () => {
    if (!text.trim() && !image) return;
    const why = text.trim() ? promotionalReason(text) : null;
    if (why) { setBlocked(why); return; }
    addPost(text.trim(), image);
    setText("");
    setImage(undefined);
    setBlocked(null);
  };
  const sorted = [...posts].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <AppShell title="Inicio">
      <div className="flex items-center gap-3 border-b pb-3">
        <Avatar user={me ?? undefined} size={36} />
        <div className="flex flex-1 items-center rounded-full bg-secondary pl-4 pr-1.5">
          <input value={text} onChange={(e) => { setText(e.target.value); setBlocked(null); }} onKeyDown={(e) => e.key === "Enter" && publish()}
            placeholder="¿Qué estás pensando?" className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground" />
          <button onClick={() => fileRef.current?.click()} className="rounded-full p-2 text-muted-foreground transition hover:text-primary" aria-label="Añadir imagen"><ImagePlus size={19} /></button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
      </div>
      {(text.trim() || image) && (
        <div className="fade-up mt-3 space-y-2">
          {image && (
            <div className="relative overflow-hidden rounded-xl border">
              <img src={image} alt="" className="max-h-80 w-full object-cover" />
              <button onClick={() => setImage(undefined)} className="glass absolute right-2 top-2 rounded-full p-1.5" aria-label="Quitar imagen"><X size={16} /></button>
            </div>
          )}
          <button onClick={publish} className="bg-luna w-full rounded-full py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95">Publicar</button>
        </div>
      )}
      <Stories />
      <div className="space-y-3">
        {sorted.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </AppShell>
  );
}

function PostCard({ post: p }: { post: Post }) {
  const { getUser, react, addComment } = useStore();
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [shared, setShared] = useState(false);
  const u = getUser(p.userId);

  const share = async () => {
    const url = `${window.location.origin}/feed#${p.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Luna", text: p.text, url });
      else await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {}
  };

  const btn = "flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs transition hover:bg-secondary";
  const pill = "flex shrink-0 items-center gap-1.5 rounded-full border bg-secondary px-3 py-1.5 text-sm transition hover:bg-accent active:scale-90";

  return (
    <article className={`${card} fade-up overflow-hidden`}>
      <div className="flex items-center gap-3 px-4 pt-4">
        <Avatar user={u} />
        <div className="leading-tight">
          <p className="font-semibold">{u?.name}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">{timeAgo(p.createdAt)} · <Globe size={12} /></p>
        </div>
        <MoreHorizontal size={20} className="ml-auto text-muted-foreground" />
      </div>
      {p.text && <p className="whitespace-pre-wrap px-4 pt-3 leading-relaxed">{p.text}</p>}
      {p.image && <img src={p.image} alt="" loading="lazy" className="mt-3 aspect-[4/3] w-full object-cover" />}
      <div className="flex gap-2 overflow-x-auto px-3 pt-3 [scrollbar-width:none]" role="group" aria-label="Reacciones">
          {REACTIONS.map((e) => {
            const n = reactionCount(p, e);
            const mine = p.reactions.some((r) => r.emoji === e && r.userId === "me");
            return (
              <button
                key={e}
                onClick={() => react(p.id, e)}
                aria-pressed={mine}
                aria-label={`Reaccionar con ${e}`}
                className={`${pill} ${mine ? "border-primary/40 bg-secondary" : ""}`}
              >
                <span className={`text-base leading-none transition-transform ${mine ? "scale-110" : ""}`}>{e}</span>
                <span className={`text-xs ${e === "😍" ? "text-destructive" : ""}`}>{LABELS[e]}</span>
                <span className={`text-xs tabular-nums ${mine ? "text-foreground" : "text-muted-foreground"}`}>{n}</span>
              </button>
            );
          })}
      </div>
      <div className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground">
        <span className="px-2">{p.reactions.length} reacciones</span>
        <button onClick={() => setOpen(!open)} className={`${btn} ${open ? "text-primary" : "text-muted-foreground hover:text-primary"}`}>
          <MessageCircle size={16} /> {p.comments.length} comentarios
        </button>
        <button onClick={share} className={`${btn} ml-auto text-muted-foreground hover:text-primary`}>
          {shared ? <><Check size={16} /> Copiado</> : <><Share2 size={16} /> Compartir</>}
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

function Stories() {
  const { posts, getUser } = useStore();
  const ids = [...new Set(posts.map((p) => p.userId))].filter((id) => id !== "me");
  const tri = "relative flex h-24 w-[4.5rem] shrink-0 flex-col items-center justify-end";
  return (
    <div className="-mx-3 flex gap-1 overflow-x-auto px-3 py-3 [scrollbar-width:none]">
      <button className={`${tri} rounded-xl border-2 border-primary bg-secondary shadow-[0_0_12px_color-mix(in_oklab,var(--primary)_45%,transparent)]`}>
        <Plus className="mb-auto mt-4 text-primary" size={26} />
        <span className="mb-1.5 text-[11px] leading-tight">Crear<br />historia</span>
      </button>
      {ids.map((id, i) => {
        const u = getUser(id);
        if (!u) return null;
        return (
          <div key={id} className={`${tri} drop-shadow-[0_0_6px_var(--primary)]`}>
            <div className="absolute inset-0 bg-primary" style={{ clipPath: i % 2 ? "polygon(0 0,100% 0,50% 100%)" : "polygon(50% 0,100% 100%,0 100%)" }} />
            <div className="absolute inset-[3px] flex items-center justify-center" style={{ clipPath: i % 2 ? "polygon(4% 2%,96% 2%,50% 96%)" : "polygon(50% 4%,96% 98%,4% 98%)", background: `linear-gradient(160deg, oklch(0.55 0.12 ${u.hue}), oklch(0.3 0.06 ${u.hue + 40}))` }}>
              <span className={`font-display text-2xl font-semibold ${i % 2 ? "-mt-6" : "mt-6"}`}>{u.name.charAt(0)}</span>
            </div>
            <span className="relative mb-0.5 max-w-full truncate rounded px-1 text-[11px] font-medium">{u.name.split(" ")[0]}</span>
          </div>
        );
      })}
    </div>
  );
}
