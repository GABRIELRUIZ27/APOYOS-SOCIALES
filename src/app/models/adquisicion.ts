import { Area } from "./area";

export interface Adquisicion {
    id: number;
    nombre: string;
    folio?: string;
    cantidad: number;
    precioUnitario: number;
    precioTotal: number;
    area: Area;
    proveedor: string;
    marca: string;
    fechaAdquisicion: string;
  }
