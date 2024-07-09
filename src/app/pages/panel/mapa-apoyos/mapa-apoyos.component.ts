import { AfterViewInit, Component, Inject } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { ApoyosService } from 'src/app/core/services/apoyo.service';
import { Apoyos } from 'src/app/models/apoyos';
import { Area } from 'src/app/models/area';
import { AreasService } from 'src/app/core/services/area.service';
import { HttpClient } from '@angular/common/http'; 

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
  Areas: Area[] = [];
  municipioPolygon: google.maps.Polygon | undefined;
  nombreMunicipio: string = 'Apetatitlán de Antonio Carbajal'; 
  municipios: string[] = [];

  constructor(
    @Inject('CONFIG_PAGINATOR')
    public configPaginator: PaginationInstance,
    private apoyosService: ApoyosService,
    private areaService: AreasService,
    private http: HttpClient // Inyectar HttpClient
  ) {
    this.getApoyos();
    this.cargarNombresMunicipios();
    this.getAreas();
  }

  getAreas() {
    this.areaService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.Areas = dataFromAPI) });
  }

  ngAfterViewInit() {
    const mapElement = document.getElementById('map-canvas1') || null;
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

    // Cargar y resaltar el municipio por defecto
    this.cargarCoordenadasMunicipioSeleccionado();
  }

  cargarNombresMunicipios(): void {
    this.http.get('assets/maps-kml/2023_1_29_MUN.kml', { responseType: 'text' }).subscribe(data => {
      this.parseNombresMunicipios(data);
      this.nombreMunicipio = 'Apetatitlán de Antonio Carvajal'; // Establecer el municipio por defecto
      this.cargarCoordenadasMunicipioSeleccionado(); // Resaltar el municipio por defecto después de cargar los nombres
    });
  }
  
  parseNombresMunicipios(kmlData: string): void {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlData, 'text/xml');
    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const extendedData = placemark.getElementsByTagName('ExtendedData')[0];
      if (extendedData) {
        const simpleDatas = extendedData.getElementsByTagName('SimpleData');
        for (let j = 0; j < simpleDatas.length; j++) {
          const simpleData = simpleDatas[j];
          if (simpleData.getAttribute('name') === 'NOMGEO') {
            const municipioNombre = simpleData.textContent;
            if (municipioNombre) {
              this.municipios.push(municipioNombre);
            }
            break;
          }
        }
      }
    }
  }
  cargarCoordenadasMunicipioSeleccionado(): void {
    const selectedMunicipio = this.nombreMunicipio.toLowerCase();
    this.http.get('assets/maps-kml/2023_1_29_MUN.kml', { responseType: 'text' }).subscribe(data => {
      this.parseCoordenadasMunicipio(data, selectedMunicipio);
    });
  }

  parseCoordenadasMunicipio(kmlData: string, selectedMunicipio: string): void {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlData, 'text/xml');
    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      const simpleDatas = placemark.getElementsByTagName('SimpleData');
      let municipioNombre: string | undefined;
      let municipioCoordinates: google.maps.LatLngLiteral[] = [];
      for (let j = 0; j < simpleDatas.length; j++) {
        const simpleData = simpleDatas[j];
        if (simpleData.getAttribute('name') === 'NOMGEO') {
          municipioNombre = simpleData.textContent?.toLowerCase();
          if (municipioNombre === selectedMunicipio) {
            const coordinatesText = placemark.getElementsByTagName('coordinates')[0].textContent;
            if (coordinatesText) {
              municipioCoordinates = coordinatesText.split(' ').map(coord => {
                const [lng, lat] = coord.split(',');
                return { lat: parseFloat(lat), lng: parseFloat(lng) };
              });
            }
            break;
          }
        }
      }
      if (municipioCoordinates.length > 0) {
        this.resaltarMunicipio(municipioCoordinates);
        break;
      }
    }
  }

  resaltarMunicipio(coordinates: google.maps.LatLngLiteral[]): void {
    this.limpiarMapa();
    
    console.log('Coordenadas del municipio:', coordinates);
    this.municipioPolygon = new google.maps.Polygon({
      paths: coordinates,
      strokeColor: '#D71D1E', // Rojo
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#80ff0000', // Transparente
      fillOpacity: 0.30
    });
  
    if (this.municipioPolygon) {
      this.municipioPolygon.setMap(this.map);
      
      // Calcular el centro del polígono
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      const center = bounds.getCenter();
      
      console.log('Mapa centrado en:', center);
      this.map.panTo(center);
      this.map.setZoom(13);
      console.log('Zoom del mapa establecido en 13');
    } else {
      console.error('municipioPolygon no está definido.');
    }
  }  
  
  limpiarMapa(): void {
    if (this.municipioPolygon) {
      this.municipioPolygon.setMap(null);
    }
  }

  // Métodos existentes
  getApoyos() {
    this.apoyosService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.apoyos = dataFromAPI;
        this.apoyosFiltradas = this.apoyos;
        this.setAllMarkers();
      },
    });
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