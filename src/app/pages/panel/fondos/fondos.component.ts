import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { FondosService } from 'src/app/core/services/fondos.service';
import { TipoDistribucionService } from 'src/app/core/services/tipo-distribucion.service';
import { PersonalService } from 'src/app/core/services/personal.service';
import { LoadingStates } from 'src/app/global/global';
import { Fondos } from 'src/app/models/fondos';
import { TipoDistribucion } from 'src/app/models/tipoDistribucion';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-fondos',
  templateUrl: './fondos.component.html',
  styleUrls: ['./fondos.component.css'],
})
export class FondosComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  fondo!: Fondos;
  fondosForm!: FormGroup;
  fondos: Fondos[] = [];
  fondosFilter: Fondos[] = [];
  isLoading = LoadingStates.neutro;
  tipo: TipoDistribucion[] = [];
  isModalAdd = true;

  constructor(
    private spinnerService: NgxSpinnerService,
    private personalService: PersonalService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private fondosService: FondosService,
    private tiposService: TipoDistribucionService,
  ) {
    this.fondosService.refreshListFondos.subscribe(() => this.getFondos());
    this.getFondos();
    this.getTipos();
    this.creteForm();
    this.isModalAdd = false;
  }

  getTipos() {
    this.tiposService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.tipo = dataFromAPI) });
  }

  getFondos() {
    this.isLoading = LoadingStates.trueLoading;
    this.fondosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.fondos = dataFromAPI;
        this.fondosFilter = this.fondos;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  creteForm() {
    this.fondosForm = this.formBuilder.group({
      id: [null],
      cantidad: ['',[Validators.required,]],
      periodo: ['',[Validators.required,]],
      tipo: ['', Validators.required],
    });
  }

  getTotalForGroup(startIndex: number): number {
    let total = 0;
    for (let i = startIndex; i < startIndex + 4 && i < this.fondosFilter.length; i++) {
      total += this.fondosFilter[i].cantidad;
    }
    return total;
  }

  getPercentageDifference(startIndex: number): number {
    if (startIndex < 4) {
      return 0; 
    }
    const previousTotal = this.getTotalForGroup(startIndex - 4);
    const currentTotal = this.getTotalForGroup(startIndex);
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.fondosFilter = this.fondos.filter(
      (fondos) =>
        fondos.periodo.toLowerCase().includes(valueSearch) ||
        fondos.cantidad.toExponential().includes(valueSearch)
    );
  }

  idUpdate!: number;

  setDataModalUpdate(dto: Fondos) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.fondosForm.patchValue({
      id: dto.id,
      cantidad: dto.cantidad,
      tipo: dto.tipoDistribucion.id,
      periodo: dto.periodo,
    });
  }

  editar() {
    this.fondo = this.fondosForm.value as Fondos;

    const tipo = this.fondosForm.get('tipo')?.value;

    this.fondo.tipoDistribucion = { id: tipo } as TipoDistribucion;


    this.spinnerService.show();
    this.fondosService.put(this.idUpdate, this.fondo).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Fondo actualizado correctamente');
        this.resetForm();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  deleteItem(id: number, nameItem: number) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el fondo del periodo: ${nameItem}?`,
      () => {
        this.fondosService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Fondo borrado correctamente');
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  agregar() {
    this.fondo = this.fondosForm.value as Fondos;

    const tipo = this.fondosForm.get('tipo')?.value;

    this.fondo.tipoDistribucion = { id: tipo } as TipoDistribucion;

    this.spinnerService.show();
    this.fondosService.post(this.fondo).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Fondo guardado correctamente');
        this.resetForm();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.fondosForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editar();
    } else {
      this.agregar();
    }
  }

  exportarDatosAExcel() {
    if (this.fondos.length === 0) {
      console.warn('La lista de personal está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.fondos.map((fondo) => {
      return {
        Cantidad: fondo.cantidad,
        TipoDistribucion: fondo.tipoDistribucion.nombre,
        Periodo: fondo.periodo,
      };
    });

    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(datosParaExportar);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.guardarArchivoExcel(excelBuffer, 'fondo.xlsx');
  }

  guardarArchivoExcel(buffer: any, nombreArchivo: string) {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url: string = window.URL.createObjectURL(data);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  handleChangeAdd() {
    if (this.fondosForm) {
      this.fondosForm.reset();
      this.isModalAdd = true;
    }
  }

  getYear(index: number): number {
    return 2024 + Math.floor(index / 4);
  }
}
