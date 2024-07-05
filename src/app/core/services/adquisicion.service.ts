import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { Adquisicion } from 'src/app/models/adquisicion';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdquisicionService {
  route = `${environment.apiUrl}/adquisiciones`;
  private _refreshListAdquisicion$ = new Subject<Adquisicion | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListAdquisicion() {
    return this._refreshListAdquisicion$;
  }

  getAll() {
    return this.http.get<Adquisicion[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Adquisicion) {
    return this.http.post<Adquisicion>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListAdquisicion$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Adquisicion) {
    return this.http.put<Adquisicion>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListAdquisicion$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListAdquisicion$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
