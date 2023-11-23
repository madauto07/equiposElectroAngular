import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  nombreImagen: string;
  srcImagen: string;
}


@Component({
  selector: 'app-equipo-mantenimiento-imagen-preview',
  templateUrl: './equipo-mantenimiento-imagen-preview.component.html',
  styleUrls: ['./equipo-mantenimiento-imagen-preview.component.scss']
})
export class EquipoMantenimientoImagenPreviewComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EquipoMantenimientoImagenPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  ngOnInit(): void {
  }

}
