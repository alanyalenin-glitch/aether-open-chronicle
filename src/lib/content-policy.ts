// Filosofía de contenido de Luna: fuente única para las páginas informativas
// y para el filtro que mantiene el muro libre de publicidad.

export const ALLOWED_CONTENT = [
  "Publicaciones propias: texto, fotos y videos que compartes tú.",
  "Música y videos de música, propios o compartidos para disfrutar.",
  "Videos legítimos: viajes, cocina, deporte, estudio, humor, arte.",
  "Conversaciones, opiniones y recuerdos sin patrocinio de ninguna marca.",
] as const;

export const PROHIBITED_CONTENT = [
  "Publicidad y anuncios patrocinados.",
  "Contenido de influencers corporativos.",
  "Promociones comerciales, ofertas, descuentos y cupones.",
  "Cualquier publicación pagada para vender algo.",
] as const;

const normalize = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const RULES: { re: RegExp; why: string }[] = [
  {
    re: /\b(publicidad|publicitario|publicitarios|anuncio patrocinado|anuncios patrocinados|anuncio pagado|patrocinad[oa]s?|sponsored|ads?)\b/,
    why: "Luna no admite publicidad ni anuncios patrocinados.",
  },
  {
    re: /\b(promocion|promociones|promocional|promo|codigo de descuento|codigo promo|cupon|descuento|oferta|ofertas|liquidacion|2x1|3x2)\b/,
    why: "Las promociones comerciales no se publican en Luna.",
  },
  {
    re: /\b(compra ya|compra ahora|compra online|adquiere|reserva tu|reserva ahora|pide ya|consigue tu|solo por hoy|ultimas unidades|stock limitado|envio gratis|link en la bio|link en bio)\b/,
    why: "El muro de Luna no es un escaparate de ventas.",
  },
  {
    re: /\b(embajador de marca|influencer corporativo|influencers corporativos|colaboracion pagada|colaboracion patrocinada|me pagan por|marca nos paga)\b/,
    why: "El contenido de influencers corporativos no tiene espacio en Luna.",
  },
  {
    re: /#(ad|publi|publicidad|patrocinado)\b/,
    why: "Las publicaciones marcadas como publicidad no se comparten en Luna.",
  },
];

/** Motivo por el que un texto se considera comercial, o null si es una publicación legítima. */
export function promotionalReason(text: string): string | null {
  const t = ` ${normalize(text)} `;
  for (const r of RULES) if (r.re.test(t)) return r.why;
  return null;
}

export const isPromotional = (text: string) => promotionalReason(text) !== null;
