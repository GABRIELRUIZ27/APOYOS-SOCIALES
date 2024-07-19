import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardIncidenciasRoutingModule } from './dashboard-incidencias-routing.module';
import { DashboardIncidenciasComponent } from './dashboard-incidencias.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HighchartsChartModule } from 'highcharts-angular';


@NgModule({
  declarations: [
    DashboardIncidenciasComponent
  ],
  imports: [
    CommonModule,
    DashboardIncidenciasRoutingModule,
    SharedModule,
    HighchartsChartModule,
  ]
})
export class DashboardIncidenciasModule { }
