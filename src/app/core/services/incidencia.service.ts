import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { Incidencias } from 'src/app/models/incidencia';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IncidenciaService {
  route = `${environment.apiUrl}/incidencias`;
  private _refreshListIncidencias$ = new Subject<Incidencias | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListIncidencias() {
    return this._refreshListIncidencias$;
  }

  getAll() {
    return this.http.get<Incidencias[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Incidencias) {
    return this.http.post<Incidencias>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListIncidencias$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Incidencias) {
    return this.http.put<Incidencias>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListIncidencias$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListIncidencias$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
