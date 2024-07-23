import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { DashboardService, AdquisicionesPorDia, IncidenciasPorDia, IncidenciaRecurrente, ComunidadRecurrente } from 'src/app/core/services/dashboard.service';
import { IncidenciaService } from 'src/app/core/services/incidencia.service';
import { Incidencias } from 'src/app/models/incidencia';
import { TiposIncidencias } from 'src/app/models/tipos-incidecias';
import { TipoIncidenciaService } from 'src/app/core/services/tipoIncidencias.service';
import { HttpClient } from '@angular/common/http'; 

interface IncidenciasPorComunidad {
  [key: string]: number;
}

@Component({
  selector: 'app-dashboard-incidencias',
  templateUrl: './dashboard-incidencias.component.html',
  styleUrls: ['./dashboard-incidencias.component.css']
})
export class DashboardIncidenciasComponent implements OnInit{
  incidenciaRecurrente?: IncidenciaRecurrente;
  comunidadRecurrente?: ComunidadRecurrente;
  incidenciasPorComunidad: IncidenciasPorComunidad = {};
  totalIncidencias: number = 0;
  infowindow = new google.maps.InfoWindow();
  markers: google.maps.Marker[] = [];
  incidencias: Incidencias[] = [];
  incidenciaFiltradas: Incidencias[] = [];
  TiposIncidencias: TiposIncidencias[] = [];
  municipioPolygon: google.maps.Polygon | undefined;
  nombreMunicipio: string = 'Apetatitlán de Antonio Carbajal'; 
  municipios: string[] = [];
  map: google.maps.Map | undefined;
  heatmap: google.maps.visualization.HeatmapLayer | undefined;

  constructor(private dashboardService: DashboardService,
    private incidenciasService: IncidenciaService,
    private tipoIncidenciasService: TipoIncidenciaService,
    private http: HttpClient 
  ) {}

  ngOnInit() {
    this.getIncidenciasPorComunidad();
    this.getTotalIncidencias();
    this.getIncidenciasPorDia();
    this.getIncidenciaMasRecurrente();
    this.getTiposIncidencias();
    this.getIncidencias();
    this.cargarNombresMunicipios();
    this.getComunidadMasRecurrente();
  }

  getComunidadMasRecurrente(): void {
    this.dashboardService.getComunidadMasRecurrente().subscribe(
      data => {
        this.comunidadRecurrente = data;
      },
      error => {
        console.error('Error al obtener la comunidad más recurrente', error);
      }
    );
  }

  getIncidenciaMasRecurrente(): void {
    this.dashboardService.getIncidenciaMasRecurrente().subscribe(
      data => {
        this.incidenciaRecurrente = data;
      },
      error => {
        console.error('Error al obtener la incidencia más recurrente', error);
      }
    );
  }
  
  getIncidenciasPorDia() {
    this.dashboardService.getIncidenciasPorDia().subscribe(
      (data: IncidenciasPorDia[]) => {
        this.renderChartIncidenciasPorDia(data);
      },
      error => {
        console.error('Error al obtener las incidencias por día:', error);
      }
    );
  }

  getTotalIncidencias() {
    this.dashboardService.getTotalIncidencias().subscribe(
      (data: { totalIncidencias: number }) => {
        this.totalIncidencias = data.totalIncidencias;
      },
      error => {
        console.error('Error al obtener el total de incidencias:', error);
      }
    );
  }

  getIncidenciasPorComunidad() {
    this.dashboardService.getIncidenciasPorComunidad().subscribe(
      (data: { incidenciasPorComunidad: IncidenciasPorComunidad }) => {
        this.incidenciasPorComunidad = data.incidenciasPorComunidad;
        this.renderChartIncidenciasComunidad();
      },
      error => {
        console.error('Error al obtener incidencias por comunidad:', error);
      }
    );
  }

  renderChartIncidenciasPorDia(data: AdquisicionesPorDia[]) {
    const fechas = data.map(d => d.fecha);
    const cantidades = data.map(d => d.cantidad);

    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'line'
      },
      title: {
        text: 'Incidencias por día'
      },
      xAxis: {
        categories: fechas,
        title: {
          text: 'Fecha'
        }
      },
      yAxis: {
        title: {
          text: 'Cantidad de incidencias'
        }
      },
      series: [{
        type: 'line',
        name: 'Cantidad de incidencias',
        data: cantidades
      }]
    };

    Highcharts.chart('containerIncidenciasPorDia', chartOptions);
  }

  renderChartIncidenciasComunidad() {
    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Incidencias por comunidad'
      },
      xAxis: {
        categories: Object.keys(this.incidenciasPorComunidad),
        title: {
          text: 'Comunidad'
        }
      },
      yAxis: {
        title: {
          text: 'Número de incidencias'
        }
      },
      series: [{
        type: 'column',
        name: 'Número de incidencias',
        data: Object.values(this.incidenciasPorComunidad),
        colorByPoint: true,
        colors: Highcharts.getOptions().colors 
      }]
    };

    Highcharts.chart('containerIncidenciasComunidad', chartOptions);
  }

  ngAfterViewInit() {
    const mapElement = document.getElementById('map-canvas');
    if (!mapElement) {
      console.error('map-canvas element not found');
      return;
    }

    const latAttr = mapElement.getAttribute('data-lat');
    const lngAttr = mapElement.getAttribute('data-lng');
    if (!latAttr || !lngAttr) {
      console.error('data-lat or data-lng attribute not found');
      return;
    }

    const lat = parseFloat(latAttr);
    const lng = parseFloat(lngAttr);
    if (isNaN(lat) || isNaN(lng)) {
      console.error('Invalid latitude or longitude');
      return;
    }

    const myLatlng = new google.maps.LatLng(lat, lng);

    const mapOptions: google.maps.MapOptions = {
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

  getTiposIncidencias() {
    this.tipoIncidenciasService.getAll().subscribe({
      next: (dataFromAPI) => (this.TiposIncidencias = dataFromAPI),
    });
  }

  cargarNombresMunicipios(): void {
    this.http
      .get('assets/maps-kml/2023_1_29_MUN.kml', { responseType: 'text' })
      .subscribe((data) => {
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
    this.http
      .get('assets/maps-kml/2023_1_29_MUN.kml', { responseType: 'text' })
      .subscribe((data) => {
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
            const coordinatesText =
              placemark.getElementsByTagName('coordinates')[0].textContent;
            if (coordinatesText) {
              municipioCoordinates = coordinatesText
                .split(' ')
                .map((coord) => {
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
      fillOpacity: 0.3,
    });

    if (this.municipioPolygon) {
      this.municipioPolygon.setMap(this.map ?? null);

      // Calcular el centro del polígono
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach((coord) => bounds.extend(coord));
      const center = bounds.getCenter();

      console.log('Mapa centrado en:', center);
      this.map?.panTo(center);
      this.map?.setZoom(13);
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

  cargarMapaDeCalor(): void {
    if (this.heatmap) {
      this.heatmap.setMap(null); // Limpia el mapa de calor anterior si existe
    }

    const heatmapData: google.maps.visualization.WeightedLocation[] = this.incidencias.map(incidencia => {
      return { location: new google.maps.LatLng(incidencia.latitud, incidencia.longitud), weight: 1 };
    });

    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: this.map,
      radius: 20, // Ajusta el radio del mapa de calor según tus necesidades
      opacity: 0.6, // Ajusta la opacidad del mapa de calor
    });
  }

  cargarIncidencias(): void {
    this.incidenciasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.incidencias = dataFromAPI;
        this.cargarMapaDeCalor();
      },
    });
  }
  
  getIncidencias() {
    this.incidenciasService.getAll().subscribe({
      next: (dataFromAPI) => {
        this.incidencias = dataFromAPI;
        this.incidenciaFiltradas = this.incidencias;
  
        // Extraer las coordenadas para el mapa de calor
        const heatmapData: google.maps.LatLngLiteral[] = this.incidencias.map(incidencia => ({
          lat: incidencia.latitud, // Asegúrate de que estos campos existan en Incidencias
          lng: incidencia.longitud
        }));
  
        // Configurar el mapa de calor
        this.setHeatmap(heatmapData);
  
      },
      error: (error) => {
        console.error('Error al obtener incidencias:', error);
      }
    });
  }

  setHeatmap(data: google.maps.LatLngLiteral[]): void {
    if (this.heatmap) {
      // Si ya hay un mapa de calor existente, lo eliminamos
      this.heatmap.setMap(null);
    }
  
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      data: data.map(coord => new google.maps.LatLng(coord.lat, coord.lng)),
      radius: 10, // Ajusta el radio del mapa de calor según sea necesario
      map: this.map // Asegúrate de que `this.map` esté inicializado
    });
  }
  
}
