import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { ComunidadService } from 'src/app/core/services/comunidad.service';
import { ApoyosService } from 'src/app/core/services/apoyo.service';
import { AreasService } from 'src/app/core/services/area.service';
import { GeneroService } from 'src/app/core/services/genero.service';
import { ProgramasSocialesService } from 'src/app/core/services/programas-sociales.service';
import { ProgramaSocial } from 'src/app/models/programa-social';

import { LoadingStates } from 'src/app/global/global';
import { Comunidad } from 'src/app/models/comunidad';
import { Apoyos } from 'src/app/models/apoyos';
import * as XLSX from 'xlsx';
import { Area } from 'src/app/models/area';
import { Genero } from 'src/app/models/genero';

@Component({
  selector: 'app-apoyos',
  templateUrl: './apoyos.component.html',
  styleUrls: ['./apoyos.component.css'],
})
export class ApoyosComponent {
  @ViewChild('mapCanvas') mapCanvas!: ElementRef<HTMLElement>;
  @ViewChild('closebutton') closebutton!: ElementRef;
  @ViewChild('ubicacionInput', { static: false }) ubicacionInput!: ElementRef;
  @ViewChild('searchItem') searchItem!: ElementRef;
  apoyosForm!: FormGroup;
  isModalAdd = true;
  latitude: number = 19.316818295403003;
  longitude: number = -98.23837658175323;
  canvas!: HTMLElement;
  private map: any;
  private marker: any;
  maps!: google.maps.Map;
  ApoyosFilter: Apoyos[] = [];
  Apoyos: Apoyos[] = [];
  Comunidad: Comunidad[] = [];
  Genero: Genero[] = [];
  Areas: Area [] = [];
  filteredProgramasSociales: ProgramaSocial[] = [];
  isProgramaSocialSelectEnabled = false;
  programasSociales: ProgramaSocial[] = [];
  imagenAmpliada: string | null = null;
  isLoading = LoadingStates.neutro;
  id!: number;
  public isUpdatingfoto: boolean = false;
  apoyos!: Apoyos;
  public isUpdatingImg: boolean = false;
  public imgPreview: string = '';
  areaForm!: FormGroup;
  sinProgramaMessage = '';
  apoyosSelect!: Apoyos | undefined;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private comunidadService: ComunidadService,
    private generoService: GeneroService,
    private apoyosService: ApoyosService,
    private areaService: AreasService,
    private programasSocialesService: ProgramasSocialesService,
  ) {
    this.getApoyos();
    this.apoyosService.refreshListApoyos.subscribe(() =>
      this.getApoyos()
    );
    this.creteForm();
    this.getComunidades();
    this.getAreas();
    this.getGeneros();
    this. getProgramas();
  }
  getApoyos() {
    this.isLoading = LoadingStates.trueLoading;
    this.apoyosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.Apoyos = dataFromAPI;
        this.ApoyosFilter = this.Apoyos;
        this.isLoading = LoadingStates.falseLoading;
      },
      error: (err) => {
        this.isLoading = LoadingStates.errorLoading;
        if (err.status === 401) {
          this.mensajeService.mensajeSesionExpirada();
        }
      },
    });
  }

  getProgramas() {
    this.programasSocialesService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.programasSociales = dataFromAPI) });
  }

  onAreaChange(event: any): void {
    const areaId = event ? event.id : null;
    if (areaId) {
      this.isProgramaSocialSelectEnabled = true;
      this.filteredProgramasSociales = this.programasSociales.filter(programa => programa.area.id === areaId);
      this.apoyosForm.get('programaSocial')?.enable();
    } else {
      this.isProgramaSocialSelectEnabled = false;
      this.apoyosForm.get('programaSocial')?.disable();
      this.filteredProgramasSociales = [];
    }
  }

  creteForm() {
    this.apoyosForm = this.formBuilder.group({
      id: [null],
      comunidad: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.maxLength(40)]],
      comentarios: [''],
      imagenBase64: [''],
      latitud: [],
      longitud: [],
      ubicacion: ['', Validators.required],
      area: ['', Validators.required],
      edad: ['', Validators.required],
      genero: ['', Validators.required],
      CURP: [''],
      programaSocial: ['', Validators.required],

    });
  }

  getComunidades() {
    this.comunidadService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.Comunidad = dataFromAPI) });
  }

  getGeneros() {
    this.generoService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.Genero = dataFromAPI) });
  }

  getAreas() {
    this.areaService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.Areas = dataFromAPI) });
  }

  submit() {
    if (this.isModalAdd === false) {
      this.editar();
    } else {
      this.agregar();
    }
  }
  editar() {
    this.apoyos = this.apoyosForm.value as Apoyos;

    const comunidad = this.apoyosForm.get('comunidad')?.value;
    this.apoyos.comunidad = { id: comunidad } as Comunidad;
    const area = this.apoyosForm.get('area')?.value;
    this.apoyos.area = { id: area } as Area;
    const genero = this.apoyosForm.get('genero')?.value;
    this.apoyos.genero = { id: genero } as Genero;  
    const programa = this.apoyosForm.get('programaSocial')?.value;
    this.apoyos.programaSocial = { id: programa } as ProgramaSocial;

    const imagenBase64 = this.apoyosForm.get('imagenBase64')?.value;

    this.imgPreview = '';

    if (!imagenBase64) {
      const formData = { ...this.apoyos };
      this.spinnerService.show();
      this.apoyosService.put(this.id, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Apoyo actualizado correctamente'
          );
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else if (imagenBase64) {
      const formData = {
        ...this.apoyos,
        imagenBase64,
      };
      this.spinnerService.show();
      this.apoyosService.put(this.id, formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Apoyo actualizado correctamente'
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
  }
  agregar() {
    this.apoyos = this.apoyosForm.value as Apoyos;
    const comunidad = this.apoyosForm.get('comunidad')?.value;
    this.apoyos.comunidad = { id: comunidad } as Comunidad;
    const area = this.apoyosForm.get('area')?.value;
    this.apoyos.area = { id: area } as Area;
    const genero = this.apoyosForm.get('genero')?.value;
    this.apoyos.genero = { id: genero } as Genero;
    const programa = this.apoyosForm.get('programaSocial')?.value;
    this.apoyos.programaSocial = { id: programa } as ProgramaSocial;

    this.spinnerService.show();

    console.log('data:', this.apoyos);
    const imagenBase64 = this.apoyosForm.get('imagenBase64')?.value;

    if (imagenBase64) {
      let formData = { ...this.apoyos, imagenBase64 };
      this.spinnerService.show();
      this.apoyosService.post(formData).subscribe({
        next: () => {
          this.spinnerService.hide();
          this.mensajeService.mensajeExito(
            'Apoyo guardado correctamente'
          );
          this.resetForm();
          this.configPaginator.currentPage = 1;
        },
        error: (error) => {
          this.spinnerService.hide();
          this.mensajeService.mensajeError(error);
        },
      });
    } else {
      this.spinnerService.hide();
      this.mensajeService.mensajeError(
        'Error: No se encontró una representación válida de la imagen.'
      );
    }
  }
  
  setDataModalUpdate(dto: Apoyos) {
    this.isModalAdd = false;
    this.id = dto.id;

    const apoyo = this.ApoyosFilter.find((p) => p.id === dto.id);

    this.imgPreview = apoyo!.foto;
    this.isUpdatingImg = true;

    this.apoyosForm.patchValue({
      id: dto.id,
      area: dto.area.id,
      comunidad: dto.comunidad.id,
      programa: dto.programaSocial.id,
      genero: dto.genero.id,
      nombre: dto.nombre,
      edad: dto.edad,
      CURP: dto.CURP,
      comentarios: dto.comentarios,
      latitud: dto.latitud,
      longitud: dto.longitud,
      ubicacion: dto.ubicacion,
      imagenBase64: '',
    });
    console.log('setDataUpdateForm ', this.apoyosForm.value);
    console.log('setDataUpdateDTO', dto);
  }

  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el apoyo de: ${nameItem}?`,
      () => {
        this.apoyosService.delete(id).subscribe({
          next: () => {
            this.mensajeService.mensajeExito(
              'Apoyo borrado correctamente'
            );
            this.configPaginator.currentPage = 1;
            this.searchItem.nativeElement.value = '';
          },
          error: (error) => this.mensajeService.mensajeError(error),
        });
      }
    );
  }
  mostrarImagenAmpliada(rutaImagen: string) {
    this.imagenAmpliada = rutaImagen;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }
  onFileChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.isUpdatingImg = false;
    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        const base64WithoutPrefix = base64String.split(';base64,').pop() || '';

        this.apoyosForm.patchValue({
          imagenBase64: base64WithoutPrefix, // Contiene solo la representación en base64
        });
      };
      this.isUpdatingfoto = false;
      reader.readAsDataURL(file);
    }
  }
  resetForm() {
    this.closebutton.nativeElement.click();
    this.apoyosForm.reset();
  }
  resetMap() {
    this.ubicacionInput.nativeElement.value = '';
    this.setCurrentLocation();
    this.getApoyos();
    this.ngAfterViewInit();
  }

  handleChangeAdd() {
    if (this.apoyosForm) {
      this.apoyosForm.reset();
      this.isModalAdd = true;
      this.isUpdatingfoto = false;
      this.isUpdatingImg = false;
    }
  }

  cerrarModal() {
    this.imagenAmpliada = null;
    const modal = document.getElementById('modal-imagen-ampliada');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }
  setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      });
    }
  }
  getCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        const geocoder = new google.maps.Geocoder();
        const latLng = new google.maps.LatLng(this.latitude, this.longitude);
        this.adress();
      });
    }
  }
  adress() {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(this.latitude, this.longitude);

    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK') {
        if (results && results[0]) {
          const place = results[0];
          const formattedAddress = place.formatted_address || '';

          if (formattedAddress.toLowerCase().includes('tlax')) {
            if (place.formatted_address) {
              this.apoyosForm.patchValue({
                ubicacion: place.formatted_address,
                domicilio: place.formatted_address,
              });
            } else {
              console.log('No se pudo obtener la dirección.');
            }
            this.selectAddress(place);
          } else {
            window.alert('Por favor, selecciona una dirección en Tlaxcala.');
          }
        } else {
          console.error('No se encontraron resultados de geocodificación.');
        }
      } else {
        console.error(
          'Error en la solicitud de geocodificación inversa:',
          status
        );
      }
    });
  }
  selectAddress(place: google.maps.places.PlaceResult) {
    const formattedAddress = place.formatted_address || '';
    if (formattedAddress.toLowerCase().includes('tlax')) {
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }

      if (place.formatted_address) {
        this.apoyosForm.patchValue({
          domicilio: place.formatted_address,
        });
      }

      const selectedLat = place.geometry?.location?.lat() || this.latitude;
      const selectedLng = place.geometry?.location?.lng() || this.longitude;

      this.canvas.setAttribute('data-lat', selectedLat.toString());
      this.canvas.setAttribute('data-lng', selectedLng.toString());
      const newLatLng = new google.maps.LatLng(selectedLat, selectedLng);
      this.maps.setCenter(newLatLng);
      this.maps.setZoom(15);
      if (this.marker) {
        this.marker.setMap(null);
      }
      this.marker = new google.maps.Marker({
        position: newLatLng,
        map: this.maps,
        animation: google.maps.Animation.DROP,
        title: place.name,
      });
      this.apoyosForm.patchValue({
        longitud: selectedLng,
        latitud: selectedLat,
      });
    } else {
      window.alert('Por favor, selecciona una dirección en Tlaxcala.');
    }
  }
  selectAddress2(place: google.maps.places.PlaceResult) {
    const selectedLat = this.apoyosForm.value.latitud;
    const selectedLng = this.apoyosForm.value.longitud;

    this.canvas.setAttribute('data-lat', selectedLat.toString());
    this.canvas.setAttribute('data-lng', selectedLng.toString());
    const newLatLng = new google.maps.LatLng(selectedLat, selectedLng);
    this.maps.setCenter(newLatLng);
    this.maps.setZoom(15);
    if (this.marker) {
      this.marker.setMap(null);
    }
    this.marker = new google.maps.Marker({
      position: newLatLng,
      map: this.maps,
      animation: google.maps.Animation.DROP,
      title: this.apoyosForm.value.nombres,
    });
  }
  ngAfterViewInit() {
    this.canvas = this.mapCanvas.nativeElement;

    if (!this.canvas) {
      console.error('El elemento del mapa no fue encontrado');
      return;
    }
    const input = this.ubicacionInput.nativeElement;

    const autocomplete = new google.maps.places.Autocomplete(input, {
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['geocode'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      this.selectAddress(place);
    });
    const myLatlng = new google.maps.LatLng(this.latitude, this.longitude);

    const mapOptions = {
      zoom: 13,
      scrollwheel: false,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'administrative',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#444444' }],
        },
        {
          featureType: 'landscape',
          elementType: 'all',
          stylers: [{ color: '#f2f2f2' }],
        },
        {
          featureType: 'poi',
          elementType: 'all',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'road',
          elementType: 'all',
          stylers: [{ saturation: -100 }, { lightness: 45 }],
        },
        {
          featureType: 'road.highway',
          elementType: 'all',
          stylers: [{ visibility: 'simplified' }],
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels.icon',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'all',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#0ba4e2' }, { visibility: 'on' }],
        },
      ],
    };

    this.maps = new google.maps.Map(this.canvas, mapOptions);

    google.maps.event.addListener(
      this.maps,
      'click',
      (event: google.maps.KmlMouseEvent) => {
        this.handleMapClick(event);
      }
    );
  }

  handleMapClick(
    event: google.maps.KmlMouseEvent | google.maps.IconMouseEvent
  ) {
    if (event.latLng) {
      this.latitude = event.latLng.lat();
      this.longitude = event.latLng.lng();
      this.apoyosForm.patchValue({
        latitud: this.latitude,
        longitud: this.longitude,
      });
    } else {
      console.error('No se pudo obtener la posición al hacer clic en el mapa.');
    }
    this.adress();
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    const valueSearch = inputValue.toLowerCase();

    console.log('Search Value:', valueSearch);

    this.ApoyosFilter = this.Apoyos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(valueSearch) ||
        p.comunidad.nombre.toLowerCase().includes(valueSearch) ||
        p.area.nombre.toLowerCase().includes(valueSearch) ||
        p.ubicacion.toString().includes(valueSearch)
    );

    console.log('Filtered:', this.ApoyosFilter);

    this.configPaginator.currentPage = 1;
  }
  exportarDatosAExcel() {
    if (this.Areas.length === 0) {
      console.warn(
        'La lista de apoyos está vacía, no se puede exportar.'
      );
      return;
    }

    const datosParaExportar = this.Apoyos.map((p) => {
      return {
        Nombre: p.nombre,
        Comunidad: p.comunidad.nombre,
        Area: p.area.nombre,
        Comentarios: p.comentarios,
        ubicacion: p.ubicacion,
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

    this.guardarArchivoExcel(excelBuffer, 'Apoyos.xlsx');
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
  mapa() {
    this.setCurrentLocation();
    const dummyPlace: google.maps.places.PlaceResult = {
      geometry: {
        location: new google.maps.LatLng(0, 0),
      },
      formatted_address: '',
      name: '',
    };

    this.selectAddress2(dummyPlace);
  }

  onSelectPrograma(id: number | null) {
    this.apoyosSelect = this.Apoyos.find(
      (v) => v.area.id === id
    );

    if (this.apoyosSelect) {
      const valueSearch2 =
        this.apoyosSelect.area.nombre.toLowerCase();
      console.log('Search Value:', valueSearch2);

      // Filtrar los votantes
      this.ApoyosFilter = this.Apoyos.filter((personal) =>
        personal.area.nombre
          .toLowerCase()
          .includes(valueSearch2)
      );
      this.sinProgramaMessage = '';
      console.log('Filtered Votantes:', this.ApoyosFilter);

      // Verificar si votantesFilter es null o vacío
      if (!this.ApoyosFilter || this.ApoyosFilter.length === 0) {
        this.ApoyosFilter = [];
      }
      this.configPaginator.currentPage = 1;
    } else {
      this.sinProgramaMessage = 'No se encontrararon apoyos.';
      // Si no se encuentra el votante seleccionado, establecer votantesFilter como un array vacío
      this.ApoyosFilter = [];
    }
  }

  onClear() {
    if (this.Apoyos) {
      this.getApoyos();
    }
    this.sinProgramaMessage = '';
  }

  creteForm2() {
    this.areaForm = this.formBuilder.group({
      areaId: [],
    });
  }
}
