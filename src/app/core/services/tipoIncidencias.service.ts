import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TiposIncidencias } from 'src/app/models/tipos-incidecias';

@Injectable({
  providedIn: 'root'
})
export class TipoIncidenciaService {
  route = `${environment.apiUrl}/tipos-incidencias`;
  private _refreshListIncidencia$ = new Subject<TiposIncidencias | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) { }

  get refreshListIncidencia() {
    return this._refreshListIncidencia$;
  }

  getAll() {
    return this.http.get<TiposIncidencias[]>(`${this.route}/obtener-todos`);
  }

  post(dto: TiposIncidencias) {
    return this.http.post<TiposIncidencias>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListIncidencia$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: TiposIncidencias) {
    return this.http.put<TiposIncidencias>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListIncidencia$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListIncidencia$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
