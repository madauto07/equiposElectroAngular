import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { OpcionService } from 'src/app/core/_service/administracion/opcion.service';
import { OpcionModel } from 'src/app/core/_model/administracion/opcion-model';
import { ModuloService } from 'src/app/core/_service/administracion/modulo.service';
import { forkJoin, Observable } from 'rxjs';
import { ModuloModel } from 'src/app/core/_model/administracion/modulo-model';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';
@Component({
  selector: 'app-opciones-mantenimiento',
  templateUrl: './opciones-mantenimiento.component.html',
  styleUrls: ['./opciones-mantenimiento.component.scss'],
})
export class OpcionesMantenimientoComponent implements OnInit {
  listaModulos: ModuloModel[];
  listaModulosFiltrada: Observable<ModuloModel[]>;
  listaOpcionesPadre: OpcionModel[];
  listaOpcionesPadreFiltrada: Observable<OpcionModel[]>;
  nombreIcono = '';
  listaIconos: ConstanteModel[];
  listaIconosFiltrada: Observable<ConstanteModel[]>;
  isLoadingResults = false;
  intIdOpcion = 0;
  opcionModel: OpcionModel = new OpcionModel();

  formOpcion = this.formBuilder.group({
    intId: [0],
    moduloSelect: [new ModuloModel(), Validators.required],
    opcionPadreSelect: [new OpcionModel()],
    strNombre: ['', Validators.required],
    strDescripcion: [''],
    strURL: [''],
    dbOrden: [0],
    iconoSelect: [new ConstanteModel()],
    intEstado: [true],
  });

  soloLectura = false;
  @ViewChild('inputFocoInicial', { static: true, read: ElementRef })
  inputFocoInicial: ElementRef;
  private readonly NOMBRE_OPCION = 'Opción';
  titulo: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private opcionService: OpcionService,
    private moduloService: ModuloService,
    private constanteService: ConstanteService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService,
    private configurationService: ConfigurationService
  ) {
    this.intIdOpcion = Number(
      this.activateRoute.snapshot.paramMap.get('IdOpcion')
    );
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Opcion);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    const obs = forkJoin([
      this.moduloService.listar(), //0
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
          this.listaModulos = value[0];
          this.listaIconos = value[1].Items;
        },
        complete: () => {
          this.setObservableCambioSelectModulos();
          this.setObservableCambioSelectIconos();
          this.obtenerDatos();
          this.inputFocoInicial.nativeElement.focus();
        },
      });
  }

  setObservableCambioSelectModulos(): void {
    this.listaModulosFiltrada = this.formOpcion
      .get('moduloSelect')
      .valueChanges.pipe(
        startWith(new ModuloModel()),
        map((valorInput) => this.filtrarlistaModulos(valorInput))
      );
  }

  filtrarlistaModulos(val: any): ModuloModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaModulos.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  setObservableCambioSelectIconos(): void {
    this.listaIconosFiltrada = this.formOpcion
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

  obtenerDatos(): void {
    if (this.intIdOpcion > 0) {
      this.titulo = this.configurationService.getTituloEdicion(
        this.NOMBRE_OPCION
      );
      this.isLoadingResults = true;
      this.opcionService
        .ObtenerOpcionPorId(this.intIdOpcion)
        .pipe(finalize(() => (this.isLoadingResults = false)))
        .subscribe((respuesta) => {
          this.opcionModel = respuesta;
          this.formOpcion.get('intId').setValue(this.opcionModel.intId);
          this.formOpcion.get('strNombre').setValue(this.opcionModel.strNombre);
          this.formOpcion
            .get('strDescripcion')
            .setValue(this.opcionModel.strDescripcion);
          this.formOpcion.get('strURL').setValue(this.opcionModel.strURL);
          this.formOpcion.get('dbOrden').setValue(this.opcionModel.dbOrden);
          this.formOpcion.get('intEstado').setValue(this.opcionModel.intEstado);
          //Combos
          if (this.opcionModel.intIdModulo != 0) {
            const modulo = this.listaModulos.find(
              (x) => x.intId === this.opcionModel.intIdModulo
            );
            if (modulo) {
              this.formOpcion.get('moduloSelect').setValue(modulo);
            }
          }
          if (this.opcionModel.strRutaIcono != '') {
            const icono = this.listaIconos.find(
              (x) => x.strValor === this.opcionModel.strRutaIcono
            );
            if (icono != null) {
              this.formOpcion.get('iconoSelect').setValue(icono);
              this.nombreIcono = icono.strValor;
            }
          }
        });
    } else {
      this.titulo = this.configurationService.getTituloRegistro(
        this.NOMBRE_OPCION
      );
    }
  }

  selectedModulo(event: any): void {
    this.obtenerListadoOpcionesPadre(event.option.value.intId);
  }

  obtenerListadoOpcionesPadre(idModuloSeleccionado: number): void {
    this.opcionService.listar().subscribe((rpta) => {
      this.listaOpcionesPadre = rpta.filter(
        (x) =>
          x.intId !== this.intIdOpcion && x.intIdModulo === idModuloSeleccionado
      );
      this.setObservableCambioSelectOpcionPadre();
    });
  }

  setObservableCambioSelectOpcionPadre() {
    this.listaOpcionesPadreFiltrada = this.formOpcion
      .get('opcionPadreSelect')
      .valueChanges.pipe(
        startWith(''),
        map((valorInput) => this.filtrarlistaOpcionPadre(valorInput))
      );
  }

  filtrarlistaOpcionPadre(val: any): OpcionModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaOpcionesPadre.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  GuardarOpcion(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.formOpcion.valid) {
        const form = this.formOpcion.value;
        this.opcionModel.intIdModulo = form.moduloSelect.intId;
        this.opcionModel.intIdOpcionPadre = form.opcionPadreSelect.intId;
        this.opcionModel.strNombre = form.strNombre;
        this.opcionModel.strDescripcion = form.strDescripcion;
        this.opcionModel.strURL = form.strURL;
        this.opcionModel.dbOrden = form.dbOrden;
        this.opcionModel.strRutaIcono = form.iconoSelect.strValor;
        const valorEstado = form.intEstado;
        if (valorEstado) {
          this.opcionModel.intEstado = 1;
        } else {
          this.opcionModel.intEstado = 0;
        }
        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios de la opción?.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#004f91',
            cancelButtonColor: '#7B7A83',
            confirmButtonText: 'Sí, Aceptar!',
            cancelButtonText: 'No, Cancelar!',
          })
          .then((result) => {
            if (result.value) {
              if (this.intIdOpcion > 0) {
                this.opcionModel.intId = form.intId;
                this.isLoadingResults = true;

                this.opcionService
                  .ActualizarOpcion(this.opcionModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/opciones`);
                  });
              } else {
                this.isLoadingResults = true;
                this.opcionService
                  .RegistrarOpcion(this.opcionModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/opciones`);
                  });
              }
            }
          });
      }
    }
  }

  Cancelar(): void {
    swal
      .fire({
        title: 'Confirmación',
        text: '¿Está seguro de salir? Los datos de la opción no se guardarán.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Sí, Aceptar!',
        cancelButtonText: 'No, Cancelar!',
      })
      .then((result) => {
        if (result.value) {
          this.router.navigateByUrl(`administracion/opciones`);
        }
      });
  }

  getOpcionPadreName(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
  }

  getModuloName(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
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
