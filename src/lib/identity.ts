export const ZODIAC = [
  "Aries", "Tauro", "Géminis", "Cáncer", "Leo", "Virgo",
  "Libra", "Escorpio", "Sagitario", "Capricornio", "Acuario", "Piscis",
] as const;

/** Public display name: first given name + first surname (Spanish naming). */
export function publicName(fullName: string): string {
  const w = fullName.trim().split(/\s+/).filter(Boolean);
  if (w.length <= 2) return w.join(" ");
  // 3 words: "Nombre Apellido1 Apellido2"; 4+: "Nombre1 Nombre2 Apellido1 Apellido2"
  return `${w[0]} ${w.length >= 4 ? w[w.length - 2] : w[1]}`;
}

/** Zodiac sign from an ISO date (YYYY-MM-DD). */
export function zodiacFor(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  if (!m || !d) return "";
  const cut = [20, 19, 21, 20, 21, 21, 23, 23, 23, 23, 22, 22]; // first day of the sign starting in month m
  const idx = d >= cut[m - 1]! ? (m + 8) % 12 : (m + 7) % 12;
  return ZODIAC[idx]!;
}
