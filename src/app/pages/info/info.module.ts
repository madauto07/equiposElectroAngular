import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material/material.module';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { ActividadesComponent } from './actividades/actividades.component';
import { EquiposComponent } from './equipos/equipos.component';
import { Nivel01Component } from './estructura/nivel01/nivel01.component';
import { Nivel23Component } from './estructura/nivel23/nivel23.component';
import { DatosmantenimientoComponent } from './estructura/datosmantenimiento/datosmantenimiento.component';
import { DatosmantenimientoRComponent } from './estructura/datosmantenimiento-r/datosmantenimiento-r.component';
import { DatosmantenimientoRegistrarComponent } from './estructura/datosmantenimiento-registrar/datosmantenimiento-registrar.component';
import { EquipoMantenimientoComponent } from './equipo-mantenimiento/equipo-mantenimiento.component';
import { EquipoMantenimientoDatosComponent } from './equipo-mantenimiento-datos/equipo-mantenimiento-datos.component';
import { EquipoMantenimientoFichaComponent } from './equipo-mantenimiento-ficha/equipo-mantenimiento-ficha.component';
import { ActividadMantenimientoComponent } from './actividad-mantenimiento/actividad-mantenimiento.component';
import { ActividadMantenimientoDatosComponent } from './actividad-mantenimiento-datos/actividad-mantenimiento-datos.component';
import { ActividadMantenimientoFichaComponent } from './actividad-mantenimiento-ficha/actividad-mantenimiento-ficha.component';
import { ActividadMantenimientoFactoresComponent } from './actividad-mantenimiento-factores/actividad-mantenimiento-factores.component';
import { ActividadMantenimientoResponsablesComponent } from './actividad-mantenimiento-responsables/actividad-mantenimiento-responsables.component';
import { ActividadMantenimientoEquiposComponent } from './actividad-mantenimiento-equipos/actividad-mantenimiento-equipos.component';
import { ActividadMantenimientoHojaComponent } from './actividad-mantenimiento-hoja/actividad-mantenimiento-hoja.component';
import { EquipoMantenimientoImagenComponent } from './equipo-mantenimiento-imagen/equipo-mantenimiento-imagen.component';
import { EquipoMantenimientoImagenPreviewComponent } from './equipo-mantenimiento-imagen-preview/equipo-mantenimiento-imagen-preview.component';
import { EquipoMantenimientoDocumentoComponent } from './equipo-mantenimiento-documento/equipo-mantenimiento-documento.component';
import { EquipoMantenimientoDocumentoPreviewComponent } from './equipo-mantenimiento-documento-preview/equipo-mantenimiento-documento-preview.component';
import { ModalSharedModule } from '../modal-shared/modal-shared.module';
import { ActividadMantenimientoProgramacionComponent } from './actividad-mantenimiento-programacion/actividad-mantenimiento-programacion.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

const maskConfig: Partial<IConfig> = {
  validation: false,
};
export const routes: Routes = [
  { path: 'actividades', component: ActividadesComponent },
  {
    path: 'equipos',
    component: EquiposComponent,
  },
  {
    path: 'estructura/nivel01',
    component: Nivel01Component,
  },
  {
    path: 'estructura/nivel23',
    component: Nivel23Component,
  },
  {
    path: 'estructura/datosmantenimiento/:idPrefijo',
    component: DatosmantenimientoComponent,
  },
  {
    path: 'equipomantenimiento/:id',
    component: EquipoMantenimientoComponent,
  },
  {
    path: 'actividadmantenimiento/:id',
    component: ActividadMantenimientoComponent,
  },

  {
    path: 'actividadmantenimientodatos/:id',
    component: ActividadMantenimientoDatosComponent,
  },
  {
    path: 'actividadmantenimientofactores/:id',
    component: ActividadMantenimientoFactoresComponent,
  },

  {
    path: 'actividadmantenimientohoja/:id',
    component: ActividadMantenimientoHojaComponent,
  },

  {
    path: 'actividadmantenimientoequipos/:id',
    component: ActividadMantenimientoEquiposComponent,
  },

  {
    path: 'actividadmantenimientoficha/:id',
    component: ActividadMantenimientoFichaComponent,
  },

  {
    path: 'actividadmantenimientoresponsables/:id',
    component: ActividadMantenimientoResponsablesComponent,
  },

];

@NgModule({
  declarations: [
    ActividadesComponent,
    EquiposComponent,
    Nivel01Component,
    Nivel23Component,
    DatosmantenimientoComponent,
    DatosmantenimientoRComponent,
    DatosmantenimientoRegistrarComponent,
    EquipoMantenimientoComponent,
    EquipoMantenimientoDatosComponent,
    EquipoMantenimientoFichaComponent,
    ActividadMantenimientoComponent,
    ActividadMantenimientoDatosComponent,
    ActividadMantenimientoFichaComponent,
    ActividadMantenimientoFactoresComponent,
    ActividadMantenimientoResponsablesComponent,
    ActividadMantenimientoEquiposComponent,
    ActividadMantenimientoHojaComponent,
    EquipoMantenimientoImagenComponent,
    EquipoMantenimientoImagenPreviewComponent,
    EquipoMantenimientoDocumentoComponent,
    EquipoMantenimientoDocumentoPreviewComponent,
    EquipoMantenimientoDocumentoPreviewComponent,
    ActividadMantenimientoProgramacionComponent

  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MaterialModule,
    NgxMaskModule.forRoot(maskConfig),
    ModalSharedModule,
    NgxExtendedPdfViewerModule,
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InfoModule {}
