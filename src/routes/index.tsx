import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import "@lovable.dev/cloud-auth-js/styles.css";
import { useAccount } from "@/lib/account";
import { completeRegistration } from "@/lib/account.functions";
import { registrationSchema, emailSchema, passwordSchema } from "@/lib/account-schema";
import { ZODIAC, publicName, zodiacFor } from "@/lib/identity";
import { FaceVerify } from "@/components/FaceVerify";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({ head: () => ({ meta: [
  { title: "Luna — Personas, no algoritmos" }, { name: "description", content: "Luna: música, videos, comunidades y publicaciones legítimas sin publicidad." },
  { property: "og:title", content: "Luna — Personas, no algoritmos" }, { property: "og:description", content: "Tu comunidad sin publicidad, con cuentas y datos privados protegidos." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
]}), component: Welcome });
const field = "w-full rounded-lg border bg-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring";
function Welcome() {
  const account = useAccount();
  const navigate = useNavigate();
  const complete = useServerFn(completeRegistration);
  const [mode, setMode] = useState<"register" | "login">("register");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", birthDate: "", zodiac: "" });
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const onVerified = useCallback(() => setVerified(true), []);
  useEffect(() => { if (account.user && account.privateInfo) void navigate({ to: "/feed" }); }, [account.user, account.privateInfo]);
  const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value, ...(key === "birthDate" ? { zodiac: zodiacFor(value) } : {}) }));
  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(""); setNotice("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password });
    if (authError) setError("Correo o contraseña incorrectos, o correo aún sin confirmar.");
    else { await account.refresh(); }
    setBusy(false);
  };
  const next = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const values = registrationSchema.safeParse({ ...form, simulationCompleted: true });
    if (!values.success) { setError(values.error.issues[0]?.message ?? "Revisa tus datos"); return; }
    if (!account.user) {
      const email = emailSchema.safeParse(form.email); const password = passwordSchema.safeParse(form.password);
      if (!email.success || !password.success) { setError(!email.success ? "Correo no válido" : "La contraseña debe tener al menos 8 caracteres"); return; }
    }
    setStep(2);
  };
  const finish = async () => {
    if (!verified || busy) return;
    setBusy(true); setError("");
    try {
      if (!account.user) {
        const result = await supabase.auth.signUp({ email: form.email.trim(), password: form.password, options: { emailRedirectTo: window.location.origin } });
        if (result.error) throw new Error("No se pudo crear la cuenta. Revisa los datos o inicia sesión si ya tienes cuenta.");
        if (!result.data.session) { setNotice("Confirma tu correo y vuelve a iniciar sesión. Después podrás guardar tus datos privados y completar el registro."); setStep(1); setMode("login"); setVerified(false); return; }
      }
      await complete({ data: { fullName: form.fullName, birthDate: form.birthDate, zodiac: form.zodiac, simulationCompleted: true } });
      await account.refresh(); await navigate({ to: "/feed" });
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo completar el registro."); }
    finally { setBusy(false); }
  };
  const social = async (provider: "google" | "lovable") => {
    setBusy(true); setError("");
    try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin }); if (result.error) setError("No se pudo iniciar sesión."); else if (!result.redirected) await account.refresh(); }
    catch { setError("No se pudo conectar. Inténtalo de nuevo."); } finally { setBusy(false); }
  };
  const reset = async () => {
    if (!emailSchema.safeParse(form.email).success) { setError("Escribe tu correo para recuperar la contraseña."); return; }
    setBusy(true); const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    setNotice(error ? "No se pudo enviar el correo. Inténtalo más tarde." : "Revisa tu correo para restablecer la contraseña."); setBusy(false);
  };
  return <div className="flex min-h-screen items-center justify-center bg-background px-5 py-8"><div className="w-full max-w-sm">
    <h1 className="text-center text-5xl font-semibold text-primary">Luna</h1><p className="mt-3 text-center text-muted-foreground">Personas, no algoritmos.</p>
    <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">Videos, música y publicaciones legítimas para disfrutar sanamente. Prohibidos la publicidad, anuncios patrocinados, influencers corporativos y promociones comerciales. <Link to="/filosofia" className="text-primary">Filosofía de contenido</Link> · <Link to="/sin-publicidad" className="text-primary">Cero publicidad</Link></p>
    {account.loading && <p role="status" className="mt-4 text-center">Cargando cuenta…</p>}
    {account.error && <Button onClick={() => account.refresh()} variant="outline" className="mt-4 w-full">Reintentar cuenta</Button>}
    {notice && <p role="status" className="mt-4 rounded-lg border p-3 text-sm text-primary">{notice}</p>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {account.user && <div className="mt-4 text-center text-sm"><p>Completa tu registro privado</p><Button variant="link" onClick={() => account.signOut()}>Salir</Button></div>}
    {!account.user && mode === "login" ? <form onSubmit={signIn} className="mt-6 space-y-3">
      <input required type="email" autoComplete="email" aria-label="Correo electrónico" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Correo electrónico" className={field} />
      <input required type="password" autoComplete="current-password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Contraseña" className={field} />
      <Button disabled={busy} className="w-full" type="submit">{busy ? "Entrando…" : "Entrar"}</Button>
      <Button disabled={busy} variant="link" type="button" onClick={reset}>Olvidé mi contraseña</Button>
      <Button variant="ghost" className="w-full" type="button" onClick={() => { setMode("register"); setError(""); }}>Crear cuenta</Button>
    </form> : step === 1 ? <form onSubmit={next} className="mt-6 space-y-3">
      <input required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Nombre completo" autoComplete="name" className={field} />
      {!account.user && <><input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Correo electrónico" className={field} /><input required type="password" minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Contraseña" autoComplete="new-password" className={field} /></>}
      <label className="block text-xs text-muted-foreground">Fecha de nacimiento<input required type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} className={`${field} mt-1 [color-scheme:dark]`} /></label>
      <select required aria-label="Signo zodiacal" value={form.zodiac} onChange={(e) => set("zodiac", e.target.value)} className={field}><option value="">Signo zodiacal</option>{ZODIAC.map((sign) => <option key={sign}>{sign}</option>)}</select>
      {form.fullName.trim().includes(" ") && <p className="text-xs text-muted-foreground">Nombre público: {publicName(form.fullName)}. El resto es privado.</p>}
      <Button type="submit" className="w-full" disabled={busy || account.loading}>Continuar</Button>
      {!account.user && <Button type="button" variant="ghost" className="w-full" onClick={() => { setMode("login"); setError(""); }}>Ya tengo cuenta</Button>}
    </form> : <div className="mt-6 space-y-3"><FaceVerify verified={verified} onVerified={onVerified} /><Button disabled={!verified || busy} onClick={finish} className="w-full">{busy ? "Guardando…" : "Completar registro"}</Button><Button variant="ghost" onClick={() => { setStep(1); setVerified(false); }}>Volver</Button></div>}
    {!account.user && <div className="mt-4 space-y-2"><Button variant="outline" disabled={busy} onClick={() => social("google")} className="google-auth w-full"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Continuar con Google</Button><Button disabled={busy} className="lovable-auth-button w-full" onClick={() => social("lovable")}>Continue with Lovable</Button></div>}
    <div className="mt-5 flex justify-center gap-4 text-xs text-primary"><Link to="/feed">Ver publicaciones</Link><Link to="/grupos">Grupos públicos</Link><Link to="/videos">Videos y reels</Link></div>
  </div></div>;
}
