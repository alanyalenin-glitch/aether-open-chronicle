import { createFileRoute } from "@tanstack/react-router";
import { MusicControls, TrackList } from "@/components/MusicPlayer";
import { AppShell } from "@/components/AppShell";


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
  return <AppShell title="Música"><h2 className="text-xl font-semibold">Música</h2><p className="my-3 text-sm text-muted-foreground">Audios de muestra originales, sin publicidad.</p><MusicControls /><div className="mt-4"><TrackList /></div></AppShell>;
}
