import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  nombreDocumento: string;
  srcBase64Documento: string;
}

@Component({
  selector: 'app-equipo-mantenimiento-documento-preview',
  templateUrl: './equipo-mantenimiento-documento-preview.component.html',
  styleUrls: ['./equipo-mantenimiento-documento-preview.component.scss']
})
export class EquipoMantenimientoDocumentoPreviewComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EquipoMantenimientoDocumentoPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  ngOnInit(): void {
  }

}
