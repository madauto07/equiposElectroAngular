import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { AreaService } from 'src/app/core/_service/administracion/area.service';
import { AreaModel } from 'src/app/core/_model/administracion/area-model';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';
import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';

@Component({
  selector: 'app-areas-mantenimiento',
  templateUrl: './areas-mantenimiento.component.html',
  styleUrls: ['./areas-mantenimiento.component.scss'],
})
export class AreasMantenimientoComponent implements OnInit {
  public isLoadingResults = false;
  intIdArea: number = 0;
  AreaModel: AreaModel = new AreaModel();
  formArea = this.formBuilder.group({
    strId: [''],
    strNombre: ['', Validators.required],
    strDescripcion: [''],
    estadoArea: [''],
  });

  soloLectura = false;

  titulo: string = '';
  @ViewChild('inputFocoInicial', { static: true,read: ElementRef }) inputFocoInicial: ElementRef;
  private readonly NOMBRE_OPCION = 'Área';

  constructor(
    private formBuilder: FormBuilder,
    private servicioArea: AreaService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService,
    private configurationService: ConfigurationService
  ) {
    this.intIdArea = Number(this.activateRoute.snapshot.paramMap.get('idArea'));
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Area);
  }

  ngOnInit(): void {
    this.isLoadingResults = false;
    this.inputFocoInicial.nativeElement.focus();
    this.EstablecerDatosExistente();
  }

  EstablecerDatosExistente() {
    if (this.intIdArea > 0) {
      this.titulo = this.configurationService.getTituloEdicion(
        this.NOMBRE_OPCION
      );
      this.isLoadingResults = true;
      this.servicioArea
        .Obtener(this.intIdArea)
        .pipe(finalize(() => (this.isLoadingResults = false)))
        .subscribe((respuesta) => {
          this.AreaModel = respuesta;
          this.EstablecerValorEnFormArea('strId', this.AreaModel.intId);
          this.EstablecerValorEnFormArea('strNombre', this.AreaModel.strNombre);
          this.EstablecerValorEnFormArea(
            'strDescripcion',
            this.AreaModel.strDescripcion
          );
          let boolestado = this.AreaModel.intEstado;
          if (boolestado === 1) {
            this.EstablecerValorEnFormArea('estadoArea', true);
          } else {
            this.EstablecerValorEnFormArea('estadoArea', false);
          }
        });
    } else {
      this.titulo = this.configurationService.getTituloRegistro(
        this.NOMBRE_OPCION
      );
      this.EstablecerValorEnFormArea('estadoArea', true);
    }
  }

  Editar(AreaModel: any) {
    this.formArea.patchValue({
      strId: AreaModel.intIdArea,
      strNombre: AreaModel.strNombre,
    });
  }

  EstablecerValorEnFormArea(nombreControl: string, valor: any) {
    this.formArea.controls[nombreControl].setValue(valor);
  }

  mostrarUsuario(val: any) {
    return val ? `${val.strUsuario}` : val;
  }

  Guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.formArea.valid) {
        let formarea = this.formArea.value;

        this.AreaModel.strNombre = formarea.strNombre;
        this.AreaModel.strDescripcion = formarea.strDescripcion;
        let valorEstado = formarea.estadoArea;
        if (valorEstado) {
          this.AreaModel.intEstado = 1;
        } else {
          this.AreaModel.intEstado = 0;
        }

        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios del Area?.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#004f91',
            cancelButtonColor: '#7B7A83',
            confirmButtonText: 'Sí, Aceptar!',
            cancelButtonText: 'No, Cancelar!',
          })
          .then((result) => {
            if (result.value) {
              if (this.intIdArea > 0) {
                this.AreaModel.intId = formarea.strId;
                this.isLoadingResults = true;

                this.servicioArea
                  .Actualizar(this.AreaModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/areas`);
                  });
              } else {
                this.isLoadingResults = true;
                this.servicioArea
                  .Registrar(this.AreaModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.toString(), 'success');
                    this.router.navigateByUrl(`administracion/areas`);
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
        text: '¿Está seguro de salir? Los datos del Area no se guardarán.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Sí, Aceptar!',
        cancelButtonText: 'No, Cancelar!',
      })
      .then((result) => {
        if (result.value) {
          this.router.navigateByUrl(`administracion/areas`);
        }
      });
  }
}
