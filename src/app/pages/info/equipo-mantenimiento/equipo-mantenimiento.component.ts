import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-equipo-mantenimiento',
  templateUrl: './equipo-mantenimiento.component.html',
  styleUrls: ['./equipo-mantenimiento.component.scss'],
})
export class EquipoMantenimientoComponent implements OnInit {
  isEdit = false;

  constructor(
    private activateRoute: ActivatedRoute
  ) {
    let idEquipo = 0;
    idEquipo = Number(this.activateRoute.snapshot.paramMap.get('id'));
    if (idEquipo != 0) {
      this.isEdit = true
    }
  }

  ngOnInit(): void {}
}
