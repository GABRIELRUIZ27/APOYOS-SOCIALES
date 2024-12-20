import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingStates } from 'src/app/global/global';
import { ProgramaSocial } from 'src/app/models/programa-social';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProgramasSocialesService } from 'src/app/core/services/programas-sociales.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import * as XLSX from 'xlsx';
import { Area } from 'src/app/models/area';
import { AreasService } from 'src/app/core/services/area.service';

@Component({
  selector: 'app-programas-sociales',
  templateUrl: './programas-sociales.component.html',
  styleUrls: ['./programas-sociales.component.css'],
})
export class ProgramasSocialesComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  programaSocial!: ProgramaSocial;
  programaSocialForm!: FormGroup;
  programaSelect!: ProgramaSocial | undefined;
  programasSociales: ProgramaSocial[] = [];
  programasSocialesFilter: ProgramaSocial[] = [];
  isLoading = LoadingStates.neutro;
  isModalAdd: boolean = true;
  formData: any;
  id!: number;
  estatusBtn = true;
  verdadero = 'Activo';
  falso = 'Inactivo';
  estatusTag = this.verdadero;
  Areas: Area [] = [];
  sinProgramaMessage = '';
  areaForm!: FormGroup;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private programasSocialesService: ProgramasSocialesService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private areaService: AreasService,
  ) {
    this.programasSocialesService.refreshListProgramasSociales.subscribe(() =>
      this.getProgramasSociales()
    );
    this.getProgramasSociales();
    this.creteForm();
    this.getAreas();
  }

  creteForm() {
    this.programaSocialForm = this.formBuilder.group({
      id: [null],
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      estatus: [true],
      area: ['', Validators.required],
    });
  }

  getProgramasSociales() {
    this.isLoading = LoadingStates.trueLoading;
    this.programasSocialesService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.programasSociales = dataFromAPI;
        this.programasSocialesFilter = this.programasSociales;
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

  getAreas() {
    this.areaService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.Areas = dataFromAPI) });
  }

  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();
    this.programasSocialesFilter = this.programasSociales.filter(
      (programa) =>
        programa.nombre.toLowerCase().includes(valueSearch) ||
        programa.id.toString().includes(valueSearch)
    );
    this.configPaginator.currentPage = 1;
  }

  actualizar() {
    const programaSocialData = { ...this.programaSocialForm.value };
    this.programaSocial = programaSocialData as ProgramaSocial;
    const area = this.programaSocialForm.get('area')?.value;
    this.programaSocial.area = { id: area } as Area;

    this.spinnerService.show();
    this.programasSocialesService.put(this.id, this.programaSocial).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito(
          'Programa social actualizado con éxito'
        );
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.mensajeService.mensajeError('Error al actualizar programa social');
        console.error(error);
      },
    });
  }

  setDataModalUpdate(dto: ProgramaSocial) {
    this.isModalAdd = false;
    this.id = dto.id;
    this.programaSocialForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      estatus: dto.estatus,
      area: dto.area.id
    });
    this.formData = this.programaSocialForm.value;
    console.log(dto);
  }
  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el programa social: ${nameItem}?`,
      () => {
        this.programasSocialesService.delete(id).subscribe({
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
    this.programaSocialForm.reset();
  }
  submit() {
    if (this.isModalAdd === false) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }

  agregar() {
    this.programaSocial = this.programaSocialForm.value as ProgramaSocial;
    const area = this.programaSocialForm.get('area')?.value;

    this.programaSocial.area = { id: area } as Area;
    this.spinnerService.show();
    this.programasSocialesService.post(this.programaSocial).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Programa guardado correctamente');
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
    if (this.programaSocialForm) {
      this.programaSocialForm.reset();
      const estatusControl = this.programaSocialForm.get('estatus');
      if (estatusControl) {
        estatusControl.setValue(true);
      }
      this.isModalAdd = true;
    }
  }

  setEstatus() {
    this.estatusTag = this.estatusBtn ? this.verdadero : this.falso;
  }
  exportarDatosAExcel() {
    if (this.programasSociales.length === 0) {
      console.warn('La lista de usuarios está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.programasSociales.map(
      (programasSociales) => {
        return {
          Id: programasSociales.id,
          Nombre: programasSociales.nombre,
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

    this.guardarArchivoExcel(excelBuffer, 'Programas sociales.xlsx');
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

  toggleEstatus() {
    const estatusControl = this.programaSocialForm.get('Estatus');

    if (estatusControl) {
      estatusControl.setValue(estatusControl.value === 1 ? 0 : 1);
    }
  }

  buscar: string = '';
  beneficiarioFiltrado: any[] = [];

  filtrarBeneficiario(): any {
    return this.programasSociales.filter((programasSociales) =>
      programasSociales.nombre.toLowerCase().includes(this.buscar.toLowerCase())
    );
  }
  actualizarFiltro(event: any): void {
    this.buscar = event.target.value;
    this.beneficiarioFiltrado = this.filtrarBeneficiario();
  }

  onSelectPrograma(id: number | null) {
    this.programaSelect = this.programasSociales.find(
      (v) => v.area.id === id
    );

    if (this.programaSelect) {
      const valueSearch2 =
        this.programaSelect.area.nombre.toLowerCase();
      console.log('Search Value:', valueSearch2);

      // Filtrar los votantes
      this.programasSocialesFilter = this.programasSociales.filter((programaSocial) =>
        programaSocial.area.nombre
          .toLowerCase()
          .includes(valueSearch2)
      );
      this.sinProgramaMessage = '';
      console.log('Filtered Votantes:', this.programasSocialesFilter);

      // Verificar si votantesFilter es null o vacío
      if (!this.programasSocialesFilter || this.programasSocialesFilter.length === 0) {
        this.programasSocialesFilter = [];
      }
      this.configPaginator.currentPage = 1;
    } else {
      this.sinProgramaMessage = 'No se encontraron programas sociales.';
      // Si no se encuentra el votante seleccionado, establecer votantesFilter como un array vacío
      this.programasSocialesFilter = [];
    }
  }

  onClear() {
    if (this.programasSociales) {
      this.getProgramasSociales();
    }
    this.sinProgramaMessage = '';
  }

  creteForm2() {
    this.areaForm = this.formBuilder.group({
      areaId: [],
    });
  }
}
