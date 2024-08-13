import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { Solicitud } from 'src/app/models/solicitud';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SolicitudesService {
  route = `${environment.apiUrl}/solicitudes`;
  private _refreshListSolicitudes$ = new Subject<Solicitud | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListSolicitudes() {
    return this._refreshListSolicitudes$;
  }

  getAll() {
    return this.http.get<Solicitud[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Solicitud) {
    return this.http.post<Solicitud>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListSolicitudes$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Solicitud) {
    return this.http.put<Solicitud>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListSolicitudes$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListSolicitudes$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
