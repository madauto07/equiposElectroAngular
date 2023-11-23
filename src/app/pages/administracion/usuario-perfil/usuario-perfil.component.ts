import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from 'src/app/core/_service/administracion/usuario.service';
import { UsuarioModel } from 'src/app/core/_model/administracion/usuario-model';
import { RolService } from 'src/app/core/_service/administracion/rol.service';
import { UsuarioRolService } from 'src/app/core/_service/administracion/usuario-rol.service';

import { UsuarioRolModel } from 'src/app/core/_model/administracion/usuario-rol-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';

@Component({
  selector: 'app-usuario-perfil',
  templateUrl: './usuario-perfil.component.html',
  styles: [],
})
export class UsuarioPerfilComponent implements OnInit {
  public isLoadingResults = false;
  intId: number = 0;
  intIdUsuario: number = 0;
  UsuarioModel: UsuarioModel = new UsuarioModel();
  UsuarioRolModel: UsuarioRolModel = new UsuarioRolModel();
  listaPerfil?: any[] = [];

  formPrincipal = this.formBuilder.group({
    strIdUsuario: [''],
    strNombres: ['', Validators.required],
    strLogin: ['', Validators.required],
    strApellidos: [''],
    strCodigo: [''],
    strCorreo: [''],
    strTelefono: [''],
    strEstado: [''],
    controlPerfil: new FormControl(''),
  });

  soloLectura = false;

  constructor(
    private formBuilder: FormBuilder,
    private servicio: UsuarioService,
    private usuarioRolservicio: UsuarioRolService,
    private rolService: RolService,
    private constanteService: ConstanteService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService,
    private configurationService: ConfigurationService
  ) {
    this.intIdUsuario = Number(
      this.activateRoute.snapshot.paramMap.get('idUsuario')
    );
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Usuario);
  }

  get nombreActivo(): string{
    return this.configurationService.getNombreActivo();
  }

  get nombreInactivo(): string{
    return this.configurationService.getNombreInactivo();
  }

  ngOnInit(): void {
    this.isLoadingResults = false;

    const observable = forkJoin([this.rolService.listar()]);

    observable.pipe(finalize(() => (this.isLoadingResults = false))).subscribe({
      next: (value) => {
        console.log(value[0].Items);
        this.listaPerfil = value[0].Items;
      },
      complete: () => {},
    });

    this.EstablecerDatosExistente();
  }

  EstablecerDatosExistente() {
    if (this.intIdUsuario > 0) {
      this.isLoadingResults = true;
      this.servicio
        .Obtener(this.intIdUsuario)
        .pipe(finalize(() => (this.isLoadingResults = false)))
        .subscribe((respuesta) => {
          this.UsuarioModel = respuesta;
          this.EstablecerValorEnForm('strIdUsuario', this.UsuarioModel.intId);
          this.EstablecerValorEnForm(
            'strNombres',
            this.UsuarioModel.strNombres
          );
          this.EstablecerValorEnForm(
            'strApellidos',
            this.UsuarioModel.strApellidos
          );
          this.EstablecerValorEnForm('strLogin', this.UsuarioModel.strLogin);
        });
    } else {
    }
  }

  Editar(Model: any) {
    this.formPrincipal.patchValue({
      strId: Model.intId,
      strNombre: Model.strNombre,
    });
  }

  EstablecerValorEnForm(nombreControl: string, valor: any) {
    this.formPrincipal.controls[nombreControl].setValue(valor);
  }

  getFontSize() {
    return Math.max(10, 12);
  }
  mostrarUsuario(val: any) {
    return val ? `${val.strUsuario}` : val;
  }

  Importar(): void {}

  Guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.formPrincipal.valid) {
        let formulario = this.formPrincipal.value;
        console.log(formulario);

        this.UsuarioRolModel.intIdRol = formulario.controlPerfil.intId;
        this.UsuarioRolModel.intIdUsuario = formulario.strIdUsuario;

        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios de Usuario Rol?.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#004f91',
            cancelButtonColor: '#7B7A83',
            confirmButtonText: 'Sí, Aceptar!',
            cancelButtonText: 'No, Cancelar!',
          })
          .then((result) => {
            if (result.value) {
              if (this.intId > 0) {
                this.UsuarioRolModel.intIdUsuario = formulario.strIdUsuario;
                this.isLoadingResults = true;

                this.servicio
                  .Actualizar(this.UsuarioModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    if (respuesta.exito) {
                      swal.fire('Ok', respuesta.mensaje, 'success');

                      this.router.navigateByUrl(`administracion/usuarios`);
                    } else {
                      swal.fire('Ok', respuesta.mensaje, 'success');
                    }
                  });
              } else {
                //console.log(this.AreaModel);
                this.isLoadingResults = true;
                this.usuarioRolservicio
                  .Registrar(this.UsuarioRolModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/usuarios`);
                  });
              }
            }
          });
      }
    }
  }

  Cancelar() {
    swal
      .fire({
        title: 'Confirmación',
        text: '¿Está seguro de salir? Los datos del perfil no se guardarán.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Sí, Aceptar!',
        cancelButtonText: 'No, Cancelar!',
      })
      .then((result) => {
        if (result.value) {
          this.router.navigateByUrl(`administracion/usuarios`);
        }
      });
  }
}
