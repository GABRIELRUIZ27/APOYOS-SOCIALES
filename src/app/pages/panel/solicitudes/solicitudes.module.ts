import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SolicitudesRoutingModule } from './solicitudes-routing.component';
import { SolicitudesComponent } from './solicitudes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    SolicitudesComponent
  ],
  imports: [
    CommonModule,
    SolicitudesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
  ]
})
export class SolicitudesModule { }
