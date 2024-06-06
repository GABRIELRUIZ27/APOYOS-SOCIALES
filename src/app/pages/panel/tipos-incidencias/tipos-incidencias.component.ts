
import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { TiposIncidencias } from 'src/app/models/tipos-incidecias';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { TipoIncidenciaService } from 'src/app/core/services/tipoIncidencias.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import * as XLSX from 'xlsx';
import { ColorPickerService, Rgba } from 'ngx-color-picker';

@Component({
  selector: 'app-tipos-incidencias',
  templateUrl: './tipos-incidencias.component.html',
  styleUrls: ['./tipos-incidencias.component.css']
})
export class TiposIncidenciasComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  tipo!: TiposIncidencias;
  tipoForm!: FormGroup;
  tipos: TiposIncidencias[] = [];
  tiposFilter: TiposIncidencias[] = [];
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
    { name: 'Accidente', class: 'ti ti-car-crash' },
    { name: 'Caida de arbol', class: 'ti ti-trees' },
    { name: 'Incendio', class: 'ti ti-flame' } 
  ];
  
  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private tipoIncidenciaService: TipoIncidenciaService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder
  ) {
    this.tipoIncidenciaService.refreshListIncidencia.subscribe(() =>
      this.getTipos()
    );
    this.getTipos();
    this.creteForm();
  }

  creteForm() {
    this.tipoForm = this.formBuilder.group({
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

  getTipos() {
    this.isLoading = LoadingStates.trueLoading;
    this.tipoIncidenciaService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.tipos = dataFromAPI;
        this.tiposFilter = this.tipos;
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
    this.tiposFilter = this.tipos.filter(
      (tipo) =>
        tipo.nombre.toLowerCase().includes(valueSearch) ||
        tipo.id.toString().includes(valueSearch)
    );
    this.configPaginator.currentPage = 1;
  }

  actualizar() {
    const programaSocialData = { ...this.tipoForm.value };
    this.tipo = programaSocialData as TiposIncidencias;
    this.spinnerService.show();
    this.tipoIncidenciaService.put(this.id, this.tipo).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(
          'Tipo de incidencia actualizada con éxito'
        );
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.mensajeService.mensajeError('Error al actualizar el tipo de incidencia');
        console.error(error);
      },
    });
  }

  setDataModalUpdate(dto: TiposIncidencias) {
    this.isModalAdd = false;
    this.id = dto.id;
    this.tipoForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      icono: dto.icono,
    });
    this.formData = this.tipoForm.value;
    console.log(dto);
  }
  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el tipo de incidencia: ${nameItem}?`,
      () => {
        this.tipoIncidenciaService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito(
              'Tipo de incidencia borrada correctamente'
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
    this.tipoForm.reset();
    this.tipoForm.get('icono')?.setValue(null);
  }
  submit() {
    if (this.isModalAdd === false) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }

  agregar() {
    const programaSocialData = { ...this.tipoForm.value };
    delete programaSocialData.id;
    this.tipo = programaSocialData as TiposIncidencias;
    this.spinnerService.show();
    this.tipoIncidenciaService.post(this.tipo).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(
          'Tipo de incidencia guardada correctamente'
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
    if (this.tipoForm) {
      this.tipoForm.reset();
      this.isModalAdd = true;
    }
  }

  exportarDatosAExcel() {
    if (this.tipos.length === 0) {
      console.warn('La lista de tipos de incidencias está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.tipos.map(
      (tipos) => {
        return {
          Id: tipos.id,
          Nombre: tipos.nombre,
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

    this.guardarArchivoExcel(excelBuffer, 'TiposIncidencias.xlsx');
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

  filtrarTipos(): any {
    return this.tipos.filter((tipos) =>
      tipos.nombre.toLowerCase().includes(this.buscar.toLowerCase())
    );
  }

  actualizarFiltro(event: any): void {
    this.buscar = event.target.value;
    this.areaFiltrada = this.filtrarTipos();
  }

  updateColorCode(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.selectedColorCode = target.value;
    }
  }
}
