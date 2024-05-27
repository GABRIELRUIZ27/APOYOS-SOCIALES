import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { Area } from 'src/app/models/area';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { AreasService } from 'src/app/core/services/area.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import * as XLSX from 'xlsx';
import { ColorPickerService, Rgba } from 'ngx-color-picker';

@Component({
  selector: 'app-areas',
  template: ` <color-picker [(color)]="color"></color-picker>`,
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.css'],
})
export class AreasComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  area!: Area;
  areaForm!: FormGroup;
  areas: Area[] = [];
  areasFilter: Area[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd: boolean = true;
  formData: any;
  id!: number;
  estatusBtn = true;
  verdadero = 'Activo';
  falso = 'Inactivo';
  estatusTag = this.verdadero;
  selectedColorCode: string = '#206bc4';

  iconosTabler = [
    { name: 'Home', class: 'ti ti-home' },
    { name: 'User', class: 'ti ti-user' },
    { name: 'Settings', class: 'ti ti-settings' },
    { name: 'Building Community', class: 'ti ti-building-community' },
  ];

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private areasService: AreasService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.areasService.refreshListAreas.subscribe(() =>
      this.getAreas()
    );
    this.getAreas();
    this.creteForm();
  }

  creteForm() {
    this.areaForm = this.formBuilder.group({
      id: [null],
      icono: ['', Validators.required],
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(40),
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      estatus: [true],
      color: ['#000000', Validators.required],
    });
  }

  getAreas() {
    this.isLoading = LoadingStates.trueLoading;
    this.areasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.areas = dataFromAPI;
        this.areasFilter = this.areas;
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
    this.areasFilter = this.areas.filter(
      (area) =>
        area.nombre.toLowerCase().includes(valueSearch) ||
        area.id.toString().includes(valueSearch)
    );
    this.configPaginator.currentPage = 1;
  }

  actualizar() {
    const programaSocialData = { ...this.areaForm.value };
    this.area = programaSocialData as Area;
    this.spinnerService.show();
    this.areasService.put(this.id, this.area).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(
          'Area actualizada con éxito'
        );
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.mensajeService.mensajeError('Error al actualizar el area');
        console.error(error);
      },
    });
  }

  setDataModalUpdate(dto: Area) {
    this.isModalAdd = false;
    this.id = dto.id;
    this.areaForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      icono: dto.icono,
    });
    this.formData = this.areaForm.value;
    console.log(dto);
  }
  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el area: ${nameItem}?`,
      () => {
        this.areasService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito(
              'Programa social borrado correctamente'
            );
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  resetForm() {
    this.closebutton.nativeElement.click();
    this.areaForm.reset();
    this.areaForm.get('icono')?.setValue(null);
  }
  submit() {
    if (this.isModalAdd === false) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }

  agregar() {
    const programaSocialData = { ...this.areaForm.value };
    delete programaSocialData.id;
    this.area = programaSocialData as Area;
    this.spinnerService.show();
    this.areasService.post(this.area).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(
          'Area guardada correctamente'
        );
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }

  handleChangeAdd() {
    if (this.areaForm) {
      this.areaForm.reset();
      this.isModalAdd = true;
    }
  }

  exportarDatosAExcel() {
    if (this.areas.length === 0) {
      console.warn('La lista de areas está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.areas.map(
      (areas) => {
        return {
          Id: areas.id,
          Nombre: areas.nombre,
        };
      }
    );

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

    this.guardarArchivoExcel(excelBuffer, 'Areas.xlsx');
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

  buscar: string = '';
  areaFiltrada: any[] = [];

  filtrarAreas(): any {
    return this.areas.filter((areas) =>
      areas.nombre.toLowerCase().includes(this.buscar.toLowerCase())
    );
  }

  actualizarFiltro(event: any): void {
    this.buscar = event.target.value;
    this.areaFiltrada = this.filtrarAreas();
  }

  updateColorCode(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.selectedColorCode = target.value;
    }
  }
}
