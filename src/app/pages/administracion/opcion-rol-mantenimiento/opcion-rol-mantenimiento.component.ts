import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OpcionRolModel } from 'src/app/core/_model/administracion/opcion-rol-model';
import { ModuloModel } from 'src/app/core/_model/administracion/modulo-model';
import { OpcionModel } from 'src/app/core/_model/administracion/opcion-model';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { OpcionRolService } from 'src/app/core/_service/administracion/opcion-rol.service';
import { ModuloService } from 'src/app/core/_service/administracion/modulo.service';
import { OpcionService } from 'src/app/core/_service/administracion/opcion.service';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-opcion-rol-mantenimiento',
  templateUrl: './opcion-rol-mantenimiento.component.html',
  styleUrls: ['./opcion-rol-mantenimiento.component.css'],
})
export class OpcionRolMantenimientoComponent implements OnInit, OnChanges {
  @Input() idRol: number;
  @Input() idOpcion: number;
  @Output() cerrar: EventEmitter<boolean> = new EventEmitter();
  @Output() listarOpcionRol: EventEmitter<boolean> = new EventEmitter();
  form: FormGroup;
  opcionRol: OpcionRolModel;
  listaModulo: ModuloModel[];
  listaModuloFiltrada: Observable<ModuloModel[]>;
  idModuloSeleccionado = 0;
  listaOpcion: OpcionModel[];
  listaOpcionFiltrada: Observable<OpcionModel[]>;
  listaTipoAcceso: ConstanteModel[];
  listaTipoAccesoFiltrada: Observable<ConstanteModel[]>;
  isLoading = false;

  @ViewChild('inputFocoInicial', { static: true,read: ElementRef }) inputFocoInicial: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private opcionRolService: OpcionRolService,
    private moduloService: ModuloService,
    private opcionService: OpcionService,
    private constanteService: ConstanteService
  ) {
    this.construirFormulario();
  }

  ngOnInit(): void {
    this.inicializar();
    this.obtenerListaModulo();
    this.obtenerListaTipoAcceso();
    this.inputFocoInicial.nativeElement.focus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // TODO
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      modulo: [new ModuloModel, [Validators.required]],
      opcion: [new OpcionModel, [Validators.required]],
      tipoAcceso: [new ConstanteModel, [Validators.required]],
    });
  }

  inicializar(): void {
    this.limpiarForm();
    this.opcionRol = new OpcionRolModel();
  }

  obtenerListaModulo(): void {
    this.isLoading = true;
    this.moduloService
      .listar()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((rpta) => {
        this.listaModulo = rpta;
        this.setObservableCambioSelectModulo();
      });
  }

  obtenerListaTipoAcceso(): void {
    this.isLoading = true;
    this.constanteService
      .listarControlId(TipoConstanteEnum.TipoAcceso)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((rpta) => {
        this.listaTipoAcceso = rpta.Items;
        this.setObservableCambioSelectTipoAcceso();
      });
  }

  setObservableCambioSelectModulo(): void {
    this.listaModuloFiltrada = this.form.get('modulo').valueChanges.pipe(
      startWith(new ModuloModel),
      map((valorInput) => this.filtrarlistaModulo(valorInput))
    );
  }

  filtrarlistaModulo(val: any): ModuloModel[] {
    let valorFiltrado = '';
        if (typeof val === 'string') {
          valorFiltrado = val;
        } else{
          valorFiltrado = val.strNombre ? val.strNombre : '';
        }
    return this.listaModulo.filter((x) =>
          x.strNombre.toLowerCase().includes(valorFiltrado));
  }

  setObservableCambioSelectTipoAcceso(): void {
    this.listaTipoAccesoFiltrada = this.form
      .get('tipoAcceso')
      .valueChanges.pipe(
        startWith(new ConstanteModel),
        map((valorInput) => this.filtrarlistaTipoAcceso(valorInput))
      );
  }

  filtrarlistaTipoAcceso(val: any): ConstanteModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else{
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaTipoAcceso.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado));
  }

  setObservableCambioSelectOpcion(): void {
    this.listaOpcionFiltrada = this.form.get('opcion').valueChanges.pipe(
      startWith(new OpcionModel),
      map((valorInput) => this.filtrarlistaOpcion(valorInput))
    );
  }

  filtrarlistaOpcion(val: any): OpcionModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else{
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaOpcion.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado));
  }

  limpiarForm(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
    this.form.get('modulo').setErrors(null);
    this.form.get('opcion').setErrors(null);
    this.form.get('tipoAcceso').setErrors(null);
  }

  guardar(event: Event): void {
    event.preventDefault();
    if (this.form.valid) {
      this.opcionRol.intIdRol = this.idRol;
      this.opcionRol.intIdOpcion = this.form.value.opcion.intId;
      this.opcionRol.intIdTipoAcceso = this.form.value.tipoAcceso.intId;
      console.log(this.opcionRol);
      swal
        .fire({
          title: 'Confirmación',
          text: '¿Está seguro de guardar?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#004f91',
          cancelButtonColor: '#7B7A83',
          confirmButtonText: 'Sí, Aceptar!',
          cancelButtonText: 'No, Cancelar!',
        })
        .then((result) => {
          if (result.value) {
            this.opcionRolService
              .registrar(this.opcionRol)
              .subscribe((respuesta) => {
                swal.fire('Ok', respuesta.mensaje, 'success');
                this.limpiarForm();
                this.idOpcion = 0;
                this.listarOpcionRol.emit(true);
              });
          }
        });
    }
  }

  ocultarComponente(): void {
    this.cerrar.emit(false);
  }

  selectedModulo(event: any): void {
    this.idModuloSeleccionado = event.option.value.intId;
    this.obtenerListadoOpciones(this.idModuloSeleccionado);
  }

  obtenerListadoOpciones(idModuloSeleccionado: number): void {
    this.opcionService.listar().subscribe((rpta) => {
      this.listaOpcion = rpta.filter(
        (x) => x.intIdModulo === idModuloSeleccionado
      );
      this.setObservableCambioSelectOpcion()
    });
  }

  mostrarNombreModuloSelect(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
  }

  mostrarNombreOpcionSelect(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
  }

  mostrarNombreTipoAccesoSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

}
