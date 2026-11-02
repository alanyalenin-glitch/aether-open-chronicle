import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luna — Una red social sin algoritmos" },
      { name: "description", content: "Luna: red social minimalista con muro cronológico, perfiles y mensajes." },
      { property: "og:title", content: "Luna — Una red social sin algoritmos" },
      { property: "og:description", content: "Muro cronológico, perfiles personalizados y mensajes directos." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login(name.trim() || email.split("@")[0] || "Invitado");
      navigate({ to: "/feed" });
    }, 600);
  };

  return (
    <div className="aurora flex min-h-screen items-center justify-center px-6">
      <div className="fade-up w-full max-w-sm">
        <h1 className="text-center text-6xl font-bold text-luna">Luna</h1>
        <p className="mt-3 text-center text-muted-foreground">
          Personas, no algoritmos. Tu muro, en orden cronológico.
        </p>
        <form onSubmit={submit} className="glass mt-10 space-y-3 rounded-2xl border p-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-xl border bg-input px-4 py-3 outline-none transition focus:ring-2 focus:ring-ring"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="w-full rounded-xl border bg-input px-4 py-3 outline-none transition focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full rounded-xl border bg-input px-4 py-3 outline-none transition focus:ring-2 focus:ring-ring"
          />
          <button
            disabled={loading}
            className="bg-luna w-full rounded-xl py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
          <p className="pt-1 text-center text-xs text-muted-foreground">Inicio de sesión simulado · cualquier dato funciona</p>
        </form>
      </div>
    </div>
  );
}
