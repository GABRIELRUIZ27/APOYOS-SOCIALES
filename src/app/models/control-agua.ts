import { Agua } from "./agua";

export interface ControlAgua {
    id: number;
    fecha: string;
    importe: string;
    descripcion: string;
    agua: Agua;
}
