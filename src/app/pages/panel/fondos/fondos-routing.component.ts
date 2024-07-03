import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FondosComponent } from './fondos.component';
import { AuthGuard } from 'src/app/core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: FondosComponent,
    canActivate: [AuthGuard], data: { claimType: 'CanAccessFondos'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FondosRoutingModule { }
