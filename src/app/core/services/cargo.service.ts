import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HandleErrorService } from './handle-error.service';
import { Subject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Cargo } from 'src/app/models/cargo';

@Injectable({
  providedIn: 'root',
})
export class CargoService {
  route = `${environment.apiUrl}/cargos`;
  private _refreshListCargo$ = new Subject<Cargo | null>();

  constructor(
    private http: HttpClient,
    private handleErrorService: HandleErrorService
  ) {}

  get refreshListComunidades() {
    return this._refreshListCargo$;
  }

  getAll() {
    return this.http.get<Cargo[]>(`${this.route}/obtener-todos`);
  }
}
