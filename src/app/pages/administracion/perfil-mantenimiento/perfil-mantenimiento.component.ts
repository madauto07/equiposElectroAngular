import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { RolService } from 'src/app/core/_service/administracion/rol.service';
import { RolModel } from 'src/app/core/_model/administracion/rol-model';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';
@Component({
  selector: 'app-perfil-mantenimiento',
  templateUrl: './perfil-mantenimiento.component.html',
  styles: [],
})
export class PerfilMantenimientoComponent implements OnInit {
  //#region DECLARACIÓN DEVARIABLES
  public isLoadingResults = false;
  intId: number = 0;
  RolMoldel: RolModel = new RolModel();
  formPrincipal = this.formBuilder.group({
    strId: [''],
    strNombre: ['', Validators.required],
    strDescripcion: [''],
    strEstado: [''],
  });
  soloLectura = false;

  @ViewChild('inputFocoInicial', { static: true,read: ElementRef }) inputFocoInicial: ElementRef;
  private readonly NOMBRE_OPCION = 'Perfil';
  titulo: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private servicio: RolService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService,
    private configurationService: ConfigurationService
  ) {
    this.intId = Number(this.activateRoute.snapshot.paramMap.get('idPerfil'));
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Perfil);
  }

  ngOnInit(): void {
    this.isLoadingResults = false;
    this.inputFocoInicial.nativeElement.focus();
    this.EstablecerDatosExistente();
  }

  EstablecerDatosExistente() {
    if (this.intId > 0) {
      this.titulo = this.configurationService.getTituloEdicion(
        this.NOMBRE_OPCION
      );
      this.isLoadingResults = true;
      this.servicio
        .Obtener(this.intId)
        .pipe(finalize(() => (this.isLoadingResults = false)))
        .subscribe((respuesta) => {
          this.RolMoldel = respuesta;
          this.EstablecerValorEnForm('strId', this.RolMoldel.intId);
          this.EstablecerValorEnForm('strNombre', this.RolMoldel.strNombre);
          this.EstablecerValorEnForm(
            'strDescripcion',
            this.RolMoldel.strDescripcion
          );
          let boolestado = this.RolMoldel.intEstado;
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
    this.formPrincipal.controls[nombreControl].setValue(valor);
  }

  getFontSize() {
    return Math.max(10, 12);
  }
  mostrarUsuario(val: any) {
    return val ? `${val.strUsuario}` : val;
  }

  Guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.formPrincipal.valid) {
        let formulario = this.formPrincipal.value;
        this.RolMoldel.intIdSistema = 1;
        this.RolMoldel.strNombre = formulario.strNombre;
        this.RolMoldel.strDescripcion = formulario.strDescripcion;
        let valorEstado = formulario.strEstado;
        if (valorEstado) {
          this.RolMoldel.intEstado = 1;
        } else {
          this.RolMoldel.intEstado = 0;
        }

        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios del Perfil?.',
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
                this.RolMoldel.intId = formulario.strId;
                this.isLoadingResults = true;

                this.servicio
                  .Actualizar(this.RolMoldel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/perfiles`);
                  });
              } else {
                this.isLoadingResults = true;
                this.servicio
                  .Registrar(this.RolMoldel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/perfiles`);
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
          this.router.navigateByUrl(`administracion/perfiles`);
        }
      });
  }
}
