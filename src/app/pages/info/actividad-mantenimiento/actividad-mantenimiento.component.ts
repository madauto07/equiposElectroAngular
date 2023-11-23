import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-actividad-mantenimiento',
  templateUrl: './actividad-mantenimiento.component.html',
  styles: [
  ]
})
export class ActividadMantenimientoComponent implements OnInit {
  isEdit = false;

  nombreTitulo = '';

  constructor( private activateRoute: ActivatedRoute) {

    let idActividad = 0;
    idActividad = Number(this.activateRoute.snapshot.paramMap.get('id'));
    if (idActividad != 0) {
      this.isEdit = true
    }

   }

  ngOnInit(): void {

    this.nombreTitulo="Registro de Actividades";
    
  }

}
