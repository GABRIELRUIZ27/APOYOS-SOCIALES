import { AfterViewInit, Component, Inject } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { IncidenciaService } from 'src/app/core/services/incidencia.service';
import { Incidencias } from 'src/app/models/incidencia';
import { TiposIncidencias } from 'src/app/models/tipos-incidecias';
import { TipoIncidenciaService } from 'src/app/core/services/tipoIncidencias.service';
import { HttpClient } from '@angular/common/http'; 

declare const google: any;
@Component({
  selector: 'app-mapa-incidencias',
  templateUrl: './mapa-incidencias.component.html',
  styleUrls: ['./mapa-incidencias.component.css'],
})
export class MapaIncidenciasComponent implements AfterViewInit {
  map: any = {};
  infowindow = new google.maps.InfoWindow();
  markers: google.maps.Marker[] = [];
  incidencias: Incidencias[] = [];
  incidenciaFiltradas: Incidencias[] = [];
  TiposIncidencias: TiposIncidencias[] = [];
  municipioPolygon: google.maps.Polygon | undefined;
  nombreMunicipio: string = 'Apetatitlán de Antonio Carbajal'; 
  municipios: string[] = [];

  constructor(
    @Inject('CONFIG_PAGINATOR')
    public configPaginator: PaginationInstance,
    private incidenciasService: IncidenciaService,
    private tipoIncidenciasService: TipoIncidenciaService,
    private http: HttpClient // Inyectar HttpClient
  ) {
    this.getIncidencias();
    this.cargarNombresMunicipios();
    this.getTiposIncidencias();
  }

  getTiposIncidencias() {
    this.tipoIncidenciasService
      .getAll()
      .subscribe({ next: (dataFromAPI) => (this.TiposIncidencias = dataFromAPI) });
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
  getIncidencias() {
    this.incidenciasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.incidencias = dataFromAPI;
        this.incidenciaFiltradas = this.incidencias;
        this.setAllMarkers();
      },
    });
  }

  setAllMarkers() {
    this.clearMarkers();
    this.incidencias.forEach((incidencias) => {
      this.setInfoWindow(
        this.getMarker(incidencias),
        this.getContentString(incidencias)
      );
    });
  }

  getContentString(incidencias: Incidencias) {
    return `
<div style="width: 350px; height: auto;" class="text-center">
  <img src="${incidencias.foto}" alt="Imagen de incidencia" style="width: 100%; height: auto;">
            <div class="px-4 py-4">
          <p style="font-weight:  bolder;" class=" ">
          Ubicación:
          <p class="text-muted ">
            ${incidencias.ubicacion}
          </p>
            Tipo de incidencia:
            <p class="text-muted ">
              ${incidencias.tipoIncidencia.nombre}
            </p>
          </p>            
          <p style="font-weight:  bolder;" class=" ">
            Comunidad:
            <p class="text-muted ">
              ${incidencias.comunidad.nombre}
            </p>
          </p>
          <p style="font-weight:  bolder;" class=" ">
            Comentarios:
            <p class="text-muted ">
              ${incidencias.comentarios}
            </p>
          </p>
        </div>
      </div>
    `;
  }

  getMarker(incidencias: Incidencias) {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng(
        incidencias.latitud,
        incidencias.longitud
      ),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: incidencias.tipoIncidencia.color,
        fillOpacity: 1,
        scale: 6,
        strokeWeight: 0,
      },
      title: `${incidencias.tipoIncidencia.nombre}`,
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
    this.incidenciaFiltradas = this.incidencias.filter(
      (incidencia) =>
        incidencia.tipoIncidencia.nombre.toLowerCase().includes(inputValue)||
        incidencia.comunidad.nombre.toLowerCase().includes(inputValue)||
        incidencia.ubicacion.toLowerCase().includes(inputValue)
    );
    this.configPaginator.currentPage = 1;
  }
}