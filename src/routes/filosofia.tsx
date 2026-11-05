import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage, RuleList } from "@/components/InfoPage";
import { ALLOWED_CONTENT, PROHIBITED_CONTENT } from "@/lib/content-policy";

export const Route = createFileRoute("/filosofia")({
  head: () => ({
    meta: [
      { title: "Filosofía de contenido — Luna" },
      { name: "description", content: "En Luna caben todos los videos, la música y las publicaciones legítimas de sus miembros. La publicidad no." },
      { property: "og:title", content: "Filosofía de contenido — Luna" },
      { property: "og:description", content: "Todo el contenido legítimo de sus miembros, cero publicidad." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Filosofia,
});

function Filosofia() {
  return (
    <InfoPage kicker="Páginas informativas" title="Filosofía de contenido">
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Luna existe para que las personas compartan y disfruten sanamente. Aquí cabe todo tipo de
        videos, música y publicaciones legítimas de quienes forman parte de la red. Lo que no cabe
        es la publicidad: ni anuncios patrocinados, ni contenido de influencers corporativos, ni
        promociones comerciales.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Lo que sí se disfruta en Luna</h2>
      <RuleList tone="yes" items={ALLOWED_CONTENT} />

      <h2 className="mt-8 text-lg font-semibold">Lo que está prohibido</h2>
      <RuleList tone="no" items={PROHIBITED_CONTENT} />

      <p className="mt-8 rounded-2xl border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
        El muro se ordena por fecha, no por pago. Ninguna publicación sube por dinero, ni se muestra
        más arriba a cambio de una marca.{" "}
        <Link to="/sin-publicidad" className="text-primary underline-offset-4 hover:underline">
          Leer el compromiso de cero publicidad
        </Link>
        .
      </p>
    </InfoPage>
  );
}
