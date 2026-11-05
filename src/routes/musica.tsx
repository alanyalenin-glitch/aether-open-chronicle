import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, Play, Pause } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { tracks } from "@/lib/catalog";

export const Route = createFileRoute("/musica")({
  head: () => ({
    meta: [
      { title: "Música — Luna" },
      { name: "description", content: "Música compartida por los miembros de Luna. Sin anuncios, sin promociones." },
      { property: "og:title", content: "Música — Luna" },
      { property: "og:description", content: "Música legítima de la comunidad, sin publicidad." },
    ],
  }),
  component: Musica,
});

function Musica() {
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <AppShell title="Música">
      <h2 className="text-xl font-semibold">Música</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Grabaciones y canciones que comparten las personas de Luna, para disfrutar sanamente.
        Aquí no suena publicidad.{" "}
        <Link to="/filosofia" className="text-primary underline-offset-4 hover:underline">
          Filosofía de contenido
        </Link>
      </p>

      <ul className="mt-5 space-y-2">
        {tracks.map((t) => {
          const on = playing === t.id;
          return (
            <li key={t.id} className={`fade-up flex items-center gap-3 rounded-2xl border p-3 transition ${on ? "bg-secondary" : "bg-card"}`}>
              <button
                onClick={() => setPlaying(on ? null : t.id)}
                aria-pressed={on}
                aria-label={on ? `Pausar ${t.title}` : `Reproducir ${t.title}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary-foreground transition active:scale-90"
                style={{ background: `linear-gradient(135deg, oklch(0.8 0.12 ${t.hue}), oklch(0.5 0.12 ${t.hue + 40}))` }}
              >
                {on ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{t.length}</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Music size={13} /> Reproducción simulada: sirve para mostrar cómo se organiza la música en Luna.
      </p>
    </AppShell>
  );
}
