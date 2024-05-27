import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './panel.component';

const routes: Routes = [
  {
    path: '',
    component: PanelComponent,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadChildren: () =>
          import('./inicio/inicio.module').then((i) => i.InicioModule),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./usuarios/usuarios.module').then((i) => i.UsuariosModule),
      },
      {
        path: 'programas-sociales',
        loadChildren: () =>
          import('./programas-sociales/programas-sociales.module').then(
            (i) => i.ProgramasSocialesModule
          ),
      },
      {
        path: 'nube-palabras',
        loadChildren: () =>
          import('./nube-palabras/nube-palabras.module').then(
            (i) => i.NubePalabrasModule
          ),
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((i) => i.DashboardModule),
      },
      {
        path: 'areas',
        loadChildren: () =>
          import('./areas/areas.module').then((i) => i.AreasModule),
      },
      {
        path: 'apoyos',
        loadChildren: () =>
          import('./apoyos/apoyos.module').then((i) => i.ApoyosModule),
      },
      {
        path: 'mapa-apoyos',
        loadChildren: () =>
          import('./mapa-apoyos/mapa-apoyos.module').then((i) => i.MapaApoyosModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelRoutingModule {}
