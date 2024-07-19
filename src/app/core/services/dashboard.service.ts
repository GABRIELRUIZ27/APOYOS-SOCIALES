import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TiposIncidencias } from 'src/app/models/tipos-incidecias';

export interface AdquisicionesPorDia {
  fecha: string;
  cantidad: number;
}

export interface IncidenciasPorDia {
  fecha: string;
  cantidad: number;
}

export interface IncidenciaRecurrente {
  tipoIncidencia: TiposIncidencias;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getEmpleadosPorGenero(): Observable<{ empleadosPorGenero: { [key: string]: number } }> {
    return this.http.get<{ empleadosPorGenero: { [key: string]: number } }>(`${this.apiUrl}/dashboard/empleados-por-genero`);
  }

  getEmpleadosPorArea(): Observable<{ empleadosPorArea: { [key: string]: number } }> {
    return this.http.get<{ empleadosPorArea: { [key: string]: number } }>(`${this.apiUrl}/dashboard/empleados-por-area`);
  }

  getAdquisicionesPorArea(): Observable<{ adquisicionesPorArea: { [key: string]: number } }> {
    return this.http.get<{ adquisicionesPorArea: { [key: string]: number } }>(`${this.apiUrl}/dashboard/adquisiciones-por-area`);
  }

  getTotalEmpleados(): Observable<{ totalEmpleados: number }> {
    return this.http.get<{ totalEmpleados: number }>(`${this.apiUrl}/dashboard/total-empleados`);
  }

  getTotalSalarios(): Observable<{ totalSalarios: number }> {
    return this.http.get<{ totalSalarios: number }>(`${this.apiUrl}/dashboard/total-salarios`);
  }

  getTotalAdquisiciones(): Observable<{ totalAdquisiciones: number }> {
    return this.http.get<{ totalAdquisiciones: number }>(`${this.apiUrl}/dashboard/total-adquisiciones`);
  }

  getValorAdquisiciones(): Observable<{ valorAdquisiciones: number }> {
    return this.http.get<{ valorAdquisiciones: number }>(`${this.apiUrl}/dashboard/valor-adquisiciones`);
  }

  getTotalAreas(): Observable<{ totalAreas: number }> {
    return this.http.get<{ totalAreas: number }>(`${this.apiUrl}/dashboard/total-areas`);
  }  

  getAdquisicionesPorDia(): Observable<AdquisicionesPorDia[]> {
    return this.http.get<AdquisicionesPorDia[]>(`${this.apiUrl}/dashboard/adquisiciones-por-dia`);
  }

  getTotalIncidencias(): Observable<{ totalIncidencias: number }> {
    return this.http.get<{ totalIncidencias: number }>(`${this.apiUrl}/dashboard/total-incidencias`);
  }

  getIncidenciasPorDia(): Observable<IncidenciasPorDia[]> {
    return this.http.get<IncidenciasPorDia[]>(`${this.apiUrl}/dashboard/incidencias-por-dia`);
  }

  getIncidenciasPorComunidad(): Observable<{ incidenciasPorComunidad: { [key: string]: number } }> {
    return this.http.get<{ incidenciasPorComunidad: { [key: string]: number } }>(`${this.apiUrl}/dashboard/incidencias-por-comunidad`);
  }

  getIncidenciaMasRecurrente(): Observable<IncidenciaRecurrente> {
    return this.http.get<IncidenciaRecurrente>(`${this.apiUrl}/dashboard/incidencia-mas-recurrente`);
  }
}
