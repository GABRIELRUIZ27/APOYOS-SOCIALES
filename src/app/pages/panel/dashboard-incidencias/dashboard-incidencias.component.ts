import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { DashboardService, AdquisicionesPorDia, IncidenciasPorDia, IncidenciaRecurrente } from 'src/app/core/services/dashboard.service';

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
  incidenciasPorComunidad: IncidenciasPorComunidad = {};
  totalIncidencias: number = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.getIncidenciasPorComunidad();
    this.getTotalIncidencias();
    this.getIncidenciasPorDia();
    this.getIncidenciaMasRecurrente();
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
  
}
