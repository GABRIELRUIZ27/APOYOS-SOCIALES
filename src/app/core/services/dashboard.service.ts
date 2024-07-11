import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AdquisicionesPorDia {
  fecha: string;
  cantidad: number;
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

  getTotalEmpleados(): Observable<{ totalEmpleados: number }> {
    return this.http.get<{ totalEmpleados: number }>(`${this.apiUrl}/dashboard/total-empleados`);
  }

  getTotalSalarios(): Observable<{ totalSalarios: number }> {
    return this.http.get<{ totalSalarios: number }>(`${this.apiUrl}/dashboard/total-salarios`);
  }

  getTotalAreas(): Observable<{ totalAreas: number }> {
    return this.http.get<{ totalAreas: number }>(`${this.apiUrl}/dashboard/total-areas`);
  }  

  getAdquisicionesPorDia(): Observable<AdquisicionesPorDia[]> {
    return this.http.get<AdquisicionesPorDia[]>(`${this.apiUrl}/dashboard/adquisiciones-por-dia`);
  }
}
