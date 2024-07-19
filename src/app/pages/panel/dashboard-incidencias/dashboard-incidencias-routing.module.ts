import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardIncidenciasComponent } from './dashboard-incidencias.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardIncidenciasComponent,
    canActivate: [AuthGuard],
    data: { claimType: 'CanAccessDashboardIncidencias' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardIncidenciasRoutingModule {}
