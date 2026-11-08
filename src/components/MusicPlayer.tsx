import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { Play, Pause, SkipBack, SkipForward, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { tracks } from "@/lib/catalog";

type MusicContext = { selected: number; playing: boolean; started: boolean; error: string; playTrack: (index: number) => Promise<void>; setOpen: (open: boolean) => void; seek: (seconds: number) => void; time: number; duration: number; stop: () => void };
const Music = createContext<MusicContext | null>(null);
export function MusicProvider({ children }: { children: ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(20);
  const playTrack = async (index: number) => {
    const player = audio.current;
    if (!player || !tracks[index]) return;
    setError(""); setStarted(true);
    if (index === selected && !player.paused) { player.pause(); return; }
    if (index !== selected || !player.getAttribute("src")) { setSelected(index); player.src = `/audio/luna-muestra-${index + 1}.wav`; player.load(); }
    try { await player.play(); } catch { setError("No se pudo reproducir el audio. Inténtalo de nuevo."); }
  };
  const seek = (seconds: number) => { if (audio.current) audio.current.currentTime = seconds; };
  const stop = () => { audio.current?.pause(); setStarted(false); };
  return <Music.Provider value={{ selected, playing, started, error, playTrack, setOpen, time, duration, seek, stop }}>
    <audio ref={audio} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} onEnded={() => { void playTrack((selected + 1) % tracks.length); }} onError={() => { setPlaying(false); setError("No se pudo cargar el audio."); }} />
    {children}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="w-[calc(100%-1.5rem)] rounded-lg"><DialogTitle className="flex items-center gap-2"><Headphones size={18} /> Música</DialogTitle><DialogDescription>Audios de muestra · Luna</DialogDescription><MusicControls /><TrackList /></DialogContent></Dialog>
  </Music.Provider>;
}
export function useMusic() { const music = useContext(Music); if (!music) throw new Error("MusicProvider missing"); return music; }
export function MusicControls() {
  const { selected, playing, playTrack, time, duration, seek, error } = useMusic();
  const track = tracks[selected];
  return <section aria-label="Reproductor de música" className="border-y py-4">
    <p className="text-xs text-primary">{playing ? "Reproduciendo" : "En pausa"}</p><h3 className="mt-1 font-semibold">{track?.title}</h3><p className="text-sm text-muted-foreground">{track?.artist}</p>
    <div className="mt-3 flex justify-center gap-3"><Button size="icon" variant="ghost" aria-label="Pista anterior" onClick={() => playTrack((selected + tracks.length - 1) % tracks.length)}><SkipBack /></Button><Button size="icon" aria-label={playing ? "Pausar música" : "Reproducir música"} onClick={() => playTrack(selected)}>{playing ? <Pause /> : <Play />}</Button><Button size="icon" variant="ghost" aria-label="Pista siguiente" onClick={() => playTrack((selected + 1) % tracks.length)}><SkipForward /></Button></div>
    <input type="range" aria-label="Posición del audio" min={0} max={duration || 20} step={0.1} value={time} onChange={(e) => seek(Number(e.target.value))} className="mt-4 w-full accent-primary" /><p className="text-right text-xs tabular-nums text-muted-foreground">{Math.floor(time)} / {Math.floor(duration)} s</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}
export function TrackList() { const { selected, playing, playTrack } = useMusic(); return <ul className="space-y-2">{tracks.map((track, index) => <li key={track.id} className="flex items-center gap-3 rounded-lg border bg-card p-3"><Button variant="secondary" size="icon" aria-label={`${selected === index && playing ? "Pausar" : "Reproducir"} ${track.title}`} onClick={() => playTrack(index)}>{selected === index && playing ? <Pause /> : <Play />}</Button><div className="min-w-0 flex-1"><p className="truncate font-medium">{track.title}</p><p className="truncate text-xs text-muted-foreground">{track.artist}</p></div><span className="text-xs text-muted-foreground">0:20</span></li>)}</ul>; }