import { AfterViewInit, Component, Inject } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { ApoyosService } from 'src/app/core/services/apoyo.service';
import { LoadingStates, RolesBD } from 'src/app/global/global';
import { Apoyos } from 'src/app/models/apoyos';
import * as XLSX from 'xlsx';
import { SecurityService } from 'src/app/core/services/security.service';
import { AppUserAuth } from 'src/app/models/login';
import { FormBuilder, FormGroup } from '@angular/forms';
declare const google: any;

@Component({
  selector: 'app-mapa-apoyos',
  templateUrl: './mapa-apoyos.component.html',
  styleUrls: ['./mapa-apoyos.component.css'],
})
export class MapaApoyosComponent implements AfterViewInit {
  map: any = {};
  infowindow = new google.maps.InfoWindow();
  markers: google.maps.Marker[] = [];
  apoyos: Apoyos[] = [];
  apoyosFiltradas: Apoyos[] = [];
  sinIncidencias: boolean = true;
  isLoadingModalIncidencias = LoadingStates.neutro;
  pagModalPromovidos: number = 1;
  initialValueModalSearchSecciones: string = '';
  initialValueModalSearchPromovidos: string = '';
  readonlySelectCandidato = true;
  currentUser!: AppUserAuth | null;
  mapaForm!: FormGroup;
  candidatoId = 0;

  constructor(
    @Inject('CONFIG_PAGINATOR') public configPaginator: PaginationInstance,
    private apoyosService: ApoyosService,
    private securityService: SecurityService,
    private formBuilder: FormBuilder
  ) {
    this.getApoyos();
    this.currentUser = securityService.getDataUser();
    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.candidatoId = this.currentUser?.candidatoId;
    }
    this.readonlySelectCandidato =
      this.currentUser?.rolId !== RolesBD.administrador;
    if (this.currentUser?.rolId === RolesBD.candidato) {
      this.mapaForm.controls['candidatoId'].setValue(this.candidatoId);
    }
  }
  onPageChange(number: number) {
    this.configPaginator.currentPage = number;
  }
  creteForm2() {
    this.mapaForm = this.formBuilder.group({
      candidatoId: [],
      promovidos: [],
    });
  }

  ngAfterViewInit() {
    const mapElement = document.getElementById('map-canvas') || null;
    const lat = mapElement?.getAttribute('data-lat') || null;
    const lng = mapElement?.getAttribute('data-lng') || null;
    const myLatlng = new google.maps.LatLng(lat, lng);

    const mapOptions = {
      zoom: 10,
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
    this.map = new google.maps.Map(mapElement, mapOptions);
  }

  getApoyos() {
    this.apoyosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.apoyos = dataFromAPI;
        this.apoyosFiltradas = this.apoyos;
        this.setAllMarkers();
      },
    });
  }
  getType(id: number) {
    this.pagModalPromovidos = 1;
    const modal = document.getElementById('modal-simpatizantes');
    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
    }
  }

  clearInputModalSearch() {
    this.initialValueModalSearchSecciones = '';
    this.initialValueModalSearchPromovidos = '';
  }
  cerrarModal2() {
    this.clearInputModalSearch();
    const modal = document.getElementById('modal-simpatizantes');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
    }
  }

  setAllMarkers() {
    this.clearMarkers();
    this.apoyos.forEach((apoyos) => {
      this.setInfoWindow(
        this.getMarker(apoyos),
        this.getContentString(apoyos)
      );
    });
  }

  getContentString(apoyos: Apoyos) {
    return `
<div style="width: 350px; height: auto;" class="text-center">
  <img src="${apoyos.foto}" alt="Imagen de incidencia" style="width: 100%; height: auto;">
            <div class="px-4 py-4">
          <p style="font-weight:  bolder;" class=" ">
          Nombre del beneficiario:
          <p class="text-muted ">
            ${apoyos.nombre}
          </p>
            Area:
            <p class="text-muted ">
              ${apoyos.area.nombre}
            </p>
          </p>            
          <p style="font-weight:  bolder;" class=" ">
            Comunidad:
            <p class="text-muted ">
              ${apoyos.comunidad.nombre}
            </p>
          </p>
          <p style="font-weight:  bolder;" class=" ">
            Comentarios:
            <p class="text-muted ">
              ${apoyos.comentarios}
            </p>
          </p>
          <p style="font-weight:  bolder;" class="">
            Dirección:
            <p class=" text-muted">
              ${apoyos.ubicacion}
            </p>
          </p>
        </div>
      </div>
    `;
  }

  getMarker(apoyos: Apoyos) {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(
        apoyos.latitud,
        apoyos.longitud
      ),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: apoyos.area.color,
        fillOpacity: 1,
        scale: 6,
        strokeWeight: 0,
      },
      title: `${apoyos.area.nombre}`,
    });
    this.markers.push(marker);
    return marker;
  }

  setInfoWindow(marker: any, contentString: string) {
    google.maps.event.addListener(marker, 'click', () => {
      if (this.infowindow && this.infowindow.getMap()) {
        this.infowindow.close();
      }
      this.infowindow.setContent(contentString);
      this.infowindow.setPosition(marker.getPosition());
      this.infowindow.open(this.map, marker);
    });
  }

  onClear() {
    this.setAllMarkers();
  }

  clearMarkers() {
    this.markers.forEach((marker) => {
      marker.setMap(null);
    });
    this.markers = [];
  }
  exportarDatosAExcel() {
    if (this.apoyos.length === 0) {
      console.warn('La lista de apoyos está vacía. No se puede exportar.');
      return;
    }

    const datosParaExportar = this.apoyos.map((incidencias) => {
      return {
        Nombre: incidencias.nombre,
        Comunidad: incidencias.comunidad.nombre,
        Area: incidencias.area.nombre,
        Dirección: incidencias.ubicacion,
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

    this.guardarArchivoExcel(excelBuffer, 'incidencias.xlsx');
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
  handleChangeSearch(event: any) {
    const inputValue = event.target.value;
    this.apoyosFiltradas = this.apoyos.filter(
      (incidencia) =>
        incidencia.nombre
          .toLocaleLowerCase()
          .includes(inputValue.toLowerCase()) ||
        incidencia.ubicacion.toLowerCase().includes(inputValue)
    );
    this.configPaginator.currentPage = 1;
  }
}