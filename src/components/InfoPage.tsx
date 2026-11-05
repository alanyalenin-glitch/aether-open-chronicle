import { Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import type { ReactNode } from "react";

/** Marco común de las páginas informativas de Luna (visibles sin cuenta). */
export function InfoPage({ title, kicker, children }: { title: string; kicker?: string; children: ReactNode }) {
  return (
    <div className="aurora min-h-screen">
      <header className="glass border-b">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link to="/" className="font-display text-3xl font-light tracking-[0.12em] text-foreground">LUNA</Link>
          <Link to="/feed" className="text-sm text-muted-foreground transition hover:text-foreground">Volver al muro</Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8">
        <p className="text-xs uppercase tracking-wider text-primary">{kicker}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        {children}
        <nav className="mt-10 flex flex-wrap gap-2 border-t pt-6 text-sm">
          <Link to="/filosofia" className="rounded-full border px-4 py-1.5 transition hover:bg-secondary">Filosofía de contenido</Link>
          <Link to="/sin-publicidad" className="rounded-full border px-4 py-1.5 transition hover:bg-secondary">Cero publicidad</Link>
          <Link to="/" className="rounded-full border px-4 py-1.5 transition hover:bg-secondary">Crear cuenta</Link>
        </nav>
      </main>
    </div>
  );
}

export function RuleList({ tone, items }: { tone: "yes" | "no"; items: readonly string[] }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2.5 rounded-xl border bg-secondary/40 px-3 py-2.5 text-sm">
          <span className={`mt-0.5 shrink-0 ${tone === "yes" ? "text-primary" : "text-destructive"}`}>
            {tone === "yes" ? <Check size={16} /> : <X size={16} />}
          </span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
