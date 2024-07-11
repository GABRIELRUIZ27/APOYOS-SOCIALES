import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { DashboardService, AdquisicionesPorDia } from 'src/app/core/services/dashboard.service';

interface EmpleadosPorGenero {
  [key: string]: number;
}

interface EmpleadosPorArea {
  [key: string]: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  empleadosPorGenero: EmpleadosPorGenero = {};
  empleadosPorArea: EmpleadosPorArea = {};
  totalEmpleados: number = 0;
  totalSalarios: number = 0;
  totalAreas: number = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.getPersonalPorGenero();
    this.getPersonalPorArea();
    this.getTotalEmpleados();
    this.getTotalSalarios();
    this.getTotalAreas();
    this.getAdquisicionesPorDia();
  }

  getAdquisicionesPorDia() {
    this.dashboardService.getAdquisicionesPorDia().subscribe(
      (data: AdquisicionesPorDia[]) => {
        this.renderChartAdquisicionesPorDia(data);
      },
      error => {
        console.error('Error al obtener las adquisiciones por día:', error);
      }
    );
  }

  getTotalEmpleados() {
    this.dashboardService.getTotalEmpleados().subscribe(
      (data: { totalEmpleados: number }) => {
        this.totalEmpleados = data.totalEmpleados;
      },
      error => {
        console.error('Error al obtener el total de empleados:', error);
      }
    );
  }

  getTotalSalarios() {
    this.dashboardService.getTotalSalarios().subscribe(
      (data: { totalSalarios: number }) => {
        this.totalSalarios = data.totalSalarios;
      },
      error => {
        console.error('Error al obtener el total de salarios:', error);
      }
    );
  }

  getTotalAreas() {
    this.dashboardService.getTotalAreas().subscribe(
      (data: { totalAreas: number }) => {
        this.totalAreas = data.totalAreas;
      },
      error => {
        console.error('Error al obtener el total de áreas:', error);
      }
    );
  }

  getPersonalPorGenero() {
    this.dashboardService.getEmpleadosPorGenero().subscribe(
      (data: { empleadosPorGenero: EmpleadosPorGenero }) => {
        this.empleadosPorGenero = data.empleadosPorGenero;
        this.renderChartPersonalGenero();
      },
      error => {
        console.error('Error al obtener empleados por género:', error);
      }
    );
  }

  getPersonalPorArea() {
    this.dashboardService.getEmpleadosPorArea().subscribe(
      (data: { empleadosPorArea: EmpleadosPorArea }) => {
        this.empleadosPorArea = data.empleadosPorArea;
        this.renderChartPersonalArea();
      },
      error => {
        console.error('Error al obtener empleados por área:', error);
      }
    );
  }

  renderChartAdquisicionesPorDia(data: AdquisicionesPorDia[]) {
    const fechas = data.map(d => d.fecha);
    const cantidades = data.map(d => d.cantidad);

    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'line'
      },
      title: {
        text: 'Adquisiciones por Día'
      },
      xAxis: {
        categories: fechas,
        title: {
          text: 'Fecha'
        }
      },
      yAxis: {
        title: {
          text: 'Cantidad de Adquisiciones'
        }
      },
      series: [{
        type: 'line',
        name: 'Cantidad de Adquisiciones',
        data: cantidades
      }]
    };

    Highcharts.chart('containerAdquisicionesPorDia', chartOptions);
  }

  renderChartPersonalGenero() {
    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'pie'
      },
      title: {
        text: 'Empleados por Género'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
        }
      },
      series: [{
        type: 'pie',
        name: 'Empleados',
        data: Object.keys(this.empleadosPorGenero).map(genero => {
          let color = '';
          switch (genero.toLowerCase()) {
            case 'masculino':
              color = '#3498db'; // Azul claro
              break;
            case 'femenino':
              color = '#e74c3c'; // Rosa
              break;
            case 'no binario':
              color = '#9b59b6'; // Morado
              break;
            default:
              color = '#95a5a6'; // Gris para cualquier otro género
          }
          return {
            name: genero,
            y: this.empleadosPorGenero[genero],
            color: color
          };
        })
      } as Highcharts.SeriesPieOptions]
    };
  
    Highcharts.chart('containerPersonalGenero', chartOptions);
  }
  
  renderChartPersonalArea() {
    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Empleados por Área'
      },
      xAxis: {
        categories: Object.keys(this.empleadosPorArea),
        title: {
          text: 'Área'
        }
      },
      yAxis: {
        title: {
          text: 'Número de Empleados'
        }
      },
      series: [{
        type: 'column',
        name: 'Número de Empleados',
        data: Object.values(this.empleadosPorArea),
        colorByPoint: true,
        colors: Highcharts.getOptions().colors 
      }]
    };

    Highcharts.chart('containerPersonalArea', chartOptions);
  }
}