import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { Area } from 'src/app/models/area';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AreasService {
  route = `${environment.apiUrl}/areas`;
  private _refreshListAreas$ = new Subject<Area | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListAreas() {
    return this._refreshListAreas$;
  }

  getAll() {
    return this.http.get<Area[]>(`${this.route}/obtener-todos`);
  }

  post(dto: Area) {
    return this.http.post<Area>(`${this.route}/crear`, dto)
      .pipe(
        tap(() => {
          this._refreshListAreas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  put(id: number, dto: Area) {
    return this.http.put<Area>(`${this.route}/actualizar/${id}`, dto)
      .pipe(
        tap(() => {
          this._refreshListAreas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

  delete(id: number) {
    return this.http.delete(`${this.route}/eliminar/${id}`)
      .pipe(
        tap(() => {
          this._refreshListAreas$.next(null);
        }),
        catchError(this.handleErrorService.handleError)
      );
  }

}
