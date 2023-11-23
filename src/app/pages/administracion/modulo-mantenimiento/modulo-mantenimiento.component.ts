import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Validators, FormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuloService } from 'src/app/core/_service/administracion/modulo.service';
import { ModuloModel } from 'src/app/core/_model/administracion/modulo-model';

import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';

@Component({
  selector: 'app-modulo-mantenimiento',
  templateUrl: './modulo-mantenimiento.component.html',
  styles: [],
})
export class ModuloMantenimientoComponent implements OnInit {
  public isLoadingResults = false;
  intId = 0;
  ModuloModel: ModuloModel = new ModuloModel();
  formArea = this.formBuilder.group({
    strId: [''],
    strNombre: ['', Validators.required],
    iconoSelect: [new ConstanteModel()],
    strDescripcion: [''],
    estadoArea: [''],
  });
  nombreIcono = '';
  listaIconos: ConstanteModel[];
  listaIconosFiltrada: Observable<ConstanteModel[]>;

  listaUsuarios: any[];
  soloLectura = false;

  titulo: string = '';
  @ViewChild('inputFocoInicial', { static: true,read: ElementRef }) inputFocoInicial: ElementRef;
  private readonly NOMBRE_OPCION = 'Módulo';
  constructor(
    private formBuilder: FormBuilder,
    private servicio: ModuloService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService,
    private constanteService: ConstanteService,
    private configurationService: ConfigurationService
  ) {
    this.intId = Number(this.activateRoute.snapshot.paramMap.get('idModulo'));
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Modulo);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    const obs = forkJoin([
      this.constanteService.listarControlId(TipoConstanteEnum.Iconos), //1
    ]);
    obs
      .pipe(
        finalize(() => {
          this.isLoadingResults = false;
        })
      )
      .subscribe({
        next: (value) => {
          this.listaIconos = value[0].Items;
        },
        complete: () => {
          this.setObservableCambioSelectIconos();
          this.EstablecerDatosExistente();
          this.inputFocoInicial.nativeElement.focus();
        },
      });
  }

  setObservableCambioSelectIconos(): void {
    this.listaIconosFiltrada = this.formArea
      .get('iconoSelect')
      .valueChanges.pipe(
        startWith(new ConstanteModel()),
        map((valorInput) => this.filtrarlistaIconos(valorInput))
      );
  }

  filtrarlistaIconos(val: any): ConstanteModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaIconos.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  EstablecerDatosExistente() {
    if (this.intId > 0) {
      this.titulo = this.configurationService.getTituloEdicion(
        this.NOMBRE_OPCION
      );
      this.isLoadingResults = true;
      this.servicio
        .obtener(this.intId)
        .pipe(finalize(() => (this.isLoadingResults = false)))
        .subscribe((respuesta) => {
          this.ModuloModel = respuesta;
          this.EstablecerValorEnFormArea('strId', this.ModuloModel.intId);
          this.EstablecerValorEnFormArea(
            'strNombre',
            this.ModuloModel.strNombre
          );
          this.EstablecerValorEnFormArea(
            'strDescripcion',
            this.ModuloModel.strDescripcion
          );
          let boolestado = this.ModuloModel.intEstado;
          if (boolestado === 1) {
            this.EstablecerValorEnFormArea('estadoArea', true);
          } else {
            this.EstablecerValorEnFormArea('estadoArea', false);
          }
          //Combos
          if (this.ModuloModel.strRutaIcono != '') {
            const icono = this.listaIconos.find(
              (x) => x.strValor === this.ModuloModel.strRutaIcono
            );
            if (icono != null) {
              this.formArea.get('iconoSelect').setValue(icono);
              this.nombreIcono = icono.strValor;
            }
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
    this.formArea.get(nombreControl).setValue(valor);
    console.log(this.formArea);
  }

  mostrarUsuario(val: any) {
    return val ? `${val.strUsuario}` : val;
  }

  Guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.formArea.valid) {
        let formarea = this.formArea.value;
        this.ModuloModel.intIdSistema = 1;
        this.ModuloModel.strNombre = formarea.strNombre;
        this.ModuloModel.strRutaIcono = formarea.iconoSelect.strValor;;
        this.ModuloModel.strDescripcion = formarea.strDescripcion;
        let valorEstado = formarea.estadoArea;
        if (valorEstado) {
          this.ModuloModel.intEstado = 1;
        } else {
          this.ModuloModel.intEstado = 0;
        }

        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios del Modulo?.',
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
                this.ModuloModel.intId = formarea.strId;
                this.isLoadingResults = true;

                this.servicio
                  .actualizar(this.ModuloModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/modulos`);
                  });
              } else {
                //console.log(this.AreaModel);
                this.isLoadingResults = true;
                this.servicio
                  .registrar(this.ModuloModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/modulos`);
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
        text: '¿Está seguro de salir? Los datos del Modulo no se guardarán.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Sí, Aceptar!',
        cancelButtonText: 'No, Cancelar!',
      })
      .then((result) => {
        if (result.value) {
          this.router.navigateByUrl(`administracion/modulos`);
        }
      });
  }

  getIconoName(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  selectedIcono(event: any): void {
    this.nombreIcono = event.option.value.strValor;
  }

}
