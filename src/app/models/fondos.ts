import { TipoDistribucion } from "./tipoDistribucion";

export interface Fondos {
    id: number;
    cantidad: number;
    periodo: string;
    tipoDistribucion: TipoDistribucion;
}
