import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage, RuleList } from "@/components/InfoPage";
import { PROHIBITED_CONTENT } from "@/lib/content-policy";

export const Route = createFileRoute("/sin-publicidad")({
  head: () => ({
    meta: [
      { title: "Cero publicidad — Luna" },
      { name: "description", content: "Luna prohíbe la publicidad, los anuncios patrocinados, el contenido de influencers corporativos y las promociones comerciales." },
      { property: "og:title", content: "Cero publicidad — Luna" },
      { property: "og:description", content: "Nada de anuncios patrocinados, influencers corporativos ni promociones comerciales." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SinPublicidad,
});

function SinPublicidad() {
  return (
    <InfoPage kicker="Páginas informativas" title="Cero publicidad">
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Luna no se financia con anuncios. No vendemos espacios en el muro, no promocionamos
        publicaciones a cambio de dinero y no mostramos banner alguno. Lo que ves es lo que
        publicaron las personas que sigues, en orden cronológico.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Nunca verás esto en Luna</h2>
      <RuleList tone="no" items={PROHIBITED_CONTENT} />

      <h2 className="mt-8 text-lg font-semibold">Cómo lo cuidamos</h2>
      <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li className="rounded-xl border bg-secondary/40 px-3 py-2.5">
          Al publicar, el muro detecta textos con señales de publicidad, promociones o
          patrocinio y no los deja pasar. Te avisa el motivo para que puedas reescribirlo.
        </li>
        <li className="rounded-xl border bg-secondary/40 px-3 py-2.5">
          El orden del feed es cronológico: nadie paga por aparecer arriba.
        </li>
        <li className="rounded-xl border bg-secondary/40 px-3 py-2.5">
          La música, los videos y las publicaciones legítimas de los miembros se comparten
          sin límites.
        </li>
      </ul>

      <p className="mt-8 text-sm text-muted-foreground">
        ¿Quieres leer el resto de las reglas?{" "}
        <Link to="/filosofia" className="text-primary underline-offset-4 hover:underline">
          Filosofía de contenido
        </Link>
        .
      </p>
    </InfoPage>
  );
}
