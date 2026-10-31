import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Avatar } from "@/components/AppShell";
import { timeAgo, useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Perfil — Aether" },
      { name: "description", content: "Personaliza tu perfil en Aether." },
      { property: "og:title", content: "Perfil — Aether" },
      { property: "og:description", content: "Tu perfil personalizado en Aether." },
    ],
  }),
  component: Profile,
});

const hues = [185, 240, 300, 20, 60, 140];

function Profile() {
  const { me, posts, updateMe } = useStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  if (!me) return <AppShell title="Perfil">{null}</AppShell>;
  const mine = posts.filter((p) => p.userId === "me");

  return (
    <AppShell title="Perfil">
      <div className="h-32 bg-aether opacity-70" style={{ filter: `hue-rotate(${me.hue - 185}deg)` }} />
      <div className="px-5">
        <div className="-mt-10 flex items-end justify-between">
          <div className="rounded-full border-4 border-background">
            <Avatar user={me} size={84} />
          </div>
          <button
            onClick={() => { setName(me.name); setBio(me.bio); setEditing(!editing); }}
            className="rounded-full border px-4 py-1.5 text-sm font-medium transition hover:bg-secondary"
          >
            {editing ? "Cancelar" : "Editar perfil"}
          </button>
        </div>
        {editing ? (
          <div className="fade-up mt-4 space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border bg-input px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring" />
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="w-full resize-none rounded-xl border bg-input px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring" />
            <div className="flex gap-2">
              {hues.map((h) => (
                <button
                  key={h}
                  onClick={() => updateMe({ hue: h })}
                  className={`h-8 w-8 rounded-full transition ${me.hue === h ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : ""}`}
                  style={{ background: `oklch(0.78 0.13 ${h})` }}
                  aria-label="Color"
                />
              ))}
            </div>
            <button
              onClick={() => { updateMe({ name: name || me.name, bio }); setEditing(false); }}
              className="bg-aether rounded-full px-5 py-2 text-sm font-semibold text-primary-foreground"
            >
              Guardar
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <h2 className="text-xl font-semibold">{me.name}</h2>
            <p className="text-sm text-muted-foreground">@{me.handle}</p>
            <p className="mt-3">{me.bio}</p>
            <p className="mt-3 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{mine.length}</span> publicaciones</p>
          </div>
        )}
      </div>
      <div className="mt-6 border-t">
        {mine.length === 0 && <p className="p-8 text-center text-muted-foreground">Aún no has publicado nada.</p>}
        {mine.map((p) => (
          <article key={p.id} className="border-b px-5 py-4">
            <p className="text-xs text-muted-foreground">{timeAgo(p.createdAt)}</p>
            {p.text && <p className="mt-1">{p.text}</p>}
            {p.image && <img src={p.image} alt="" className="mt-2 max-h-80 w-full rounded-xl object-cover" />}
          </article>
        ))}
      </div>
    </AppShell>
  );
}
