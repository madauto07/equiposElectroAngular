import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';
import { DatoModel } from 'src/app/core/_model/info/dato-model';
import { DatoService } from 'src/app/core/_service/info/dato.service';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-datosmantenimiento-registrar',
  templateUrl: './datosmantenimiento-registrar.component.html',
  styles: [],
})
export class DatosmantenimientoRegistrarComponent implements OnInit, OnChanges {
  @Input() idPrefijo: number;
  @Input() idDatos: number;
  @Input() idNivel: number;
  @Input() idPrefijoLst: number;

  @Input() idSuperior: number;
  @Output() cerrar: EventEmitter<boolean> = new EventEmitter();
  @Output() listarDatos: EventEmitter<boolean> = new EventEmitter();

  form: FormGroup;
  model: DatoModel = new DatoModel();
  modelDato: DatoModel;
  listaDatos: DatoModel[];
  idModuloSeleccionado = 0;

  isLoading = false;
  isDisable = true;
  soloLectura = false;

  constructor(
    private formBuilder: FormBuilder,
    private datoService: DatoService,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.soloLectura = this.tipoAccesoService.getSoloLectura(
      EOpcion.Estructura
    );
    this.construirFormulario();
    //console.log(this.idSuperior);
  }

  ngOnInit(): void {
    this.inicializar();

    if (this.idSuperior === 0) {
      this.isDisable = true;
    } else {
      this.isDisable = false;
      this.obtenerListaDatos();
    }

    this.establecerDatosExistentes();

    console.log(this.idSuperior);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.establecerDatosExistentes();
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      controlCodigo: ['', Validators.required],
      controlValor: ['', Validators.required],
      controlCocoes: [''],
      controlEstado: [true],
      superiorSelect: [0],
      //estado : [true]
    });
  }

  inicializar(): void {
    this.limpiarForm();
    this.model = new DatoModel();
  }

  obtenerListaDatos(): void {
    this.isLoading = true;
    this.modelDato = new DatoModel();
    this.modelDato.intId = 0;
    this.modelDato.strNombre = 'Ninguno';
    this.datoService
      .select(0, this.idPrefijoLst)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe((rpta) => {
        this.listaDatos = rpta;
        this.listaDatos.splice(0, 0, this.modelDato);
        console.log('lista');
        console.log(rpta);
        console.log(this.idPrefijoLst);
        this.form.get('superiorSelect').setValue(0);
        // this.setObservableCambioSelectModulo();
      });
  }

  guardar(event: Event): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      event.preventDefault();
      if (this.form.valid) {
        this.model.intIdPrefijo = this.idPrefijo;
        this.model.intIdSuperior = this.form.value.superiorSelect;
        this.model.strCodigo = this.form.value.controlCodigo;
        this.model.strNombre = this.form.value.controlValor;
        this.model.strCocoes = this.form.value.controlCocoes;
        let estado = this.form.value.controlEstado;
        if (estado) {
          this.model.dbEstado = 1;
        } else {
          this.model.dbEstado = 0;
        }
        // console.log(this.form.value);

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
              if (this.idDatos > 0) {
                this.model.intId = this.idDatos;
                this.datoService
                  .Actualizar(this.model)
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.limpiarForm();
                    this.idDatos = 0;
                    this.listarDatos.emit(true);
                  });
              } else {
                this.datoService
                  .Registrar(this.model)
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.limpiarForm();
                    // this.idOpcion = 0;
                    this.listarDatos.emit(true);
                  });
              }
            }
          });
      }
    }
  }

  ocultarComponente(): void {
    this.cerrar.emit(false);
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

  getFontSize(): number {
    return 12;
  }

  EstablecerValorEnForm(nombreControl: string, valor: any) {
    this.form.get(nombreControl).setValue(valor);
    //console.log(this.formArea);
  }
  establecerDatosExistentes(): void {
    // console.log(this.idDatos);
    // console.log(this.idSuperior);

    if (this.idDatos > 0) {
      this.datoService.Obtener(this.idDatos).subscribe((result: DatoModel) => {
        this.model = result;
        this.form.get('controlCodigo').setValue(this.model.strCodigo);
        this.form.get('controlValor').setValue(this.model.strNombre);
        this.form.get('controlCocoes').setValue(this.model.strCocoes);

        let boolestado = this.model.dbEstado;
        if (boolestado === 1) {
          this.EstablecerValorEnForm('controlEstado', true);
        } else {
          this.EstablecerValorEnForm('controlEstado', false);
        }
        this.form.get('superiorSelect').setValue(this.model.intIdSuperior);
        // this.obtenerListadoModulos(true, this.model.intIdSuperior);
      });
    } else {
      this.limpiarForm();
      this.model = new DatoModel();
    }
  }

  limpiarForm(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
    this.EstablecerValorEnForm('controlEstado', true);

    this.form.get('superiorSelect').setErrors(null);
    // document.getElementById('controlCodigo').focus();
  }
}
