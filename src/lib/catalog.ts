// Datos de ejemplo de los accesos de la barra superior: grupos públicos y música.
export type Group = { id: string; name: string; topic: string; members: number; hue: number };
export type Track = { id: string; title: string; artist: string; length: string; hue: number };

export const publicGroups: Group[] = [
  { id: "g1", name: "Fotografía analógica", topic: "Carretes, revelado y luz natural", members: 1240, hue: 260 },
  { id: "g2", name: "Música de casa", topic: "Grabaciones propias, sin sellos", members: 870, hue: 185 },
  { id: "g3", name: "Montaña lenta", topic: "Rutas, amaneceres y silencio", members: 2110, hue: 140 },
  { id: "g4", name: "Tecnología lenta", topic: "Herramientas que no gritan", members: 640, hue: 20 },
  { id: "g5", name: "Cocina de barrio", topic: "Recetas de casa y mercado", members: 980, hue: 40 },
];

export const tracks: Track[] = [
  { id: "t1", title: "Amanecer en el Huascarán", artist: "Mateo Vega", length: "3:12", hue: 260 },
  { id: "t2", title: "Cumbia de la azotea", artist: "Inés Paredes", length: "2:48", hue: 20 },
  { id: "t3", title: "Ruido blanco para estudiar", artist: "Lucía Ríos", length: "12:05", hue: 185 },
  { id: "t4", title: "Guitarra en la cocina", artist: "Camila Solís", length: "1:57", hue: 140 },
  { id: "t5", title: "Canción para dormir tarde", artist: "Diego Fuentes", length: "4:03", hue: 300 },
];
