import { Comunidad } from "./comunidad";
import { Area } from "./area";

export interface Apoyos {
    id: number;
    nombre: string;
    comentarios: string;
    latitud: number;
    longitud: number;
    comunidad: Comunidad;
    area: Area;
    imagenBase64: string;
    ubicacion: string;
    foto: string;
  }
