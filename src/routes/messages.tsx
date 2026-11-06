import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Phone, Video } from "lucide-react";
import { AttachmentView, CallOverlay, Composer } from "@/components/ChatTools";
import { AppShell, Avatar } from "@/components/AppShell";
import { timeAgo, useStore } from "@/lib/store";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Mensajes — Luna" },
      { name: "description", content: "Mensajes directos en Luna." },
      { property: "og:title", content: "Mensajes — Luna" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { property: "og:description", content: "Conversaciones privadas en Luna." },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { convos, getUser, sendMessage } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [call, setCall] = useState<null | "voice" | "video">(null);
  const endRef = useRef<HTMLDivElement>(null);
  const open = convos.find((c) => c.id === openId);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [open?.messages.length]);

  if (open) {
    const u = getUser(open.withId);
    return (
      <AppShell title="Mensajes">
        <div className="flex items-center gap-3 border-b px-5 py-3">
          <button onClick={() => setOpenId(null)} className="rounded-full p-1.5 transition hover:bg-secondary" aria-label="Volver"><ArrowLeft size={20} /></button>
          <Avatar user={u} size={34} />
          <span className="flex-1 font-semibold">{u?.name}</span>
          <button onClick={() => setCall("voice")} className="rounded-full p-2 transition hover:bg-secondary" aria-label="Llamar"><Phone size={20} /></button>
          <button onClick={() => setCall("video")} className="rounded-full p-2 transition hover:bg-secondary" aria-label="Videollamada"><Video size={20} /></button>
        </div>
        {call && <CallOverlay user={u} video={call === "video"} onEnd={() => setCall(null)} />}
        <div className="flex min-h-[55vh] flex-col gap-2 p-5">
          {open.messages.map((m, i) => (
            <div
              key={i}
              className={`fade-up max-w-[78%] rounded-2xl px-4 py-2.5 ${m.from === "me" ? "bg-luna self-end rounded-br-sm text-primary-foreground" : "self-start rounded-bl-sm bg-secondary"}`}
            >
              {m.attachment && <AttachmentView a={m.attachment} mine={m.from === "me"} />}
              {m.text}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <Composer onSend={(t, a) => sendMessage(open.id, t, a)} />
      </AppShell>
    );
  }

  return (
    <AppShell title="Mensajes">
      {convos.map((c) => {
        const u = getUser(c.withId);
        const last = c.messages[c.messages.length - 1];
        return (
          <button key={c.id} onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-3 border-b px-5 py-4 text-left transition-colors hover:bg-card/60">
            <Avatar user={u} size={46} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between">
                <span className="font-semibold">{u?.name}</span>
                {last && <span className="text-xs text-muted-foreground">{timeAgo(last.at)}</span>}
              </div>
              <p className="truncate text-sm text-muted-foreground">{last ? last.text || (last.attachment?.kind === "voice" ? "🎤 Nota de voz" : `📎 ${last.attachment?.name ?? ""}`) : "Inicia la conversación"}</p>
            </div>
          </button>
        );
      })}
    </AppShell>
  );
}
