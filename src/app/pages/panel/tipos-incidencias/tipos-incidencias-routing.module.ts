import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiposIncidenciasComponent } from './tipos-incidencias.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TiposIncidenciasComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessTiposIncidencias'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TiposIncidenciasRoutingModule { }
