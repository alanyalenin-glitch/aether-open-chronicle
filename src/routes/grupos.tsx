import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { publicGroups } from "@/lib/catalog";

export const Route = createFileRoute("/grupos")({
  head: () => ({
    meta: [
      { title: "Grupos públicos — Luna" },
      { name: "description", content: "Grupos públicos de Luna: temas, personas y publicaciones legítimas, sin publicidad." },
      { property: "og:title", content: "Grupos públicos — Luna" },
      { property: "og:description", content: "Entra a un grupo público y comparte con las personas de Luna." },
    ],
  }),
  component: Grupos,
});

function Grupos() {
  const { me } = useStoreMe();
  const [joined, setJoined] = useState<string[]>([]);
  const toggle = (id: string) =>
    setJoined((j) => (j.includes(id) ? j.filter((x) => x !== id) : [...j, id]));

  return (
    <AppShell title="Grupos públicos">
      <h2 className="text-xl font-semibold">Grupos públicos</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Cualquiera puede verlos y entrar. Se comparte contenido legítimo: fotos, videos, música.
        Nada de publicidad ni promociones.{" "}
        <Link to="/sin-publicidad" className="text-primary underline-offset-4 hover:underline">
          Cero publicidad
        </Link>
      </p>

      <ul className="mt-5 space-y-3">
        {publicGroups.map((g) => {
          const in_ = joined.includes(g.id);
          return (
            <li key={g.id} className="fade-up flex items-center gap-3 rounded-2xl border bg-card p-4">
              <span
                className="h-11 w-11 shrink-0"
                style={{
                  clipPath: "polygon(50% 0,100% 100%,0 100%)",
                  background: `linear-gradient(160deg, oklch(0.8 0.12 ${g.hue}), oklch(0.4 0.1 ${g.hue + 40}))`,
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{g.name}</p>
                <p className="truncate text-xs text-muted-foreground">{g.topic}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Users size={12} /> {g.members + (in_ ? 1 : 0)} miembros
                </p>
              </div>
              <button
                onClick={() => toggle(g.id)}
                aria-pressed={in_}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition active:scale-95 ${
                  in_ ? "border text-muted-foreground" : "bg-luna text-primary-foreground"
                }`}
              >
                {in_ ? "Saliendo" : "Unirme"}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-xs text-muted-foreground">
        Estás viendo los grupos como {me?.name ?? "invitado"}. Tus datos privados no aparecen aquí.
      </p>
    </AppShell>
  );
}

import { useStore } from "@/lib/store";
function useStoreMe() {
  return useStore();
}
