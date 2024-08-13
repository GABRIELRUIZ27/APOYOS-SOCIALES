import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { AreasService } from 'src/app/core/services/area.service';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { GeneroService } from 'src/app/core/services/genero.service';
import { CargoService } from 'src/app/core/services/cargo.service';
import { PersonalService } from 'src/app/core/services/personal.service';
import { LoadingStates } from 'src/app/global/global';
import { Area } from 'src/app/models/area';
import { Genero } from 'src/app/models/genero';
import { Personal } from 'src/app/models/personal';
import * as XLSX from 'xlsx';
import { Cargo } from 'src/app/models/cargo';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css'],
})
export class PersonalComponent {
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;

  personal!: Personal;
  personalForm!: FormGroup;
  personales: Personal[] = [];
  personalFilter: Personal[] = [];
  isLoading = LoadingStates.neutro;
  genero: Genero[] = [];
  isModalAdd = true;
  areas: Area[] = []; 
  cargos: Cargo[] = []; 
  areaForm!: FormGroup;
  sinProgramaMessage = '';
  personalSelect!: Personal | undefined;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private personalService: PersonalService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private generoService: GeneroService,
    private areasService: AreasService,
    private cargoService: CargoService,

  ) {
    this.personalService.refreshListPersonal.subscribe(() => this.getPersonal());
    this.getPersonal();
    this.getGeneros();
    this.getAreas();
    this.creteForm();
    this.getCargos();
    this.isModalAdd = false;
  }

  getAreas() {
    this.areasService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.areas = dataFromAPI) });
  }

  getCargos() {
    this.cargoService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.cargos = dataFromAPI) });
  }

  getGeneros() {
    this.generoService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.genero = dataFromAPI) });
  }

  creteForm() {
    this.personalForm = this.formBuilder.group({
      id: [null],
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(22),
          Validators.minLength(2),
          Validators.pattern(
            /^([a-zA-ZÀ-ÿ\u00C0-\u00FF]{2})[a-zA-ZÀ-ÿ\u00C0-\u00FF ]+$/
          ),
        ],
      ],
      cargo: [
        '',
        [
          Validators.required,
        ],
      ],
      edad: ['', Validators.required],
      salario: ['', Validators.required],
      genero: ['', Validators.required],
      area: [''],
      fechaContratacion: ['', Validators.required],
    });
  }

  getPersonal() {
    this.isLoading = LoadingStates.trueLoading;
    this.personalService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.personales = dataFromAPI;
        this.personalFilter = this.personales;
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

    this.personalFilter = this.personales.filter(
      (personal) =>
        personal.nombre.toLowerCase().includes(valueSearch) ||
        personal.edad.toLowerCase().includes(valueSearch) ||
        personal.cargo.nombre.toLowerCase().includes(valueSearch)
    );

    this.configPaginator.currentPage = 1;
  }

  idUpdate!: number;

  setDataModalUpdate(dto: Personal) {
    this.isModalAdd = false;
    this.idUpdate = dto.id;
    this.personalForm.patchValue({
      id: dto.id,
      nombre: dto.nombre,
      cargo: dto.cargo.id,
      edad: dto.edad,
      salario: dto.salario,
      fechaContratacion: dto.fechaContratacion,
      genero: dto.genero.id,
      area: dto.area?.id,
    });
  }

  editarPersonal() {
    this.personal = this.personalForm.value as Personal;

    const genero = this.personalForm.get('genero')?.value;
    const area = this.personalForm.get('area')?.value;
    const cargo = this.personalForm.get('cargo')?.value;

    this.personal.genero = { id: genero } as Genero;
    this.personal.area = { id: area } as Area;
    this.personal.cargo = { id: cargo } as Cargo;

    this.spinnerService.show();
    this.personalService.put(this.idUpdate, this.personal).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Personal actualizado correctamente');
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
        this.personalService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito('Personal borrado correctamente');
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }

  agregar() {
    this.personal = this.personalForm.value as Personal;
    const genero = this.personalForm.get('genero')?.value;
    const area = this.personalForm.get('area')?.value;
    const cargo = this.personalForm.get('cargo')?.value;

    this.personal.area = { id: area } as Area;
    this.personal.genero = { id: genero } as Genero;
    this.personal.cargo = { id: cargo } as Cargo;

    this.spinnerService.show();
    this.personalService.post(this.personal).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Personal guardado correctamente');
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
    this.personalForm.reset();
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editarPersonal();
    } else {
      this.agregar();
    }
  }

  exportarDatosAExcel() {
    if (this.personales.length === 0) {
      console.warn('La lista de personal está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.personales.map((personal) => {
      return {
        Nombre: personal.nombre,
        Cargo: personal.cargo,
        Genero: personal.genero.nombre,
        Area: personal.area.nombre,
        Edad: personal.edad,
        Salario: personal.salario,
        Fecha_Contratacion: personal.fechaContratacion,
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

    this.guardarArchivoExcel(excelBuffer, 'personal.xlsx');
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
    if (this.personalForm) {
      this.personalForm.reset();
      this.isModalAdd = true;
    }
  }

  onSelectPrograma(id: number | null) {
    this.personalSelect = this.personales.find(
      (v) => v.area.id === id
    );

    if (this.personalSelect) {
      const valueSearch2 =
        this.personalSelect.area.nombre.toLowerCase();
      console.log('Search Value:', valueSearch2);

      // Filtrar los votantes
      this.personalFilter = this.personales.filter((personal) =>
        personal.area.nombre
          .toLowerCase()
          .includes(valueSearch2)
      );
      this.sinProgramaMessage = '';
      console.log('Filtered Votantes:', this.personalFilter);

      // Verificar si votantesFilter es null o vacío
      if (!this.personalFilter || this.personalFilter.length === 0) {
        this.personalFilter = [];
      }
      this.configPaginator.currentPage = 1;
    } else {
      this.sinProgramaMessage = 'No se encontraro personal.';
      // Si no se encuentra el votante seleccionado, establecer votantesFilter como un array vacío
      this.personalFilter = [];
    }
  }

  onClear() {
    if (this.personales) {
      this.getPersonal();
    }
    this.sinProgramaMessage = '';
  }

  creteForm2() {
    this.areaForm = this.formBuilder.group({
      areaId: [],
    });
  }
}
