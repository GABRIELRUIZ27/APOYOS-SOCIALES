import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApoyosComponent } from './apoyos.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: ApoyosComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessApoyos'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApoyosRoutingModule { }
