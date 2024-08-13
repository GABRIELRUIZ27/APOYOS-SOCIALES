import { Comunidad } from "./comunidad";
import { Area } from "./area";
import { Genero } from "./genero";
import { ProgramaSocial } from "./programa-social";

export interface Solicitud {
    id: number;
    nombre: string;
    latitud: number;
    longitud: number;
    comunidad: Comunidad;
    area: Area;
    genero: Genero;
    programaSocial: ProgramaSocial;
    curp: string;
    edad: string;
    ubicacion: string;
    estatus: boolean;
  }
