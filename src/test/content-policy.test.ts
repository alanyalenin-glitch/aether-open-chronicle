import { describe, expect, it } from "vitest";
import { ALLOWED_CONTENT, PROHIBITED_CONTENT, isPromotional, promotionalReason } from "@/lib/content-policy";

describe("filosofía de contenido de Luna", () => {
  it("prohíbe la publicidad y los anuncios patrocinados", () => {
    expect(isPromotional("Publicidad: nueva colección, mira nuestro anuncio patrocinado")).toBe(true);
    expect(promotionalReason("Este post es patrocinado")).toBe("Luna no admite publicidad ni anuncios patrocinados.");
  });

  it("prohíbe las promociones comerciales", () => {
    expect(isPromotional("Código de descuento 30% solo por tiempo limitado")).toBe(true);
    expect(isPromotional("Oferta de lanzamiento, 2x1 esta semana")).toBe(true);
    expect(promotionalReason("Cupón para nuestra tienda")).toBe("Las promociones comerciales no se publican en Luna.");
  });

  it("prohíbe el escaparate de ventas", () => {
    expect(isPromotional("Compra ya el curso, link en la bio")).toBe(true);
    expect(promotionalReason("Reserva tu cita hoy")).toBe("El muro de Luna no es un escaparate de ventas.");
  });

  it("prohíbe el contenido de influencers corporativos", () => {
    expect(isPromotional("Soy embajador de marca y me pagan por esto")).toBe(true);
    expect(isPromotional("Colaboración pagada con la marca")).toBe(true);
    expect(isPromotional("Hoy #ad de mi bebida favorita")).toBe(true);
  });

  it("deja pasar publicaciones, música y videos legítimos", () => {
    for (const t of [
      "Amanecer en el Huascarán esta mañana. Vale cada paso.",
      "Subí mi canción nueva, a ver qué les parece 🎵",
      "Sin algoritmos, sin ruido. Solo lo que publican las personas que sigues.",
      "Adiós a la ciudad, mañana vuelvo a la montaña.",
      "Recomiendo este documental, me encantó el final.",
    ]) {
      expect(promotionalReason(t)).toBeNull();
    }
  });

  it("mantiene las dos listas de la filosofía", () => {
    expect(ALLOWED_CONTENT.length).toBeGreaterThanOrEqual(4);
    expect(PROHIBITED_CONTENT).toEqual([
      "Publicidad y anuncios patrocinados.",
      "Contenido de influencers corporativos.",
      "Promociones comerciales, ofertas, descuentos y cupones.",
      "Cualquier publicación pagada para vender algo.",
    ]);
  });
});
