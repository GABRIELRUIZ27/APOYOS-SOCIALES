import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { DashboardService } from 'src/app/core/services/dashboard.service';

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

  renderChartPersonalGenero() {
    const chartOptions: Highcharts.Options = {
      chart: {
        type: 'column'
      },
      title: {
        text: 'Empleados por Género'
      },
      xAxis: {
        categories: Object.keys(this.empleadosPorGenero),
        title: {
          text: 'Género'
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
        data: Object.values(this.empleadosPorGenero),
        colorByPoint: true,
        colors: ['#1E90FF', '#FF69B4', '#32CD32'] 
      }]
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