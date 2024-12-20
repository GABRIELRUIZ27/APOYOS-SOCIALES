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
        path: 'tipos-incidencias',
        loadChildren: () =>
          import('./tipos-incidencias/tipos-incidencias.module').then(
            (i) => i.TiposIncidenciasModule
          ),
      },
      {
        path: 'incidencias',
        loadChildren: () =>
          import('./incidencias/incidencias.module').then(
            (i) => i.IncidenciasModule
          ),
      },
      {
        path: 'dashboard-financiero',
        loadChildren: () =>
          import('./dashboard/dashboard.module').then((i) => i.DashboardModule),
      },
      {
        path: 'dashboard-incidencias',
        loadChildren: () =>
          import('./dashboard-incidencias/dashboard-incidencias.module').then((i) => i.DashboardIncidenciasModule),
      },
      {
        path: 'solicitudes',
        loadChildren: () =>
          import('./solicitudes/solicitudes.module').then((i) => i.SolicitudesModule),
      },
      {
        path: 'agua-potable',
        loadChildren: () =>
          import('./agua-potable/agua-potable.module').then((i) => i.AguaPotableModule),
      },
      {
        path: 'control-agua',
        loadChildren: () =>
          import('./control-agua/control-agua.module').then((i) => i.ControlAguaModule),
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
        path: 'personal',
        loadChildren: () =>
          import('./personal/personal.module').then((i) => i.PersonalModule),
      },
      {
        path: 'adquisiciones',
        loadChildren: () =>
          import('./adquisicion/adquisicion.module').then((i) => i.AdquisicionModule),
      },
      {
        path: 'pago-agua',
        loadChildren: () =>
          import('./pago-agua/pago-agua.module').then((i) => i.PagoAguaModule),
      },
      {
        path: 'fondos',
        loadChildren: () =>
          import('./fondos/fondos.module').then((i) => i.FondosModule),
      },
      {
        path: 'mapa-apoyos',
        loadChildren: () =>
          import('./mapa-apoyos/mapa-apoyos.module').then((i) => i.MapaApoyosModule),
      },
      {
        path: 'mapa-incidencias',
        loadChildren: () =>
          import('./mapa-incidencias/mapa-incidencias.module').then((i) => i.MapaIncidenciasModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PanelRoutingModule {}
