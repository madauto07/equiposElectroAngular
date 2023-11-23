import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BusquedaCodigoEquipoDialogComponent } from './busqueda-codigo-equipo-dialog/busqueda-codigo-equipo-dialog.component';
import { BusquedaCodigoUbicacionTecnicaDialogComponent } from './busqueda-codigo-ubicacion-tecnica-dialog/busqueda-codigo-ubicacion-tecnica-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/core/material/material.module';
import { ModoVerificacionModalComponent } from './modo-verificacion-modal/modo-verificacion-modal.component';
import { FactorVerificacionModalComponent } from './factor-verificacion-modal/factor-verificacion-modal.component';
import { BusquedaCodigoTrabajadorDialogComponent } from './busqueda-codigo-trabajador-dialog/busqueda-codigo-trabajador-dialog.component';
import { ActividadProgramacionDialogComponent } from './actividad-programacion-dialog/actividad-programacion-dialog.component';

@NgModule({
  declarations: [
    BusquedaCodigoEquipoDialogComponent,
    BusquedaCodigoUbicacionTecnicaDialogComponent,
    FactorVerificacionModalComponent,
    ModoVerificacionModalComponent,
    BusquedaCodigoTrabajadorDialogComponent,
    ActividadProgramacionDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  exports: [
    BusquedaCodigoEquipoDialogComponent,
    BusquedaCodigoUbicacionTecnicaDialogComponent,
    BusquedaCodigoTrabajadorDialogComponent

  ],
})
export class ModalSharedModule { }
