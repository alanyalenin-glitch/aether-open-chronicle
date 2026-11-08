import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { passwordSchema } from "@/lib/account-schema";
export const Route = createFileRoute("/reset-password")({ head: () => ({ meta: [{ title: "Restablecer contraseña — Luna" }, { name: "description", content: "Recupera el acceso a tu cuenta Luna." }, { property: "og:title", content: "Restablecer contraseña — Luna" }, { property: "og:description", content: "Recuperación segura de tu cuenta Luna." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }), component: Reset });
function Reset() {
 const [password, setPassword] = useState(""); const [ready, setReady] = useState(false); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
 useEffect(() => { setReady(window.location.hash.includes("type=recovery") || new URLSearchParams(window.location.search).get("type") === "recovery"); }, []);
 return <main className="mx-auto max-w-sm px-5 py-16"><h1 className="text-xl font-semibold">Restablecer contraseña</h1>{ready ? <form className="mt-5 space-y-3" onSubmit={async (e) => { e.preventDefault(); if (!passwordSchema.safeParse(password).success) { setMessage("Usa al menos 8 caracteres."); return; } setBusy(true); const { error } = await supabase.auth.updateUser({ password }); setMessage(error ? "El enlace ha caducado o la contraseña no es válida." : "Contraseña actualizada."); setBusy(false); }}><input type="password" aria-label="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border bg-input p-3" /><Button disabled={busy}>Guardar contraseña</Button></form> : <p className="mt-4 text-sm text-muted-foreground">Abre el enlace de recuperación que recibiste por correo.</p>}<p role="status" className="mt-4">{message}</p><Link to="/" className="mt-4 block text-primary">Volver a Luna</Link></main>;
}
