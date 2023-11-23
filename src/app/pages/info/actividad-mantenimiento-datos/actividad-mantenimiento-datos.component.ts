import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { ActividadModel } from 'src/app/core/_model/info/actividad-model';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { DatoModel } from 'src/app/core/_model/info/dato-model';
import { EquipoService } from 'src/app/core/_service/info/equipo.service';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { DatoService } from 'src/app/core/_service/info/dato.service';
import { forkJoin, Observable } from 'rxjs';

import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { SubconstanteModel } from 'src/app/core/_model/administracion/sub-constante-model';
import { SubconstanteService } from 'src/app/core/_service/administracion/subconstante.service';
import { ActividadService } from 'src/app/core/_service/info/actividad.service';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-actividad-mantenimiento-datos',
  templateUrl: './actividad-mantenimiento-datos.component.html',
  styleUrls: ['./actividad-mantenimiento-datos.component.scss'],
})
export class ActividadMantenimientoDatosComponent implements OnInit {
  cargando = false;
  form: FormGroup;

  idActividad = 0;
  idParte = 0;
  constante: ConstanteModel;
  subconstante: SubconstanteModel;
  actividadModel: ActividadModel = new ActividadModel();
  textSelectedConstante = 'Todos';
  listaTipoPersonal: ConstanteModel[];
  /**  listados*/
  listaTipoMantenimiento: ConstanteModel[];
  listaObjeto: ConstanteModel[];
  listaNivelResp: ConstanteModel[];
  listaParte: ConstanteModel[];
  listaSubParte: SubconstanteModel[];
  listaTipoRive: ConstanteModel[];
  soloLectura = false;
  constructor(
    private formBuilder: FormBuilder,
    private actividadService: ActividadService,
    private constanteService: ConstanteService,
    private subConstanteService: SubconstanteService,
    private datoService: DatoService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Actividad);
    this.construirFormulario();
    this.obtenerIdUrl();
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      id: [0],
      selectTipoPersonal: [0],
      selectTipoMantenimiento: [0, Validators.required],
      selectObjeto: [0],
      selectParte: [0],
      selectSubParte: [0],
      selectNivelResp: [0],
      selectTipoRive: [0],
      titulo: ['', Validators.required],
      duracion: ['', Validators.required],
      estado: [true],
    });
  }

  obtenerIdUrl(): void {
    this.idActividad = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.cargando = true;
    this.constante = new ConstanteModel();
    this.constante.intId = 0;
    this.constante.strValor = 'Ninguno';
    this.constante.strCodigo = '-';
    const obs = forkJoin([
      this.constanteService.listarControlId(
        TipoConstanteEnum.TipoMantenimiento
      ), //0
      this.constanteService.listarControlId(TipoConstanteEnum.Objeto), //1
      this.constanteService.listarControlId(TipoConstanteEnum.Parte), //2
      this.constanteService.listarControlId(TipoConstanteEnum.NivelResp), //3
      this.constanteService.listarControlId(TipoConstanteEnum.TipoRive), //3
    ]);
    obs
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (value) => {
          this.listaTipoMantenimiento = value[0].Items;
          this.listaObjeto = value[1].Items;
          this.listaParte = value[2].Items;
          this.listaNivelResp = value[3].Items;
          this.listaTipoRive = value[4].Items;

          this.listaTipoMantenimiento.splice(0, 0, this.constante);
          this.listaObjeto.splice(0, 0, this.constante);
          this.listaParte.splice(0, 0, this.constante);
          this.listaNivelResp.splice(0, 0, this.constante);
          this.listaTipoRive.splice(0, 0, this.constante);
          //console.log(value[0].Items);
          //console.log(value[1].Items);
        },
        complete: () => {
          // this.setObservableCambioSelectTipoActivo();
          //  this.setObservableCambioSelectMarca();
          this.obtenerDatos();
          // document.getElementById('titulo').focus();
        },
      });
  }

  obtenerDatos(): void {
    if (this.idActividad) {
      this.actividadService.obtener(this.idActividad).subscribe((result) => {
        console.log(result);
        this.actividadModel = result;
        this.form.get('id').setValue(this.idActividad);
        this.form.get('titulo').setValue(this.actividadModel.strNombre);
        this.form.get('duracion').setValue(this.actividadModel.strDuracion);

        if (this.actividadModel.intIdTipoMantenimiento != 0) {
          const tipoManteimiento = this.listaTipoMantenimiento.find(
            (x) => x.intId === this.actividadModel.intIdTipoMantenimiento
          );
          if (tipoManteimiento) {
            this.form
              .get('selectTipoMantenimiento')
              .setValue(tipoManteimiento.intId);
          }
        }

        if (this.actividadModel.intIdNivelResponsabilidad != 0) {
          const nivelResp = this.listaNivelResp.find(
            (x) => x.intId === this.actividadModel.intIdNivelResponsabilidad
          );
          if (nivelResp) {
            this.form.get('selectNivelResp').setValue(nivelResp.intId);
          }
        }

        if (this.actividadModel.intIdObjeto != 0) {
          const objeto = this.listaObjeto.find(
            (x) => x.intId === this.actividadModel.intIdObjeto
          );
          if (objeto) {
            this.form.get('selectObjeto').setValue(objeto.intId);
          }
        }

        if (this.actividadModel.intIdTipoRive != 0) {
          const tipoRiv = this.listaTipoRive.find(
            (x) => x.intId === this.actividadModel.intIdTipoRive
          );
          if (tipoRiv) {
            this.form.get('selectTipoRive').setValue(tipoRiv.intId);
          }
        }

        if (this.actividadModel.intIdParte != 0) {
          const parte = this.listaParte.find(
            (x) => x.intId === this.actividadModel.intIdParte
          );
          if (parte) {
            this.form.get('selectParte').setValue(parte.intId);
            this.idParte = parte.intId;

            // this.obtenerListadoSubConstante(true, this.actividadModel.intIdSubParte);
          }
        }

        if (this.actividadModel.intEstado === 1) {
          this.form.get('estado').setValue(true);
        } else {
          this.form.get('estado').setValue(false);
        }
      });
    }
  }

  guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.form.valid) {
        const form = this.form.value;
        this.actividadModel.strNombre = form.titulo;
        this.actividadModel.intIdTipoMantenimiento =
          form.selectTipoMantenimiento;
        this.actividadModel.intIdObjeto = form.selectObjeto;
        this.actividadModel.intIdParte = form.selectParte;
        this.actividadModel.intIdSubParte = form.selectSubParte;
        this.actividadModel.intIdNivelResponsabilidad = form.selectNivelResp;
        this.actividadModel.intIdTipoRive = form.selectTipoRive;
        this.actividadModel.intIdTipoMantenimiento =
          form.selectTipoMantenimiento;
        this.actividadModel.strDuracion = form.duracion;
        const valorEstado = form.estado;
        if (valorEstado) {
          this.actividadModel.intEstado = 1;
        } else {
          this.actividadModel.intEstado = 0;
        }
        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios de actividad?.',
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
                this.actividadModel.intId = form.id;
                this.cargando = true;

                this.actividadService
                  .actualizar(this.actividadModel)
                  .pipe(finalize(() => (this.cargando = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`info/actividades`);
                  });
              } else {
                this.cargando = true;
                // console.log('model actividad');
                //console.log(this.actividadModel);
                this.actividadService
                  .registrar(this.actividadModel)
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
        text: '¿Está seguro de salir? Los datos no se guardarán.',
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

  mostrarNombreTipoActivoSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  mostrarNombreMarcaSelect(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
  }

  selectedValueTipo(event: any): void {
    this.textSelectedConstante = event.source.triggerValue;
  }
  selectedValueNivelResp(event: any): void {
    this.textSelectedConstante = event.source.triggerValue;
  }

  selectedValueObjeto(event: any): void {
    this.textSelectedConstante = event.source.triggerValue;
  }

  obtenerListadoSubConstante(isEdit: boolean = false, value: number = 0): void {
    this.cargando = true;
    this.subconstante = new SubconstanteModel();
    this.subconstante.intId = 0;
    this.subconstante.strValor = 'Ninguno';
    this.subconstante.strCodigo = '-';
    // console.log(value);
    //console.log(this.idParte);

    this.subConstanteService
      .listarControlId(this.idParte)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe((rpta) => {
        this.listaSubParte = rpta.Items;

        //  console.log(this.listaSubParte);

        this.listaSubParte.splice(0, 0, this.subconstante);

        let itemsub = this.listaSubParte.find((f) => (f.intId = value));
        this.form.get('selectSubParte').setValue(itemsub);
        //   console.log(itemsub);
        if (isEdit) {
          // this.form.get('selectSubParte').setValue(itemsub);
        }
      });
  }

  selectedValueParte(event: any): void {
    this.textSelectedConstante = event.source.triggerValue;

    if (event.source.value) {
      let codigo = event.source.value;
      // leer subconstante
      this.subConstanteService.listarControlId(codigo).subscribe((data) => {
        this.listaSubParte = data.Items;
        // console.log(data);
      });
    }
  }

  selectedValueSubParte(event: any): void {
    this.textSelectedConstante = event.source.triggerValue;
  }

  selectedValueTipoRive(event: any): void {
    this.textSelectedConstante = event.source.triggerValue;
  }
}
