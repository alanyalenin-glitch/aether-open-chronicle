import { useEffect, useRef, useState } from "react";
import { Camera, FileText, Image as ImageIcon, Mic, Music, Paperclip, Pause, Phone, PhoneOff, Play, Square, Video, VideoOff, X } from "lucide-react";
import type { Attachment, User } from "@/lib/store";
import { Avatar } from "@/components/AppShell";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const kb = (n?: number) => (n ? (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.ceil(n / 1e3)} KB`) : "");

/** Reads an image and downsizes it so it fits in local storage. */
function imageToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 900 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * scale; c.height = img.height * scale;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      res(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = rej;
    img.src = URL.createObjectURL(file);
  });
}

export function Composer({ onSend }: { onSend: (text: string, a?: Attachment) => void }) {
  const [text, setText] = useState("");
  const [menu, setMenu] = useState(false);
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const imgRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const camRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>, kind: Attachment["kind"]) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    setMenu(false);
    if (!f) return;
    if (f.size > 20e6) return alert("El archivo supera 20 MB");
    if (kind === "image") onSend("", { kind, name: f.name, url: await imageToDataUrl(f), size: f.size });
    else onSend("", { kind, name: f.name, size: f.size });
  };

  const stopVoice = (send: boolean) => {
    setRecording(false);
    if (send) onSend("", { kind: "voice", name: "Nota de voz", duration: Math.max(1, secs) });
    setSecs(0);
  };

  const iconBtn = "rounded-full p-2.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground active:scale-95";

  return (
    <div className="sticky bottom-0">
      {menu && (
        <div className="glass fade-up mb-2 grid grid-cols-3 gap-2 rounded-2xl border p-3">
          {[
            { label: "Imagen", icon: ImageIcon, ref: imgRef },
            { label: "Música", icon: Music, ref: audioRef },
            { label: "Documento", icon: FileText, ref: docRef },
          ].map(({ label, icon: I, ref }) => (
            <button key={label} type="button" onClick={() => ref.current?.click()} className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-sm transition hover:bg-secondary">
              <span className="bg-luna rounded-full p-2.5 text-primary-foreground"><I size={18} /></span>
              {label}
            </button>
          ))}
        </div>
      )}
      <input ref={imgRef} type="file" accept="image/*" hidden onChange={(e) => pick(e, "image")} />
      <input ref={audioRef} type="file" accept="audio/*" hidden onChange={(e) => pick(e, "audio")} />
      <input ref={docRef} type="file" hidden onChange={(e) => pick(e, "file")} />
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e, "image")} />

      <form
        onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onSend(text.trim().slice(0, 2000)); setText(""); } }}
        className="glass flex items-center gap-1 rounded-2xl border p-2"
      >
        {recording ? (
          <>
            <button type="button" onClick={() => stopVoice(false)} className={iconBtn} aria-label="Cancelar nota de voz"><X size={20} /></button>
            <div className="flex flex-1 items-center gap-2 px-2 text-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-destructive" />
              Grabando… {fmt(secs)}
            </div>
            <button type="button" onClick={() => stopVoice(true)} className="bg-luna rounded-full p-3 text-primary-foreground" aria-label="Enviar nota de voz"><Square size={16} /></button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => setMenu(!menu)} className={`${iconBtn} ${menu ? "bg-secondary text-foreground" : ""}`} aria-label="Adjuntar"><Paperclip size={20} /></button>
            <button type="button" onClick={() => camRef.current?.click()} className={iconBtn} aria-label="Cámara"><Camera size={20} /></button>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje…" maxLength={2000} className="min-w-0 flex-1 rounded-full border bg-input px-4 py-2.5 outline-none focus:ring-2 focus:ring-ring" />
            {text.trim() ? (
              <button className="bg-luna rounded-full p-3 text-primary-foreground transition active:scale-95" aria-label="Enviar"><SendIcon /></button>
            ) : (
              <button type="button" onClick={() => setRecording(true)} className={iconBtn} aria-label="Nota de voz"><Mic size={20} /></button>
            )}
          </>
        )}
      </form>
    </div>
  );
}

function SendIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>;
}

export function AttachmentView({ a, mine }: { a: Attachment; mine: boolean }) {
  if (a.kind === "image" && a.url) return <img src={a.url} alt={a.name} className="max-h-64 rounded-xl object-cover" />;
  if (a.kind === "voice") return <VoiceNote duration={a.duration ?? 1} mine={mine} />;
  const I = a.kind === "audio" ? Music : FileText;
  return (
    <div className="flex items-center gap-3">
      <span className={`rounded-lg p-2 ${mine ? "bg-background/20" : "bg-background/40"}`}><I size={20} /></span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{a.name}</p>
        <p className="text-xs opacity-70">{a.kind === "audio" ? "Música" : "Documento"} {kb(a.size) && `· ${kb(a.size)}`}</p>
      </div>
    </div>
  );
}

function VoiceNote({ duration, mine }: { duration: number; mine: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!playing) return;
    const i = setInterval(() => setT((x) => (x + 0.1 >= duration ? (setPlaying(false), 0) : x + 0.1)), 100);
    return () => clearInterval(i);
  }, [playing, duration]);
  const bars = [4, 9, 6, 12, 8, 14, 7, 10, 5, 11, 6, 9, 4, 8];
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => setPlaying(!playing)} className={`rounded-full p-2 ${mine ? "bg-background/20" : "bg-background/40"}`} aria-label={playing ? "Pausar" : "Reproducir"}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div className="flex items-center gap-0.5">
        {bars.map((h, i) => (
          <span key={i} className="w-1 rounded-full bg-current transition-opacity" style={{ height: h * 1.5, opacity: i / bars.length <= t / duration ? 1 : 0.4 }} />
        ))}
      </div>
      <span className="text-xs opacity-80">{fmt(playing ? t : duration)}</span>
    </div>
  );
}

export function CallOverlay({ user, video, onEnd }: { user: User | undefined; video: boolean; onEnd: () => void }) {
  const [secs, setSecs] = useState(0);
  const [connected, setConnected] = useState(false);
  const [camOn, setCamOn] = useState(video);
  useEffect(() => {
    const c = setTimeout(() => setConnected(true), 2200);
    return () => clearTimeout(c);
  }, []);
  useEffect(() => {
    if (!connected) return;
    const i = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [connected]);
  return (
    <div className="aurora fade-up fixed inset-0 z-50 flex flex-col items-center justify-between bg-background/95 px-6 py-16 backdrop-blur">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{video ? "Videollamada" : "Llamada de voz"} · simulada</p>
        <h2 className="mt-2 text-2xl font-semibold">{user?.name}</h2>
        <p className="mt-1 text-muted-foreground">{connected ? fmt(secs) : "Llamando…"}</p>
      </div>
      <div className={connected ? "" : "animate-pulse"}><Avatar user={user} size={128} /></div>
      <div className="flex gap-5">
        {video && (
          <button onClick={() => setCamOn(!camOn)} className="rounded-full bg-secondary p-4 transition hover:opacity-80" aria-label="Cámara">
            {camOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
        )}
        <button onClick={onEnd} className="rounded-full bg-destructive p-4 text-destructive-foreground transition hover:opacity-90 active:scale-95" aria-label="Colgar">
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}

export { Phone, Video };
