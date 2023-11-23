import { Component, OnInit } from '@angular/core';
import { AbstractControl,Validators, FormBuilder, FormGroup,ValidatorFn } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { TrabajadorModel } from 'src/app/core/_model/administracion/trabajador-model';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { AreaModel } from 'src/app/core/_model/administracion/area-model';
import { TrabajadorService } from 'src/app/core/_service/administracion/trabajador.service';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { AreaService } from 'src/app/core/_service/administracion/area.service';
import { Observable } from 'rxjs';

import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

function autocompleteObjectValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (typeof control.value === 'string') {
      return { 'invalidAutocompleteObject': { value: control.value } }
    }
    return null  /* valid option selected */
  }
}

@Component({
  selector: 'app-trabajador-mantenimiento',
  templateUrl: './trabajador-mantenimiento.component.html',
  styleUrls: ['./trabajador-mantenimiento.component.scss'],
})
export class TrabajadorMantenimientoComponent implements OnInit {
  isLoadingResults = false;
  form: FormGroup;

  idTrabajador = 0;
  trabajadorModel: TrabajadorModel = new TrabajadorModel();
  listaEspecialidad: ConstanteModel[];
  listaEspecialidadFiltrada: Observable<ConstanteModel[]>;
  listaArea: AreaModel[];
  listaAreaFiltrada: Observable<AreaModel[]>;
  soloLectura = false;
  emailRegex ='^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$';

  public validation_msgs = {
    'areaAutocompleteControl': [
      { type: 'invalidAutocompleteObject', message: 'Nombre del area no reconocido. Elegir una opción correcta.' },
      { type: 'required', message: 'Area es requerido.' }
    ],
    'phoneLabelAutocompleteControl': [
      { type: 'invalidAutocompleteString', message: 'Phone label not recognized. Click one of the autocomplete options.' },
      { type: 'required', message: 'Phone label is required.' }
    ]
  }

  constructor(
    private formBuilder: FormBuilder,
    private trabajadorService: TrabajadorService,
    private constanteService: ConstanteService,
    private areaService: AreaService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService

  ) {
    this.construirFormulario();
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Trabajadores);
  }

  ngOnInit(): void {
    this.obtenerIdUrl();
    this.setObservableCambioSelectEspecialidad();
    this.setObservableCambioSelectArea();
    if (this.idTrabajador === 0) {
      // Nuevo
      this.obtenerListaEspecialidad();
      this.obtenerListaArea();
    } else {
      // Editar
      this.obtenerDatos();
    }
  }

  obtenerIdUrl(): void {
    this.idTrabajador = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  obtenerDatos(): void {
    this.trabajadorService.obtener(this.idTrabajador).subscribe((result) => {
      this.trabajadorModel = result;
      this.form.get('intId').setValue(this.idTrabajador);
      this.obtenerListaArea(this.trabajadorModel.objArea);
      this.form.get('strNombre').setValue(this.trabajadorModel.strNombre);
      this.form.get('strApellido').setValue(this.trabajadorModel.strApellido);
      this.form.get('strCodigo').setValue(this.trabajadorModel.strCodigo);
      this.obtenerListaEspecialidad(this.trabajadorModel.objEspecialidad);
      this.form.get('strTelefono').setValue(this.trabajadorModel.strTelefono);
      this.form.get('strCorreo').setValue(this.trabajadorModel.strCorreo);
      if (this.trabajadorModel.intEstado === 1) {
        this.form.get('intEstado').setValue(true);
      } else {
        this.form.get('intEstado').setValue(false);
      }
    });
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      intId: [0],
      area: ['',  [autocompleteObjectValidator(), Validators.required] ],
      strNombre: ['', Validators.required],
      strApellido: ['', Validators.required],
      strCodigo: ['', Validators.required],
      especialidad: ['',Validators.required],
      strTelefono: [''],
      strCorreo: ['', [Validators.required,Validators.email,
      Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      intEstado: [true],
    });
  }

  getErrorMessage() {
    if (this.form.hasError('required')) {
      return 'You must enter a value';
    }

    return this.form.hasError('email') ? 'Not a valid email' : '';
  }

  obtenerListaEspecialidad(especialidad: any = ''): void {
    this.isLoadingResults = true;
    this.constanteService
      .listarControlId(TipoConstanteEnum.Especialidad)
      .pipe(
        finalize(() => {
          this.isLoadingResults = false;
        })
      )
      .subscribe((rpta) => {
        this.listaEspecialidad = rpta.Items;
        this.form.get('especialidad').setValue(especialidad);
      });
  }

  setObservableCambioSelectEspecialidad(): void {
    this.listaEspecialidadFiltrada = this.form
      .get('especialidad')
      .valueChanges.pipe(
        startWith(''),
        map((valorInput) => this.filtrarlistaEspecialidad(valorInput))
      );
  }

  filtrarlistaEspecialidad(val: any) {
    if (this.listaEspecialidad) {
      let valorFiltrado = '';
      if (typeof val === 'string') {
        valorFiltrado = val;
      } else if (typeof val === 'object') {
        valorFiltrado = val.strValor;
      }
      return this.listaEspecialidad.filter((x) =>
        x.strValor.toLowerCase().includes(valorFiltrado)
      );
    }else{
      return [];
    }
  }

  obtenerListaArea(area: any = ''): void {
    this.isLoadingResults = true;
    this.areaService
      .listar()
      .pipe(
        finalize(() => {
          this.isLoadingResults = false;
        })
      )
      .subscribe((rpta) => {
        this.listaArea = rpta.Items;
        this.form.get('area').setValue(area);
      });
  }

  setObservableCambioSelectArea(): void {
    this.listaAreaFiltrada = this.form.get('area').valueChanges.pipe(
      startWith(''),
      map((valorInput) => this.filtrarlistaArea(valorInput))
    );
  }

  filtrarlistaArea(val: any) {
    if (this.listaArea) {
      let valorFiltrado = '';
      if (typeof val === 'string') {
        valorFiltrado = val;
      } else if (typeof val === 'object') {
        valorFiltrado = val.strNombre;
      }
      return this.listaArea.filter((x) =>
        x.strNombre.toLowerCase().includes(valorFiltrado)
      );
    }else{
      return [];
    }
  }

  guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
    if (this.form.valid) {
      const form = this.form.value;
      this.trabajadorModel.intIdArea = form.area.intId;
      this.trabajadorModel.strNombre = form.strNombre;
      this.trabajadorModel.strApellido = form.strApellido;
      this.trabajadorModel.strCodigo = form.strCodigo;
      this.trabajadorModel.intIdEspecialidad = form.especialidad.intId;
      this.trabajadorModel.strTelefono = form.strTelefono;
      this.trabajadorModel.strCorreo = form.strCorreo;
      const valorEstado = form.intEstado;
      if (valorEstado) {
        this.trabajadorModel.intEstado = 1;
      } else {
        this.trabajadorModel.intEstado = 0;
      }
      swal
        .fire({
          title: 'Confirmación',
          text: '¿Está seguro de guardar los cambios del trabajador?.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#004f91',
          cancelButtonColor: '#7B7A83',
          confirmButtonText: 'Sí, Aceptar!',
          cancelButtonText: 'No, Cancelar!',
        })
        .then((result) => {
          if (result.value) {
            if (this.idTrabajador > 0) {
              this.trabajadorModel.intId = form.intId;
              this.isLoadingResults = true;

              this.trabajadorService
                .actualizar(this.trabajadorModel)
                .pipe(finalize(() => (this.isLoadingResults = false)))
                .subscribe((respuesta) => {
                  swal.fire('Ok', respuesta.mensaje, 'success');
                  this.router.navigateByUrl(`administracion/trabajadores`);
                });
            } else {
              this.isLoadingResults = true;
              this.trabajadorService
                .registrar(this.trabajadorModel)
                .pipe(finalize(() => (this.isLoadingResults = false)))
                .subscribe((respuesta) => {
                  if(respuesta.exito)
                  {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`administracion/trabajadores`);

                  }else{
                    swal.fire('Error', respuesta.mensaje, 'error');

                  }
                 
                });
            }
          }
        });
    }
  }
  }

  cancelar(): void {
    swal
      .fire({
        title: 'Confirmación',
        text: '¿Está seguro de salir? Los datos del trabajador no se guardarán.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Sí, Aceptar!',
        cancelButtonText: 'No, Cancelar!',
      })
      .then((result) => {
        if (result.value) {
          this.router.navigateByUrl(`administracion/trabajadores`);
        }
      });
  }

  getFontSize(): number {
    return 12;
  }

  mostrarNombreEspecialidadSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  mostrarNombreAreaSelect(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
  }
}
