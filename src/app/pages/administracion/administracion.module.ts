import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../core/material/material.module';
import { AreasComponent } from './areas/areas.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { PerfilesComponent } from './perfiles/perfiles.component';
import { ModulosComponent } from './modulos/modulos.component';
import { OpcionesComponent } from './opciones/opciones.component';
import { ConstantesComponent } from './constantes/constantes.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { AreasMantenimientoComponent } from './areas-mantenimiento/areas-mantenimiento.component';
import { ModuloMantenimientoComponent } from './modulo-mantenimiento/modulo-mantenimiento.component';
import { PerfilMantenimientoComponent } from './perfil-mantenimiento/perfil-mantenimiento.component';
import { OpcionesMantenimientoComponent } from './opciones-mantenimiento/opciones-mantenimiento.component';
import { UsuarioMantenimientoComponent } from './usuario-mantenimiento/usuario-mantenimiento.component';
import { TipoConstanteListaComponent } from './tipo-constante-lista/tipo-constante-lista.component';
import { ConstanteMantenimientoComponent } from './constante-mantenimiento/constante-mantenimiento.component';
import { UsuarioPerfilComponent } from './usuario-perfil/usuario-perfil.component';
import { SubconstanteComponent } from './subconstante/subconstante.component';
import { SubconstanteMantenimientoComponent } from './subconstante-mantenimiento/subconstante-mantenimiento.component';
import { OpcionRolComponent } from './opcion-rol/opcion-rol.component';
import { OpcionRolMantenimientoComponent } from './opcion-rol-mantenimiento/opcion-rol-mantenimiento.component';
import { TrabajadorComponent } from './trabajador/trabajador.component';
import { TrabajadorMantenimientoComponent } from './trabajador-mantenimiento/trabajador-mantenimiento.component';

const maskConfig: Partial<IConfig> = {
  validation: false,
};
export const routes: Routes = [
  { path: 'areas', component: AreasComponent },
  {
    path: 'areasmantenimiento/:idArea',
    component: AreasMantenimientoComponent,
  },
  { path: 'modulos', component: ModulosComponent },
  {
    path: 'modulomantenimiento/:idModulo',
    component: ModuloMantenimientoComponent,
  },
  { path: 'usuarios', component: UsuariosComponent },
  {
    path: 'usuariomantenimiento/:idUsuario',
    component: UsuarioMantenimientoComponent,
  },
  { path: 'usuarioperfil/:idUsuario', component: UsuarioPerfilComponent },
  { path: 'tipoconstantes', component: TipoConstanteListaComponent },
  { path: 'constantes/:idTipo', component: ConstantesComponent },
  {
    path: 'constantemantenimiento/:idtipo/:idconstante',
    component: ConstanteMantenimientoComponent,
  },
  {
    path: 'subconstantes/:idtipo/:idconstante',
    component: SubconstanteComponent,
  },
  {
    path: 'subconstantesmantenimiento/:idtipo/:idconstante/:idsubconstante',
    component: SubconstanteMantenimientoComponent,
  },
  { path: 'opciones', component: OpcionesComponent },
  {
    path: 'opcionesmantenimiento/:IdOpcion',
    component: OpcionesMantenimientoComponent,
  },
  { path: 'perfiles', component: PerfilesComponent },
  {
    path: 'perfilmantenimiento/:idPerfil',
    component: PerfilMantenimientoComponent,
  },
  {
    path: 'opcionrol/:idrol',
    component: OpcionRolComponent,
  },
  { path: 'trabajadores', component: TrabajadorComponent },
  {
    path: 'trabajadormantenimiento/:id',
    component: TrabajadorMantenimientoComponent,
  },
];

@NgModule({
  declarations: [
    AreasComponent,
    ModulosComponent,
    OpcionesComponent,
    ConstantesComponent,
    PerfilesComponent,
    UsuariosComponent,
    PerfilMantenimientoComponent,
    AreasMantenimientoComponent,
    ModuloMantenimientoComponent,
    OpcionesMantenimientoComponent,
    UsuarioMantenimientoComponent,
    TipoConstanteListaComponent,
    ConstanteMantenimientoComponent,
    UsuarioPerfilComponent,
    SubconstanteComponent,
    SubconstanteMantenimientoComponent,
    OpcionRolComponent,
    OpcionRolMantenimientoComponent,
    TrabajadorComponent,
    TrabajadorMantenimientoComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    MaterialModule,
    NgxMaskModule.forRoot(maskConfig),
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdministracionModule {}
