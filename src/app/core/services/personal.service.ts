import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { Personal } from 'src/app/models/personal';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PersonalService {
  route = `${environment.apiUrl}/personal`;
  private _refreshListPersonal$ = new Subject<Personal | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListPersonal() {
    return this._refreshListPersonal$;
  }

  getAll() {
    return this.http.get<Personal[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Personal) {
    return this.http.post<Personal>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListPersonal$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Personal) {
    return this.http.put<Personal>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListPersonal$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListPersonal$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
