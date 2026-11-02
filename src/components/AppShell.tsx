import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, MessageCircle, User as UserIcon, LogOut } from "lucide-react";
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
    <div className="aurora min-h-screen">
      <header className="glass fixed inset-x-0 top-0 z-30 border-b">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <Link to="/feed" className="font-display text-xl font-bold text-luna">Luna</Link>
          <nav className="flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                aria-label={label}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary !text-primary" }}
              >
                <Icon size={19} /> <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              aria-label="Salir"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
            >
              <LogOut size={18} />
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-10 pt-20">
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>
    </div>
  );
}
