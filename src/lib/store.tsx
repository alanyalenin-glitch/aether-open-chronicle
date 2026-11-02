import mountain from "@/assets/post-mountain.jpg";
import { publicName } from "@/lib/identity";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PrivateInfo = { fullName: string; email: string; birthDate: string; zodiac: string; faceVerified: boolean; verifiedAt?: number | undefined };
export type User = { id: string; name: string; handle: string; bio: string; hue: number; private?: PrivateInfo | undefined };
export type Post = { id: string; userId: string; text: string; image?: string | undefined; createdAt: number; likes: string[]; comments: Comment[] };
export type Comment = { id: string; userId: string; text: string; at: number };
export type Message = { from: string; text: string; at: number };
export type Conversation = { id: string; withId: string; messages: Message[] };

const now = Date.now();
const people: User[] = [
  { id: "u1", name: "Lucía Ríos", handle: "lucia", bio: "Diseñadora de producto. Café y tipografías.", hue: 185 },
  { id: "u2", name: "Mateo Vega", handle: "mateo", bio: "Fotografía analógica y montañas.", hue: 260 },
  { id: "u3", name: "Inés Paredes", handle: "ines", bio: "Escribo sobre tecnología lenta.", hue: 20 },
];

const seedPosts: Post[] = [
  { id: "p1", userId: "u1", text: "Sin algoritmos, sin ruido. Solo lo que publican las personas que sigues, en orden. Así se siente Luna.", createdAt: now - 1000 * 60 * 12, likes: ["u2"], comments: [{ id: "k1", userId: "u3", text: "¡Por fin! 🙌", at: now - 600000 }] },
  { id: "p2", userId: "u2", text: "Amanecer en el Huascarán esta mañana. Vale cada paso.", image: mountain, createdAt: now - 1000 * 60 * 90, likes: ["u1"], comments: [] },
  { id: "p3", userId: "u3", text: "Pensamiento del día: menos notificaciones, más conversaciones.", createdAt: now - 1000 * 60 * 60 * 5, likes: ["u1", "u2"], comments: [] },
];

const seedConvos: Conversation[] = [
  { id: "c1", withId: "u1", messages: [{ from: "u1", text: "¡Hola! ¿Bienvenido a Luna 👋", at: now - 600000 }] },
  { id: "c2", withId: "u2", messages: [{ from: "u2", text: "¿Viste mi última foto?", at: now - 3600000 }] },
  { id: "c3", withId: "u3", messages: [] },
];

const replies = ["¡Totalmente de acuerdo!", "Jaja, me encanta 😄", "Cuéntame más", "Buena idea ✨", "Hablamos luego 🙌"];

type State = { me: User | null; posts: Post[]; convos: Conversation[] };
type Ctx = State & {
  people: User[];
  getUser: (id: string) => User | undefined;
  login: (name: string) => void;
  register: (info: PrivateInfo) => void;
  logout: () => void;
  updateMe: (p: Partial<User>) => void;
  addPost: (text: string, image?: string) => void;
  toggleLike: (id: string) => void;
  addComment: (id: string, text: string) => void;
  sendMessage: (convoId: string, text: string) => void;
};

const StoreCtx = createContext<Ctx | null>(null);
const KEY = "luna-state-v2";
const LEGACY_KEY = "aether-state-v2";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ me: null, posts: seedPosts, convos: seedConvos });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state, loaded]);

  const getUser = (id: string) => (state.me?.id === id ? state.me : people.find((p) => p.id === id));

  const value: Ctx = {
    ...state,
    people,
    getUser,
    login: (name) =>
      setState((s) => ({
        ...s,
        me: { id: "me", name, handle: name.toLowerCase().replace(/[^a-z0-9]/g, "") || "yo", bio: "Nuevo en Luna.", hue: 200 },
      })),
    register: (info) =>
      setState((s) => {
        const name = publicName(info.fullName);
        return { ...s, me: { id: "me", name, handle: name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "") || "yo", bio: "Nuevo en Luna.", hue: 200, private: info } };
      }),
    logout: () => setState((s) => ({ ...s, me: null })),
    updateMe: (p) => setState((s) => (s.me ? { ...s, me: { ...s.me, ...p } } : s)),
    addPost: (text, image) =>
      setState((s) => ({
        ...s,
        posts: [{ id: crypto.randomUUID(), userId: "me", text, image, createdAt: Date.now(), likes: [], comments: [] }, ...s.posts],
      })),
    toggleLike: (id) =>
      setState((s) => ({
        ...s,
        posts: s.posts.map((p) =>
          p.id !== id ? p : { ...p, likes: p.likes.includes("me") ? p.likes.filter((l) => l !== "me") : [...p.likes, "me"] },
        ),
      })),
    addComment: (id, text) =>
      setState((s) => ({
        ...s,
        posts: s.posts.map((p) =>
          p.id !== id ? p : { ...p, comments: [...p.comments, { id: crypto.randomUUID(), userId: "me", text, at: Date.now() }] },
        ),
      })),
    sendMessage: (convoId, text) => {
      const add = (m: Message) =>
        setState((s) => ({
          ...s,
          convos: s.convos.map((c) => (c.id === convoId ? { ...c, messages: [...c.messages, m] } : c)),
        }));
      add({ from: "me", text, at: Date.now() });
      const c = state.convos.find((c) => c.id === convoId);
      const r = replies[Math.floor(Math.random() * replies.length)] ?? "👍";
      if (c) setTimeout(() => add({ from: c.withId, text: r, at: Date.now() }), 1200);
    },
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("StoreProvider missing");
  return c;
}

export function timeAgo(t: number) {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "ahora";
  if (s < 3600) return `${Math.floor(s / 60)} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  return `${Math.floor(s / 86400)} d`;
}
