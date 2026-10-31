import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, MessageCircle, User as UserIcon, LogOut } from "lucide-react";
import { useStore, type User } from "@/lib/store";

export function Avatar({ user, size = 40 }: { user?: User; size?: number }) {
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
  { to: "/feed", label: "Muro", icon: Home },
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
      <div className="mx-auto flex max-w-5xl">
        <aside className="sticky top-0 hidden h-screen w-60 flex-col gap-2 border-r p-6 md:flex">
          <Link to="/feed" className="mb-6 font-display text-2xl font-bold text-aether">Aether</Link>
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary !text-foreground" }}
            >
              <Icon size={20} /> {label}
            </Link>
          ))}
          <button
            onClick={() => { logout(); navigate({ to: "/" }); }}
            className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-colors hover:text-destructive"
          >
            <LogOut size={20} /> Salir
          </button>
        </aside>
        <main className="min-h-screen flex-1 pb-24 md:pb-0">
          <header className="glass sticky top-0 z-10 flex items-center justify-between border-b px-5 py-4">
            <h1 className="text-lg font-semibold">{title}</h1>
            <span className="font-display font-bold text-aether md:hidden">Aether</span>
          </header>
          <div className="mx-auto max-w-xl">{children}</div>
        </main>
      </div>
      <nav className="glass fixed inset-x-0 bottom-0 z-20 flex justify-around border-t py-3 md:hidden">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-1 text-xs text-muted-foreground transition-colors"
            activeProps={{ className: "!text-primary" }}
          >
            <Icon size={22} /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
