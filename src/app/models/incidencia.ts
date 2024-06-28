import { Comunidad } from "./comunidad";

export interface Incidencias {
    id: number;
    comentarios: string;
    latitud: number;
    longitud: number;
    comunidad: Comunidad;
    imagenBase64: string;
    ubicacion: string;
    foto: string;
  }
