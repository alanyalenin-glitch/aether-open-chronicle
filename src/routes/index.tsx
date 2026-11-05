import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { z } from "zod";
import { useStore } from "@/lib/store";
import { ZODIAC, publicName, zodiacFor } from "@/lib/identity";
import { FaceVerify } from "@/components/FaceVerify";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luna — Una red social sin algoritmos" },
      { name: "description", content: "Luna: red social minimalista con muro cronológico, perfiles y mensajes." },
      { property: "og:title", content: "Luna — Una red social sin algoritmos" },
      { property: "og:description", content: "Muro cronológico, perfiles personalizados y mensajes directos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Welcome,
});

const schema = z.object({
  fullName: z.string().trim().min(3, "Escribe tu nombre completo").max(100).refine((v) => v.split(/\s+/).length >= 2, "Incluye al menos un nombre y un apellido"),
  email: z.string().trim().email("Correo no válido").max(255),
  birthDate: z.string().min(1, "Indica tu fecha de nacimiento").refine((v) => new Date(v) < new Date(), "Fecha no válida"),
  zodiac: z.enum(ZODIAC, { message: "Elige tu signo" }),
});

const field = "w-full rounded-xl border bg-input px-4 py-3 outline-none transition focus:ring-2 focus:ring-ring";

function Welcome() {
  const { login, register } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({ fullName: "", email: "", birthDate: "", zodiac: "" });
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const [loginName, setLoginName] = useState("");
  const onVerified = useCallback(() => setVerified(true), []);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v, ...(k === "birthDate" && !f.zodiac ? { zodiac: zodiacFor(v) } : {}) }));

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) return setError(r.error.issues[0]?.message ?? "Revisa los datos");
    setError("");
    setStep(2);
  };

  const finish = () => {
    const r = schema.parse(form);
    register({ ...r, faceVerified: true, verifiedAt: Date.now() });
    navigate({ to: "/feed" });
  };

  return (
    <div className="aurora flex min-h-screen items-center justify-center px-6 py-10">
      <div className="fade-up w-full max-w-sm">
        <h1 className="text-center text-6xl font-bold text-luna">Luna</h1>
        <p className="mt-3 text-center text-muted-foreground">Personas, no algoritmos. Tu muro, en orden cronológico.</p>

        <p className="glass mt-4 rounded-2xl border p-3 text-center text-xs leading-relaxed text-muted-foreground">
          En Luna caben todos los videos, la música y las publicaciones legítimas de sus miembros,
          para disfrutar sanamente. La publicidad, los anuncios patrocinados, el contenido de
          influencers corporativos y las promociones comerciales están prohibidos.{" "}
          <Link to="/filosofia" className="text-primary underline-offset-4 hover:underline">Filosofía de contenido</Link>
          {" · "}
          <Link to="/sin-publicidad" className="text-primary underline-offset-4 hover:underline">Cero publicidad</Link>
        </p>

        {mode === "login" ? (
          <form
            onSubmit={(e) => { e.preventDefault(); login(loginName.trim() || "Invitado"); navigate({ to: "/feed" }); }}
            className="glass mt-8 space-y-3 rounded-2xl border p-6"
          >
            <input value={loginName} onChange={(e) => setLoginName(e.target.value)} placeholder="Tu nombre" className={field} />
            <input type="password" placeholder="Contraseña" className={field} />
            <button className="bg-luna w-full rounded-xl py-3 font-semibold text-primary-foreground transition hover:opacity-90">Entrar</button>
            <button type="button" onClick={() => setMode("register")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
              ¿Nuevo en Luna? Crea tu cuenta
            </button>
          </form>
        ) : step === 1 ? (
          <form onSubmit={next} className="glass mt-8 space-y-3 rounded-2xl border p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Paso 1 de 2 · Tus datos</p>
            <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Nombre completo" maxLength={100} className={field} />
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="correo@ejemplo.com" maxLength={255} className={field} />
            <label className="block text-xs text-muted-foreground">
              Fecha de nacimiento
              <input type="date" value={form.birthDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set("birthDate", e.target.value)} className={`${field} mt-1 [color-scheme:dark]`} />
            </label>
            <select value={form.zodiac} onChange={(e) => set("zodiac", e.target.value)} className={field}>
              <option value="">Signo zodiacal</option>
              {ZODIAC.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            {form.fullName.trim().includes(" ") && (
              <p className="text-xs text-muted-foreground">Se mostrará públicamente como <span className="text-foreground">{publicName(form.fullName)}</span>. El resto de tus datos es privado.</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button className="bg-luna w-full rounded-xl py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]">Continuar</button>
            <button type="button" onClick={() => setMode("login")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
              Ya tengo cuenta
            </button>
          </form>
        ) : (
          <div className="glass fade-up mt-8 space-y-4 rounded-2xl border p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Paso 2 de 2 · Verifica tu identidad</p>
            <FaceVerify verified={verified} onVerified={onVerified} />
            <button
              disabled={!verified}
              onClick={finish}
              className="bg-luna w-full rounded-xl py-3 font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              Completar registro
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}
