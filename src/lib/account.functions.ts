import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { registrationSchema, groupSchema } from "@/lib/account-schema";
import { publicName } from "@/lib/identity";
import { promotionalReason } from "@/lib/content-policy";

export const getAccount = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: profile, error } = await context.supabase.from("profiles").select("id,name,handle,bio,hue").eq("id", context.userId).single();
  if (error) throw new Error("No se pudo cargar tu perfil.");
  const { data: privateInfo, error: privateError } = await context.supabase.from("profile_private").select("full_name,birth_date,zodiac,simulation_completed,simulation_completed_at").eq("user_id", context.userId).maybeSingle();
  if (privateError) throw new Error("No se pudo cargar tu configuración privada.");
  const { data: auth } = await context.supabase.auth.getUser();
  return { profile, privateInfo, email: auth.user?.email ?? "" };
});

export const completeRegistration = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => registrationSchema.parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.rpc("complete_luna_registration", { p_name: publicName(data.fullName), p_full_name: data.fullName, p_birth_date: data.birthDate, p_zodiac: data.zodiac });
  if (error) throw new Error("No se pudo guardar el registro. Revisa tus datos e inténtalo de nuevo.");
  return { ok: true };
});

export const createGroup = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => groupSchema.parse(input)).handler(async ({ data, context }) => {
  const reason = promotionalReason(`${data.name} ${data.description}`);
  if (reason) throw new Error(reason);
  const { data: id, error } = await context.supabase.rpc("create_luna_group", { p_name: data.name, p_description: data.description, p_category: data.category });
  if (error) throw new Error("No se pudo crear el grupo.");
  return { id };
});