import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Genero } from 'src/app/models/genero';

@Injectable({
  providedIn: 'root',
})
export class GeneroService {
  route = `${environment.apiUrl}/genero`;
  private _refreshListGeneros$ = new Subject<Genero | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListComunidades() {
    return this._refreshListGeneros$;
  }

  getAll() {
    return this.http.get<Genero[]>(`${this.route}/obtener-todos`);
  }
}
