import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/services/auth.guard';
import { MapaApoyosComponent } from './mapa-apoyos.component';

const routes: Routes = [
  {
    path: '',
    component: MapaApoyosComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessMapasApoyos'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapaApoyosRoutingModule { }