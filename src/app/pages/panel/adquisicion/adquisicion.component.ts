import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { AreasService } from 'src/app/core/services/area.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { AdquisicionService } from 'src/app/core/services/adquisicion.service';
import { LoadingStates } from 'src/app/global/global';
import { Area } from 'src/app/models/area';
import { Adquisicion } from 'src/app/models/adquisicion';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-adqisicion',
  templateUrl: './adquisicion.component.html',
  styleUrls: ['./adquisicion.component.css'],
})
export class AdquisicionComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  adquisicion!: Adquisicion;
  adquisicionesForm!: FormGroup;
  adquisiciones: Adquisicion[] = [];
  adquisicionesFilter: Adquisicion[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd = true;
  areas: Area[] = []; 
  areaForm!: FormGroup;
  sinProgramaMessage = '';
  adquisicionSelect!: Adquisicion | undefined;
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private adquisicionService: AdquisicionService,
    private areasService: AreasService,

  ) {
    this.adquisicionService.refreshListAdquisicion.subscribe(() => this.getAdquisicion());
    this.getAdquisicion();
    this.getAreas();
    this.creteForm();
    this.isModalAdd = false;
  }

  getAreas() {
    this.areasService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.areas = dataFromAPI) });
  }

  creteForm() {
    this.adquisicionesForm = this.formBuilder.group({
      id: [null],
      nombre: ['',Validators.required],
      marca: ['',Validators.required],
      area: ['',Validators.required],
      proveedor: ['', Validators.required],
      folio: [''],
      cantidad: ['', Validators.required],
      precioUnitario: ['', Validators.required],
      precioTotal: ['', Validators.required],
      fechaAdquisicion: ['', Validators.required],
    });
  }

  getAdquisicion() {
    this.isLoading = LoadingStates.trueLoading;
    this.adquisicionService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.adquisiciones = dataFromAPI;
        this.adquisicionesFilter = this.adquisiciones;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: () => {
        this.isLoading = LoadingStates.errorLoading;
      },
    });
  }

  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    this.adquisicionesFilter = this.adquisiciones.filter(
      (adquisicion) =>
        adquisicion.nombre.toLowerCase().includes(valueSearch) ||
        adquisicion.area.nombre.toLowerCase().includes(valueSearch) ||
        adquisicion.folio?.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

  idUpdate!: number;

  setDataModalUpdate(dto: Adquisicion) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.adquisicionesForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      folio: dto.folio,
      cantidad: dto.cantidad,
      precioUnitario: dto.precioUnitario,
      precioTotal: dto.precioTotal,
      marca: dto.marca,
      proveedor: dto.proveedor,
      fechaAdquisicion: dto.fechaAdquisicion,
      area: dto.area.id,
    });
  }

  editar() {
    this.adquisicion = this.adquisicionesForm.value as Adquisicion;

    const area = this.adquisicionesForm.get('area')?.value;

    this.adquisicion.area = { id: area } as Area;

    this.spinnerService.show();
    this.adquisicionService.put(this.idUpdate, this.adquisicion).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Adquisición actualizada correctamente');
        this.resetForm();
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar a: ${nameItem}?`,
      () => {
        this.adquisicionService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Adquisicion borrada correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  agregar() {
    this.adquisicion = this.adquisicionesForm.value as Adquisicion;
    const area = this.adquisicionesForm.get('area')?.value;

    this.adquisicion.area = { id: area } as Area;

    this.spinnerService.show();
    this.adquisicionService.post(this.adquisicion).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Adquisición guardada correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.adquisicionesForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editar();
    } else {
      this.agregar();
    }
  }

  exportarDatosAExcel() {
    if (this.adquisiciones.length === 0) {
      console.warn('La lista de adquisiciones está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.adquisiciones.map((adquisicion) => {
      return {
        Nombre: adquisicion.nombre,
        Folio: adquisicion.folio,
        Cantidad: adquisicion.cantidad,
        Area: adquisicion.area.nombre,
        PrecioUnitario: adquisicion.precioUnitario,
        PrecioTotal: adquisicion.precioTotal,
        Proveedor: adquisicion.proveedor,
        Marca: adquisicion.marca,
        Fecha_Adquisición: adquisicion.fechaAdquisicion,
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

    this.guardarArchivoExcel(excelBuffer, 'adquisiciones.xlsx');
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
    if (this.adquisicionesForm) {
      this.adquisicionesForm.reset();
      this.isModalAdd = true;
    }
  }

  updateTotal(): void {
    const cantidad = this.adquisicionesForm.get('cantidad')?.value || 0;
    const precioUnitario = this.adquisicionesForm.get('precioUnitario')?.value || 0;
    const precioTotal = cantidad * precioUnitario;
    this.adquisicionesForm.get('precioTotal')?.setValue(precioTotal.toFixed(2));
  }

  onSelectPrograma(id: number | null) {
    this.adquisicionSelect = this.adquisiciones.find(
      (v) => v.area.id === id
    );

    if (this.adquisicionSelect) {
      const valueSearch2 =
        this.adquisicionSelect.area.nombre.toLowerCase();
      console.log('Search Value:', valueSearch2);

      // Filtrar los votantes
      this.adquisicionesFilter = this.adquisiciones.filter((adquisicion) =>
        adquisicion.area.nombre
          .toLowerCase()
          .includes(valueSearch2)
      );
      this.sinProgramaMessage = '';
      console.log('Filtered Votantes:', this.adquisicionesFilter);

      // Verificar si votantesFilter es null o vacío
      if (!this.adquisicionesFilter || this.adquisicionesFilter.length === 0) {
        this.adquisicionesFilter = [];
      }
      this.configPaginator.currentPage = 1;
    } else {
      this.sinProgramaMessage = 'No se encontraron adquisiciones.';
      // Si no se encuentra el votante seleccionado, establecer votantesFilter como un array vacío
      this.adquisicionesFilter = [];
    }
  }

  onClear() {
    if (this.adquisiciones) {
      this.getAdquisicion();
    }
    this.sinProgramaMessage = '';
  }

  creteForm2() {
    this.areaForm = this.formBuilder.group({
      areaId: [],
    });
  }
}
