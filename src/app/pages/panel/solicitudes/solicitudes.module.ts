import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { SolicitudesRoutingModule } from './solicitudes-routing.component';
import { SolicitudesComponent } from './solicitudes.component';
import { FormsModule } from '@angular/forms';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';


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
    NgxGpAutocompleteModule
  ]
})
export class SolicitudesModule { }
