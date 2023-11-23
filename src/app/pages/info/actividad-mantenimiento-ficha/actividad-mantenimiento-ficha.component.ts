import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { EquipoModel } from 'src/app/core/_model/info/equipo-model';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { EquipoService } from 'src/app/core/_service/info/equipo.service';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { Observable } from 'rxjs';
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { formatDate } from '@angular/common';
import { ActividadModel } from 'src/app/core/_model/info/actividad-model';
import { ActividadService } from 'src/app/core/_service/info/actividad.service';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';
@Component({
  selector: 'app-actividad-mantenimiento-ficha',
  templateUrl: './actividad-mantenimiento-ficha.component.html',
  styles: [],
})
export class ActividadMantenimientoFichaComponent implements OnInit {
  cargando = false;
  form: FormGroup;

  //idctividad = 0;
  equipoModel: EquipoModel = new EquipoModel();
  listaTipoEquipo: ConstanteModel[];
  listaTipoEquipoFiltrada: Observable<ConstanteModel[]>;
  textSelectedTipoFiltro = 'Todos';

  idActividad = 0;
  actividadModel: ActividadModel = new ActividadModel();
  listaTipoPersonal: ConstanteModel[];
  tipoPersonalTodos: ConstanteModel;
  soloLectura = false;
  constructor(
    private formBuilder: FormBuilder,
    private equipoService: EquipoService,
    private actividadService: ActividadService,
    private constanteService: ConstanteService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.construirFormulario();
    this.obtenerIdUrl();
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Actividad);
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      numeroVersion: [''],
      fechaVersion: [''],
      horaInicio: [''],
      horaFin: [''],
      selectTipoPersonal: [0],
      procedimiento: [''],
      procedimientoTecnico: [''],
      proteccionPersonal: [''],
      prevencionOperacional: [''],
    });
  }

  obtenerIdUrl(): void {
    this.idActividad = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    // this.cargando = true;
    // this.obtenerListadoModulos();
    this.cargando = true;
    this.constanteService
      .listarControlId(TipoConstanteEnum.TipoPersonal)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (rpta) => {
          this.listaTipoPersonal = rpta.Items;
        },
        complete: () => {
          // this.setObservableCambioSelectTipoEquipo();
          this.obtenerDatos();
          document.getElementById('selectTipoPersonal').focus();
        },
      });
  }

  setObservableCambioSelectTipoEquipo(): void {
    this.listaTipoEquipoFiltrada = this.form
      .get('tipoEquipoSelectAC')
      .valueChanges.pipe(
        startWith(new ConstanteModel()),
        map((valorInput) => this.filtrarlistaTipoEquipo(valorInput))
      );
  }

  filtrarlistaTipoEquipo(val: any): ConstanteModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strValor ? val.strValor : '';
    }
    return this.listaTipoEquipo.filter((x) =>
      x.strValor.toLowerCase().includes(valorFiltrado)
    );
  }

  obtenerDatos(): void {
    if (this.idActividad) {
      this.actividadService.obtener(this.idActividad).subscribe((result) => {
        this.actividadModel = result;
        this.form
          .get('numeroVersion')
          .setValue(this.actividadModel.intNumeroVersion);
        this.form
          .get('fechaVersion')
          .setValue(this.actividadModel.dtFechaVersion);
        this.form.get('horaInicio').setValue(this.actividadModel.strHoraInicio);
        this.form.get('horaFin').setValue(this.actividadModel.strHoraFin);

        if (this.actividadModel.intIdTipoPersonal != 0) {
          const tipoPersonal = this.listaTipoPersonal.find(
            (x) => x.intId === this.actividadModel.intIdTipoPersonal
          );
          if (tipoPersonal) {
            this.form.get('selectTipoPersonal').setValue(tipoPersonal);
          }
        }
        this.form
          .get('procedimiento')
          .setValue(this.actividadModel.strProcedimiento);
        this.form
          .get('procedimientoTecnico')
          .setValue(this.actividadModel.strProcedimientoTecnico);
        this.form
          .get('proteccionPersonal')
          .setValue(this.actividadModel.strProteccionPersonal);
        this.form
          .get('prevencionOperacional')
          .setValue(this.actividadModel.strPrevencionOperacional);

        // if (this.equipoModel.intEstado === 1) {
        //   this.form.get('estado').setValue(true);
        // } else {
        //   this.form.get('estado').setValue(false);
        // }
      });
    }
  }

  guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.form.valid) {
        const form = this.form.value;
        console.log(form.fechaVersion);
        
        this.actividadModel.intId = this.idActividad;
        this.actividadModel.intNumeroVersion = form.numeroVersion;
        this.actividadModel.dtFechaVersion = form.fechaVersion;
        this.actividadModel.strHoraInicio = form.horaInicio;
        this.actividadModel.strHoraFin = form.horaFin;
        this.actividadModel.intIdTipoPersonal = form.selectTipoPersonal;
        this.actividadModel.strProcedimiento = form.procedimiento;
        this.actividadModel.strProcedimientoTecnico = form.procedimientoTecnico;
        this.actividadModel.strProteccionPersonal = form.proteccionPersonal;
        this.actividadModel.strPrevencionOperacional =
          form.prevencionOperacional;

        // console.log(this.form);

        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios en ficha técnica?.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#004f91',
            cancelButtonColor: '#7B7A83',
            confirmButtonText: 'Sí, Aceptar!',
            cancelButtonText: 'No, Cancelar!',
          })
          .then((result) => {
            if (result.value) {
              if (this.idActividad > 0) {
                this.actividadModel.intId = this.idActividad;
                this.cargando = true;
                this.actividadService
                  .actualizar(this.actividadModel)
                  .pipe(finalize(() => (this.cargando = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`info/actividades`);
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
        text: '¿Está seguro de salir? Los datos de la ficha tecnica no se guardarán.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Sí, Aceptar!',
        cancelButtonText: 'No, Cancelar!',
      })
      .then((result) => {
        if (result.value) {
          this.router.navigateByUrl(`info/actividades`);
        }
      });
  }

  getFontSize(): number {
    return 12;
  }

  mostrarNombreTipoEquipoSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  obtenerListadoModulos(isEdit: boolean = false, value: number = 0): void {
    this.cargando = true;
    this.tipoPersonalTodos = new ConstanteModel();
    this.tipoPersonalTodos.intId = 0;
    this.tipoPersonalTodos.strValor = 'Ninguno';
    this.constanteService
      .listarControlId(TipoConstanteEnum.TipoPersonal)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe((rpta) => {
        this.listaTipoPersonal = rpta.Items;
        this.listaTipoPersonal.splice(0, 0, this.tipoPersonalTodos);
        // console.log(rpta);
        if (isEdit) {
          this.form.get('selectTipoPersonal').setValue(value);
        }
      });
  }

  selectedValueTipo(event: any): void {
    this.textSelectedTipoFiltro = event.source.triggerValue;
  }
}
