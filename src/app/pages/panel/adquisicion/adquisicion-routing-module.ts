import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdquisicionComponent } from './adquisicion.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: AdquisicionComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessAdquisiciones'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdquisicionRoutingModule { }
