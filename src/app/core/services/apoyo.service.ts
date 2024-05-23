import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { Apoyos } from 'src/app/models/apoyos';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApoyosService {
  route = `${environment.apiUrl}/apoyos`;
  private _refreshListApoyos$ = new Subject<Apoyos | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListApoyos() {
    return this._refreshListApoyos$;
  }

  getAll() {
    return this.http.get<Apoyos[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Apoyos) {
    return this.http.post<Apoyos>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListApoyos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Apoyos) {
    return this.http.put<Apoyos>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListApoyos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListApoyos$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
