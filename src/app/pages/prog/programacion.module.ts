import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material/material.module';
import { NgxMaskModule, IConfig } from 'ngx-mask';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProgramacionAnualComponent } from './indisponibilidad/programacion-anual/programacion-anual.component';
import { ProgramacionMensualComponent } from './indisponibilidad/programacion-mensual/programacion-mensual.component';
import { ProgramacionSemanalComponent } from './indisponibilidad/programacion-semanal/programacion-semanal.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { ProgramacionAnualGenerarComponent } from './indisponibilidad/programacion-anual-generar/programacion-anual-generar.component';
import { ProgramacionAnualEditComponent } from './indisponibilidad/programacion-anual-edit/programacion-anual-edit.component';
import { ProgramacionAgregarActividadComponent } from './indisponibilidad/programacion-agregar-actividad/programacion-agregar-actividad.component';
import { ProgramacionMensualGenerarComponent } from './indisponibilidad/programacion-mensual-generar/programacion-mensual-generar.component';
import { ProgramacionMesGenerarComponent } from './indisponibilidad/programacion-mes-generar/programacion-mes-generar.component';
import { ProgramacionMensualEditComponent } from './indisponibilidad/programacion-mensual-edit/programacion-mensual-edit.component';
import { ProgramacionGenerarComponent } from './indisponibilidad/programacion-generar/programacion-generar.component';
import { ProgramacionSemanalEditComponent } from './indisponibilidad/programacion-semanal-edit/programacion-semanal-edit.component';
import { ProgramacionMantComponent } from './mantenimiento/programacion-mant/programacion-mant.component';
import { ProgramacionEditarComponent } from './indisponibilidad/programacion-editar/programacion-editar.component';

const maskConfig: Partial<IConfig> = {
  validation: false,
};

export const routes: Routes = [
  { path: 'indisponibilidad/programacionanual', component: ProgramacionAnualComponent },
  {
    path: 'indisponibilidad/programacionmensual', component: ProgramacionMensualComponent,
  },
  {
    path: 'indisponibilidad/programacionsemanal', component: ProgramacionSemanalComponent,
  },
  {
    path: 'indisponibilidad/programaciongenerar/:id', component: ProgramacionGenerarComponent,
  },
  {
    path: 'indisponibilidad/programacionanualgenerar', component: ProgramacionAnualGenerarComponent,
  },
  {
    path: 'indisponibilidad/programacionmensualgenerar', component: ProgramacionMensualGenerarComponent,
  },
  { path: 'indisponibilidad/programacionanualedit/:id', component: ProgramacionAnualEditComponent, 
  },
  { path: 'indisponibilidad/programacionmensualedit/:id', component: ProgramacionMensualEditComponent, 
  },
  { path: 'indisponibilidad/programacionsemanaledit/:id', component: ProgramacionSemanalEditComponent, 
  }
  , {
    path: 'indisponibilidad/programacionagregaractividad', component: ProgramacionAgregarActividadComponent,
  },
  {
    path: 'mantenimiento/programacionmant/:id', component: ProgramacionMantComponent,
  },
  {
    path: 'indisponibilidad/programacioneditar/:id', component: ProgramacionEditarComponent,
  }

];

@NgModule({
  declarations: [
    ProgramacionAnualComponent,
    ProgramacionMensualComponent,
    ProgramacionSemanalComponent,
    ProgramacionAnualGenerarComponent,
    ProgramacionAnualEditComponent,
    ProgramacionAgregarActividadComponent,
    ProgramacionMensualGenerarComponent,
    ProgramacionMesGenerarComponent,
    ProgramacionMensualEditComponent,
    ProgramacionGenerarComponent,
    ProgramacionSemanalEditComponent,
    ProgramacionMantComponent,
    ProgramacionEditarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MaterialModule,
    NgxMaskModule.forRoot(maskConfig),
    // FontAwesomeModule,
   // ModalSharedModule,
    NgxExtendedPdfViewerModule,
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProgramacionModule { }
