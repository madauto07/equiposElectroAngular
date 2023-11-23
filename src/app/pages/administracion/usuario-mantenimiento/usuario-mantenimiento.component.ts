import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from 'src/app/core/_service/administracion/usuario.service';
import { UsuarioModel } from 'src/app/core/_model/administracion/usuario-model';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';
@Component({
  selector: 'app-usuario-mantenimiento',
  templateUrl: './usuario-mantenimiento.component.html',
  styles: [],
})
export class UsuarioMantenimientoComponent implements OnInit {
  public isLoadingResults = false;
  intId: number = 0;
  intIdTipoConstante: number = 4;
  UsuarioModel: UsuarioModel = new UsuarioModel();
  formPrincipal = this.formBuilder.group({
    strId: [''],
    strNombres: ['', Validators.required],
    strLogin: ['', Validators.required],
    strApellidos: [''],
    strCodigo: [''],
    strCorreo: ['', [Validators.required,Validators.email,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
    strTelefono: [''],
    strEstado: [''],
  });

  soloLectura = false;
  @ViewChild('inputFocoInicial', { static: true,read: ElementRef }) inputFocoInicial: ElementRef;
  private readonly NOMBRE_OPCION = 'Usuario';
  titulo: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private servicio: UsuarioService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService,
    private configurationService: ConfigurationService
  ) {
    this.intId = Number(this.activateRoute.snapshot.paramMap.get('idUsuario'));
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Usuario);
  }

  ngOnInit(): void {
    this.isLoadingResults = false;
    this.inputFocoInicial.nativeElement.focus();
    this.EstablecerDatosExistente();
  }

  EstablecerDatosExistente() {
    if (this.intId > 0) {
      this.isLoadingResults = true;
      this.titulo = this.configurationService.getTituloEdicion(
        this.NOMBRE_OPCION
      );
      this.servicio
        .Obtener(this.intId)
        .pipe(finalize(() => (this.isLoadingResults = false)))
        .subscribe((respuesta) => {
          this.UsuarioModel = respuesta;
          console.log(respuesta);
          this.EstablecerValorEnForm('strId', this.UsuarioModel.intId);
          this.EstablecerValorEnForm(
            'strNombres',
            this.UsuarioModel.strNombres
          );
          this.EstablecerValorEnForm(
            'strApellidos',
            this.UsuarioModel.strApellidos
          );
          this.EstablecerValorEnForm('strLogin', this.UsuarioModel.strLogin);
          this.EstablecerValorEnForm('strCorreo', this.UsuarioModel.strCorreo);
          this.EstablecerValorEnForm(
            'strTelefono',
            this.UsuarioModel.strTelefono
          );
          this.EstablecerValorEnForm('strCodigo', this.UsuarioModel.strCodigo);
          let boolestado = this.UsuarioModel.intEstado;
          if (boolestado === 1) {
            this.EstablecerValorEnForm('strEstado', true);
          } else {
            this.EstablecerValorEnForm('strEstado', false);
          }
        });
    } else {
      this.titulo = this.configurationService.getTituloRegistro(
        this.NOMBRE_OPCION
      );
      this.EstablecerValorEnForm('strEstado', true);
    }
  }

  Editar(Model: any) {
    this.formPrincipal.patchValue({
      strId: Model.intId,
      strNombre: Model.strNombre,
    });
  }

  EstablecerValorEnForm(nombreControl: string, valor: any) {
    this.formPrincipal.get(nombreControl).setValue(valor);
    //console.log(this.formArea);
  }

  mostrarUsuario(val: any) {
    return val ? `${val.strUsuario}` : val;
  }

  Guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.formPrincipal.valid) {
        let formulario = this.formPrincipal.value;
        console.log(formulario);

        this.UsuarioModel.strNombres = formulario.strNombres;
        this.UsuarioModel.strApellidos = formulario.strApellidos;
        this.UsuarioModel.strCorreo = formulario.strCorreo;
        this.UsuarioModel.strLogin = formulario.strLogin;
        this.UsuarioModel.strCodigo = formulario.strCodigo;
        this.UsuarioModel.strTelefono = formulario.strTelefono;

        let valorEstado = formulario.strEstado;
        if (valorEstado) {
          this.UsuarioModel.intEstado = 1;
        } else {
          this.UsuarioModel.intEstado = 0;
        }

        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios del usuario?.',
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
                this.UsuarioModel.intId = formulario.strId;
                this.isLoadingResults = true;

                this.servicio
                  .Actualizar(this.UsuarioModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/usuarios`);
                  });
              } else {
                this.isLoadingResults = true;
                this.servicio
                  .Registrar(this.UsuarioModel)
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
        text: '¿Está seguro de salir? Los datos del usuario no se guardarán.',
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
