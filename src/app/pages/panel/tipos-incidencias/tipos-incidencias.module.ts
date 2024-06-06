import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TiposIncidenciasComponent } from './tipos-incidencias.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { TiposIncidenciasRoutingModule } from './tipos-incidencias-routing.module';


@NgModule({
  declarations: [
    TiposIncidenciasComponent
  ],
  imports: [
    CommonModule,
    TiposIncidenciasRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class TiposIncidenciasModule { }
