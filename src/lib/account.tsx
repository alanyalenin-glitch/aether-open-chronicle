import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getAccount } from "@/lib/account.functions";
import type { User, PrivateInfo } from "@/lib/store";

type AccountContext = { user: User | null; privateInfo: PrivateInfo | null; loading: boolean; error: string; refresh: () => Promise<void>; signOut: () => Promise<void> };
const Account = createContext<AccountContext | null>(null);
export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [privateInfo, setPrivateInfo] = useState<PrivateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const get = useServerFn(getAccount);
  const router = useRouter();
  const queries = useQueryClient();
  const refresh = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { setUser(null); setPrivateInfo(null); return; }
      const account = await get();
      setUser(account.profile);
      const p = account.privateInfo;
      setPrivateInfo(p ? { fullName: p.full_name, email: account.email, birthDate: p.birth_date, zodiac: p.zodiac, faceVerified: p.simulation_completed, verifiedAt: p.simulation_completed_at ? Date.parse(p.simulation_completed_at) : undefined } : null);
    } catch { setUser(null); setPrivateInfo(null); setError("No se pudo cargar tu cuenta. Inténtalo de nuevo."); }
    finally { setLoading(false); }
  };
  useEffect(() => {
    void refresh();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return;
      if (event === "SIGNED_OUT") { setUser(null); setPrivateInfo(null); queries.clear(); }
      else { setUser(null); setPrivateInfo(null); setTimeout(() => { void refresh(); }, 0); void queries.invalidateQueries(); }
      void router.invalidate();
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const signOut = async () => { await queries.cancelQueries(); queries.clear(); setUser(null); setPrivateInfo(null); await supabase.auth.signOut(); };
  return <Account.Provider value={{ user, privateInfo, loading, error, refresh, signOut }}>{children}</Account.Provider>;
}
export function useAccount() { const account = useContext(Account); if (!account) throw new Error("AccountProvider missing"); return account; }