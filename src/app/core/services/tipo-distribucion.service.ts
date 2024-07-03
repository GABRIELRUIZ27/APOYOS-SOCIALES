import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TipoDistribucion } from 'src/app/models/tipoDistribucion';

@Injectable({
  providedIn: 'root',
})
export class TipoDistribucionService {
  route = `${environment.apiUrl}/tipos-distribuciones`;
  private _refreshListTiposDistribuciones$ = new Subject<TipoDistribucion | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListComunidades() {
    return this._refreshListTiposDistribuciones$;
  }

  getAll() {
    return this.http.get<TipoDistribucion[]>(`${this.route}/obtener-todos`);
  }

}
