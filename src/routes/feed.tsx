import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Heart, ImagePlus, X } from "lucide-react";
import { AppShell, Avatar } from "@/components/AppShell";
import { timeAgo, useStore } from "@/lib/store";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "Muro — Aether" },
      { name: "description", content: "Tu muro cronológico en Aether, sin algoritmos ocultos." },
      { property: "og:title", content: "Muro — Aether" },
      { property: "og:description", content: "Publicaciones en orden cronológico." },
    ],
  }),
  component: Feed,
});

function Feed() {
  const { me, posts, getUser, addPost, toggleLike } = useStore();
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
    <AppShell title="Muro">
      <div className="border-b p-5">
        <div className="flex gap-3">
          <Avatar user={me ?? undefined} />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="¿Qué estás pensando?"
              rows={2}
              className="w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            {image && (
              <div className="relative mt-2 overflow-hidden rounded-xl border">
                <img src={image} alt="" className="max-h-80 w-full object-cover" />
                <button onClick={() => setImage(undefined)} className="glass absolute right-2 top-2 rounded-full p-1.5">
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => fileRef.current?.click()} className="rounded-full p-2 text-primary transition hover:bg-accent" aria-label="Añadir imagen">
                <ImagePlus size={20} />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
              <button
                onClick={publish}
                disabled={!text.trim() && !image}
                className="bg-aether rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="px-5 py-3 text-xs uppercase tracking-widest text-muted-foreground">Orden cronológico · sin algoritmos</p>
      {sorted.map((p) => {
        const u = getUser(p.userId);
        const liked = p.likes.includes("me");
        return (
          <article key={p.id} className="fade-up flex gap-3 border-b px-5 py-4 transition-colors hover:bg-card/50">
            <Avatar user={u} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2 text-sm">
                <span className="font-semibold">{u?.name}</span>
                <span className="text-muted-foreground">@{u?.handle} · {timeAgo(p.createdAt)}</span>
              </div>
              {p.text && <p className="mt-1 whitespace-pre-wrap leading-relaxed">{p.text}</p>}
              {p.image && <img src={p.image} alt="" className="mt-3 max-h-96 w-full rounded-xl border object-cover" />}
              <button
                onClick={() => toggleLike(p.id)}
                className={`mt-3 flex items-center gap-1.5 text-sm transition ${liked ? "text-destructive" : "text-muted-foreground hover:text-destructive"}`}
              >
                <Heart size={18} className={`transition-transform ${liked ? "scale-110 fill-current" : ""}`} /> {p.likes.length}
              </button>
            </div>
          </article>
        );
      })}
    </AppShell>
  );
}
