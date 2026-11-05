import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Search, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { lunaActivity, searchLuna } from "@/lib/navigation";

export function SearchPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { people, me, posts, getUser } = useStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const results = searchLuna(query, me ? [...people, me] : people, posts);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-lg">
        <DialogTitle>Buscar en Luna</DialogTitle>
        <DialogDescription className="sr-only">Usuarios y publicaciones</DialogDescription>
        <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input aria-label="Buscar usuarios o publicaciones" placeholder="Buscar usuarios o publicaciones…" value={query} onChange={(e) => { setQuery(e.target.value); setSelected(null); }} className="pl-9" />
        </div>
        {!query.trim() ? <p className="py-6 text-center text-sm text-muted-foreground">Usuarios y publicaciones</p> : (
          <div className="space-y-5" aria-live="polite">
            <section><h3 className="mb-2 text-sm font-semibold">Usuarios · {results.users.length}</h3>
              {results.users.map((user) => <div key={user.id} className="border-b py-2">
                <Button variant="ghost" className="h-auto w-full justify-start whitespace-normal px-2 text-left" onClick={() => setSelected(selected === user.id ? null : user.id)} aria-expanded={selected === user.id}>
                  <span className="min-w-0"><span className="block break-words font-semibold">{user.name}</span><span className="block text-xs text-muted-foreground">@{user.handle}</span></span>
                </Button>
                {selected === user.id && <p className="break-words px-2 py-2 text-sm text-muted-foreground">{user.bio}</p>}
              </div>)}
            </section>
            <section><h3 className="mb-2 text-sm font-semibold">Publicaciones · {results.posts.length}</h3>
              {results.posts.map((post) => <Link key={post.id} to="/feed" hash={post.id} onClick={() => onOpenChange(false)} className="block border-b py-3 hover:bg-secondary">
                <p className="text-xs font-semibold text-primary">{getUser(post.userId)?.name}</p>
                <p className="mt-1 line-clamp-3 break-words text-sm">{post.text}</p>
              </Link>)}
            </section>
            {!results.users.length && !results.posts.length && <p className="py-4 text-center text-sm text-muted-foreground">No se encontraron resultados.</p>}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function NotificationsPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { me, posts, convos, getUser } = useStore();
  const activity = me ? lunaActivity(me.id, posts, convos) : [];
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[85dvh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-lg">
      <DialogTitle className="flex items-center gap-2"><Bell size={18} /> Notificaciones</DialogTitle>
      <DialogDescription>Actividad reciente</DialogDescription>
      {activity.length ? activity.map((item) => <Link key={item.id} to={item.postId ? "/feed" : "/messages"} hash={item.postId ?? ""} onClick={() => onOpenChange(false)} className="flex gap-3 border-b py-3 hover:bg-secondary">
        <MessageCircle className="mt-1 size-4 shrink-0 text-primary" />
        <div className="min-w-0"><p className="text-sm font-semibold">{getUser(item.from)?.name}</p><p className="break-words text-sm text-muted-foreground">{item.text}</p></div>
      </Link>) : <p className="py-6 text-center text-sm text-muted-foreground">No hay notificaciones por ahora.</p>}
    </DialogContent>
  </Dialog>;
}