import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Home, MessageCircle, User as UserIcon, LogOut, Search, Headphones, Users, Bell } from "lucide-react";
import { useStore, type User } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/lib/account";
import { useMusic } from "@/components/MusicPlayer";
import { Play, Pause, Clapperboard } from "lucide-react";
import { NotificationsPanel, SearchPanel } from "@/components/NavigationPanels";

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
  const { me } = useStore();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const account = useAccount();
  const music = useMusic();

  return (
    <div className="min-h-screen bg-background">
      <header className="glass fixed inset-x-0 top-0 z-30 border-b">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link to="/feed" className="font-display text-3xl font-light tracking-[0.12em] text-foreground">LUNA</Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" title="Buscar" aria-label="Buscar" onClick={() => setSearchOpen(true)} className="rounded-full text-foreground/80"><Search /></Button>
            <Button variant="ghost" size="icon" className="rounded-full text-primary" title="Música" aria-label="Música" onClick={() => music.setOpen(true)}><Headphones /></Button>
            <Button asChild variant="ghost" size="icon" className="rounded-full text-primary"><Link to="/grupos" title="Grupos públicos" aria-label="Grupos públicos"><Users /></Link></Button>
            <Button variant="ghost" size="icon" title="Notificaciones" aria-label="Notificaciones" onClick={() => setNotificationsOpen(true)} className="rounded-full text-foreground/80"><Bell /></Button>
            <Button variant="ghost" size="icon" title="Salir" onClick={async () => { music.stop(); await account.signOut(); navigate({ to: "/", replace: true }); }} aria-label="Salir" className="rounded-full text-muted-foreground hover:text-destructive"><LogOut /></Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-3 pb-40 pt-16">
        <h1 className="sr-only">{title}</h1>
        <div className="mb-3 flex gap-3 border-b pb-2 text-xs"><Link to="/feed" className="text-primary">Inicio</Link><Link to="/videos" className="flex items-center gap-1 text-primary"><Clapperboard size={14} /> Videos y reels</Link><Link to="/musica" className="text-primary">Música</Link></div>
        {account.loading ? <p role="status" className="py-8 text-center text-muted-foreground">Cargando cuenta…</p> : children}
        {!account.loading && !me && <p className="mt-4 text-sm text-muted-foreground">{account.error || "Inicia sesión para publicar y unirte a comunidades."} <Link to="/" className="text-primary">Entrar</Link></p>}
      </main>
      {music.started && <div className="fixed inset-x-0 bottom-14 z-30 border-t bg-card"><div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4"><Button size="icon" variant="ghost" aria-label={music.playing ? "Pausar música de fondo" : "Reanudar música de fondo"} onClick={() => music.playTrack(music.selected)}>{music.playing ? <Pause /> : <Play />}</Button><Button variant="ghost" className="min-w-0 flex-1 justify-start" onClick={() => music.setOpen(true)}><span className="truncate">Música de fondo · {Math.floor(music.time)} s</span></Button></div></div>}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-around">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} aria-label={label}
              className="relative flex h-full flex-1 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "!text-primary before:absolute before:inset-x-3 before:top-0 before:h-0.5 before:rounded-full before:bg-primary before:shadow-[0_0_10px_var(--primary)]" }}>
              <Icon size={23} />
            </Link>
          ))}
          <Button variant="ghost" aria-label="Notificaciones" onClick={() => setNotificationsOpen(true)} className="relative h-full flex-1 rounded-none text-muted-foreground hover:text-foreground"><Bell className="size-6" /></Button>
        </div>
      </nav>
      <SearchPanel open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationsPanel open={notificationsOpen} onOpenChange={setNotificationsOpen} />
    </div>
  );
}
