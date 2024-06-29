import { Comunidad } from "./comunidad";
import { Area } from "./area";
import { Genero } from "./genero";
import { ProgramaSocial } from "./programa-social";

export interface Apoyos {
    id: number;
    nombre: string;
    comentarios: string;
    latitud: number;
    longitud: number;
    comunidad: Comunidad;
    area: Area;
    genero: Genero;
    programa: ProgramaSocial;
    CURP: string;
    edad: string;
    imagenBase64: string;
    ubicacion: string;
    foto: string;
  }
