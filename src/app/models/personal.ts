import { Area } from "./area";
import { Cargo } from "./cargo";
import { Genero } from "./genero";

export interface Personal {
    id: number;
    nombre: string;
    cargo: Cargo;
    area: Area;
    genero: Genero;
    edad: string;
    salario: number;
    fechaContratacion: string;
  }
