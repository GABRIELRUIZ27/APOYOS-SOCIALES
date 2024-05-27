import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaApoyosRoutingModule } from './mapa-apoyos-routing.module';
import { MapaApoyosComponent } from './mapa-apoyos.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    MapaApoyosComponent
  ],
  imports: [
    CommonModule,
    MapaApoyosRoutingModule,
    NgxSpinnerModule,
    NgxPaginationModule,
    NgSelectModule,
    NgxGpAutocompleteModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class MapaApoyosModule { }