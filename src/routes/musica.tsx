import { createFileRoute, Link } from "@tanstack/react-router";
import { Music, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { tracks } from "@/lib/catalog";

export const Route = createFileRoute("/musica")({
  head: () => ({
    meta: [
      { title: "Música — Luna" },
      { name: "description", content: "Música compartida por los miembros de Luna. Sin anuncios, sin promociones." },
      { property: "og:title", content: "Música — Luna" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:description", content: "Música legítima de la comunidad, sin publicidad." },
    ],
  }),
  component: Musica,
});

function Musica() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const audio = useRef<HTMLAudioElement>(null);
  const current = tracks[selected];
  const playTrack = async (index: number) => {
    const player = audio.current;
    if (!player) return;
    setError("");
    if (index === selected && !player.paused) { player.pause(); return; }
    if (index !== selected) { setSelected(index); player.src = `/audio/luna-muestra-${index + 1}.wav`; player.load(); }
    try { await player.play(); } catch { setError("No se pudo reproducir el audio. Inténtalo de nuevo."); }
  };

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

      <section className="mt-5 border-y py-4" aria-label="Reproductor de música">
        <p className="text-xs font-semibold text-primary">{playing ? "Reproduciendo" : "En pausa"}</p>
        <h3 className="mt-1 font-semibold">{current?.title}</h3>
        <p className="text-sm text-muted-foreground">{current?.artist} · Muestra de audio</p>
        <div className="mt-3 flex items-center justify-center gap-3">
          <Button size="icon" variant="ghost" aria-label="Pista anterior" title="Pista anterior" onClick={() => playTrack((selected + tracks.length - 1) % tracks.length)}><SkipBack /></Button>
          <Button size="icon" aria-label={playing ? "Pausar música" : "Reproducir música"} title={playing ? "Pausar" : "Reproducir"} onClick={() => playTrack(selected)}>{playing ? <Pause /> : <Play />}</Button>
          <Button size="icon" variant="ghost" aria-label="Pista siguiente" title="Pista siguiente" onClick={() => playTrack((selected + 1) % tracks.length)}><SkipForward /></Button>
        </div>
        <audio ref={audio} src="/audio/luna-muestra-1.wav" controls preload="metadata" className="mt-3 w-full" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setError("No se pudo cargar el audio.")} />
        {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      </section>
      <ul className="mt-5 space-y-2">
        {tracks.map((t, index) => {
          const on = selected === index && playing;
          return (
            <li key={t.id} className={`fade-up flex items-center gap-3 rounded-2xl border p-3 transition ${on ? "bg-secondary" : "bg-card"}`}>
              <Button variant={on ? "default" : "secondary"} size="icon"
                onClick={() => playTrack(index)}
                aria-pressed={on}
                aria-label={on ? `Pausar ${t.title}` : `Reproducir ${t.title}`}
                className="shrink-0 rounded-full"
              >
                {on ? <Pause size={17} /> : <Play size={17} className="ml-0.5" />}
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.title}</p>
                <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">0:20</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Music size={13} /> Audios de muestra originales; títulos y artistas de ejemplo.
      </p>
    </AppShell>
  );
}
