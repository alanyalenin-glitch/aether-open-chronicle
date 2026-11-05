import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, MessageCircle, User as UserIcon, LogOut, Search, Headphones, Users, Bell } from "lucide-react";
import { useStore, type User } from "@/lib/store";

export function Avatar({ user, size = 40 }: { user?: User | undefined; size?: number }) {
  if (!user) return null;
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-display font-semibold text-primary-foreground"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, oklch(0.82 0.12 ${user.hue}), oklch(0.65 0.14 ${user.hue + 50}))`,
      }}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

const nav = [
  { to: "/feed", label: "Inicio", icon: Home },
  { to: "/messages", label: "Mensajes", icon: MessageCircle },
  { to: "/profile", label: "Perfil", icon: UserIcon },
] as const;

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { me, logout } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => {
      if (!me) navigate({ to: "/" });
    }, 50);
    return () => clearTimeout(t);
  }, [me, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="glass fixed inset-x-0 top-0 z-30 border-b">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link to="/feed" className="font-display text-3xl font-light tracking-[0.12em] text-foreground">LUNA</Link>
          <div className="flex items-center gap-1">
            <button aria-label="Buscar" className="rounded-full p-2 text-foreground/80 transition hover:bg-secondary"><Search size={21} /></button>
            <Link to="/musica" aria-label="Música" className="rounded-full p-2 text-primary transition hover:bg-secondary"><Headphones size={21} /></Link>
            <Link to="/grupos" aria-label="Grupos públicos" className="rounded-full p-2 text-primary transition hover:bg-secondary"><Users size={22} fill="currentColor" /></Link>
            <button onClick={() => { logout(); navigate({ to: "/" }); }} aria-label="Salir" className="rounded-full p-2 text-muted-foreground transition hover:text-destructive"><LogOut size={18} /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-3 pb-24 pt-16">
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-around">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} aria-label={label}
              className="relative flex h-full flex-1 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "!text-primary before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:bg-primary before:shadow-[0_0_10px_var(--primary)]" }}>
              <Icon size={23} />
            </Link>
          ))}
          <button aria-label="Notificaciones" className="relative flex h-full flex-1 items-center justify-center text-muted-foreground hover:text-foreground">
            <Bell size={23} /><span className="absolute right-[calc(50%-14px)] top-3 h-2.5 w-2.5 rounded-full bg-destructive" />
          </button>
        </div>
      </nav>
    </div>
  );
}
