import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationInstance } from 'ngx-pagination';
import { NgxSpinnerService } from 'ngx-spinner';
import { MensajeService } from 'src/app/core/services/mensaje.service';
import { ComunidadService } from 'src/app/core/services/comunidad.service';
import { SolicitudesService } from 'src/app/core/services/solicitudes.service';
import { AreasService } from 'src/app/core/services/area.service';
import { GeneroService } from 'src/app/core/services/genero.service';
import { ProgramasSocialesService } from 'src/app/core/services/programas-sociales.service';
import { ProgramaSocial } from 'src/app/models/programa-social';

import { LoadingStates } from 'src/app/global/global';
import { Comunidad } from 'src/app/models/comunidad';
import { Solicitud } from 'src/app/models/solicitud';
import * as XLSX from 'xlsx';
import { Area } from 'src/app/models/area';
import { Genero } from 'src/app/models/genero';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css'],
})
export class SolicitudesComponent {
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
  SolicitudesFilter: Solicitud[] = [];
  Solicitudes: Solicitud[] = [];
  Comunidad: Comunidad[] = [];
  Genero: Genero[] = [];
  Areas: Area [] = [];
  filteredProgramasSociales: ProgramaSocial[] = [];
  isProgramaSocialSelectEnabled = false;
  programasSociales: ProgramaSocial[] = [];
  isLoading = LoadingStates.neutro;
  id!: number;
  solicitudes!: Solicitud;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private spinnerService: NgxSpinnerService,
    private mensajeService: MensajeService,
    private formBuilder: FormBuilder,
    private comunidadService: ComunidadService,
    private generoService: GeneroService,
    private solicitudService: SolicitudesService,
    private areaService: AreasService,
    private programasSocialesService: ProgramasSocialesService,
  ) {
    this.getApoyos();
    this.solicitudService.refreshListSolicitudes.subscribe(() =>
      this.getApoyos()
    );
    this.creteForm();
    this.getComunidades();
    this.getAreas();
    this.getGeneros();
    this. getProgramas();
  }

  idUpdate!: number;

  aprobar(idUpdate: number, dto: Solicitud) {
    this.id = idUpdate; 
  
    this.solicitudes = {
      ...this.apoyosForm.value as Solicitud,
      estatus: true,  
      genero: { id: this.apoyosForm.get('genero')?.value } as Genero,
      area: { id: this.apoyosForm.get('area')?.value } as Area,
      comunidad: { id: this.apoyosForm.get('comunidad')?.value } as Comunidad,
      programaSocial: { id: this.apoyosForm.get('programaSocial')?.value } as ProgramaSocial
    };
  
    this.spinnerService.show();
    this.solicitudService.put(this.id, this.solicitudes).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Solicitud aprobada');
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }
  
  rechazar(idUpdate: number, dto: Solicitud) {
    this.id = idUpdate; 
  
    this.solicitudes = {
      ...this.apoyosForm.value as Solicitud,
      estatus: false,  
      genero: { id: this.apoyosForm.get('genero')?.value } as Genero,
      area: { id: this.apoyosForm.get('area')?.value } as Area,
      comunidad: { id: this.apoyosForm.get('comunidad')?.value } as Comunidad,
      programaSocial: { id: this.apoyosForm.get('programaSocial')?.value } as ProgramaSocial
    };
  
    this.spinnerService.show();
    this.solicitudService.put(this.id, this.solicitudes).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeRechazado('Solicitud rechazada');
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }
  getApoyos() {
    this.isLoading = LoadingStates.trueLoading;
    this.solicitudService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.Solicitudes = dataFromAPI;
        this.SolicitudesFilter = this.Solicitudes;
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
      nombre: ['', [Validators.required, Validators.maxLength(25)]],
      latitud: [],
      longitud: [],
      ubicacion: ['', Validators.required],
      area: ['', Validators.required],
      edad: ['', Validators.required],
      genero: ['', Validators.required],
      CURP: ['', Validators.required],
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
      
    } else {
      this.agregar();
    }
  }

  agregar() {
    this.solicitudes = this.apoyosForm.value as Solicitud;
    const comunidad = this.apoyosForm.get('comunidad')?.value;
    this.solicitudes.comunidad = { id: comunidad } as Comunidad;
    const area = this.apoyosForm.get('area')?.value;
    this.solicitudes.area = { id: area } as Area;
    const genero = this.apoyosForm.get('genero')?.value;
    this.solicitudes.genero = { id: genero } as Genero;
    const programa = this.apoyosForm.get('programaSocial')?.value;
    this.solicitudes.programaSocial = { id: programa } as ProgramaSocial;

    this.spinnerService.show();
    this.solicitudService.post(this.solicitudes).subscribe({
      next: () => {
        this.spinnerService.hide();
        this.mensajeService.mensajeExito('Solicitud enviada correctamente');
        this.resetForm();
        this.configPaginator.currentPage = 1;
      },
      error: (error) => {
        this.spinnerService.hide();
        this.mensajeService.mensajeError(error);
      },
    });
  }
  
  setDataModalUpdate(dto: Solicitud) {
    this.isModalAdd = false;
    this.id = dto.id;

    // Filtrar programas sociales según el área
    this.onAreaChange({ id: dto.area.id });

    // Buscar el apoyo en base al id
    const apoyo = this.SolicitudesFilter.find((p) => p.id === dto.id);

    // Actualizar el formulario
    this.apoyosForm.patchValue({
      id: dto.id,
      area: dto.area.id,
      comunidad: dto.comunidad.id,
      programaSocial: dto.programaSocial.id,  // Asegúrate de que el programa está en los programas filtrados
      genero: dto.genero.id,
      nombre: dto.nombre,
      edad: dto.edad,
      CURP: dto.curp,
      latitud: dto.latitud,
      longitud: dto.longitud,
      ubicacion: dto.ubicacion,
    });

    console.log('setDataUpdateForm ', this.apoyosForm.value);
    console.log('setDataUpdateDTO', dto);
}


  deleteItem(id: number, nameItem: string) {
    this.mensajeService.mensajeAdvertencia(
      `¿Estás seguro de eliminar el apoyo de: ${nameItem}?`,
      () => {
        this.solicitudService.delete(id).subscribe({
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

    this.SolicitudesFilter = this.Solicitudes.filter(
      (p) =>
        p.nombre.toLowerCase().includes(valueSearch) ||
        p.comunidad.nombre.toLowerCase().includes(valueSearch) ||
        p.area.nombre.toLowerCase().includes(valueSearch) ||
        p.ubicacion.toString().includes(valueSearch)
    );

    console.log('Filtered:', this.SolicitudesFilter);

    this.configPaginator.currentPage = 1;
  }
  exportarDatosAExcel() {
    if (this.Areas.length === 0) {
      console.warn(
        'La lista de apoyos está vacía, no se puede exportar.'
      );
      return;
    }

    const datosParaExportar = this.Solicitudes.map((p) => {
      return {
        Nombre: p.nombre,
        Comunidad: p.comunidad.nombre,
        Area: p.area.nombre,
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

    this.guardarArchivoExcel(excelBuffer, 'Solicitudes.xlsx');
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

  
}
