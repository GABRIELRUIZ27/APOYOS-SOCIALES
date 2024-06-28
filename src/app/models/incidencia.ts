import { Comunidad } from "./comunidad";
import { TiposIncidencias } from "./tipos-incidecias";

export interface Incidencias {
    id: number;
    comentarios: string;
    latitud: number;
    longitud: number;
    comunidad: Comunidad;
    imagenBase64: string;
    ubicacion: string;
    foto: string;
    tipoIncidencia: TiposIncidencias
  }
