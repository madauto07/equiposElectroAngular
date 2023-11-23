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
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-equipo-mantenimiento-ficha',
  templateUrl: './equipo-mantenimiento-ficha.component.html',
  styleUrls: ['./equipo-mantenimiento-ficha.component.scss'],
})
export class EquipoMantenimientoFichaComponent implements OnInit {
  cargando = false;
  form: FormGroup;

  idEquipo = 0;
  equipoModel: EquipoModel = new EquipoModel();
  listaTipoEquipo: ConstanteModel[];
  listaTipoEquipoFiltrada: Observable<ConstanteModel[]>;
  soloLectura = false;
  constructor(
    private formBuilder: FormBuilder,
    private equipoService: EquipoService,
    private constanteService: ConstanteService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.construirFormulario();
    this.obtenerIdUrl();
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Equipo);
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      codigoKKS: [''],
      codigoSITEC: [''],
      descripcion: [''],
      marca: [''],
      modelo: [''],
      tipoEquipoSelectAC: [new ConstanteModel()],
      cantidad: [0],
      fechaFabricacion: [''],
      serie: [''],
      referencia: [''],
      tipo: [''],
      fechaInstalacion: [''],
      informe: [''],
    });
  }

  obtenerIdUrl(): void {
    this.idEquipo = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.cargando = true;
    this.constanteService
      .listarControlId(TipoConstanteEnum.TipoEquipo)
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (rpta) => {
          this.listaTipoEquipo = rpta.Items;
        },
        complete: () => {
          this.setObservableCambioSelectTipoEquipo();
          this.obtenerDatos();
          document.getElementById('controlDescripcion').focus();
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
    if (this.idEquipo) {
      this.equipoService.obtener(this.idEquipo).subscribe((result) => {
        this.equipoModel = result;
        this.form.get('codigoKKS').setValue(this.equipoModel.strCodigoKKS);
        this.form.get('codigoSITEC').setValue(this.equipoModel.strCodigoSITEC);
        this.form.get('descripcion').setValue(this.equipoModel.strNombre);
        this.form
          .get('marca')
          .setValue(this.equipoModel.objDatoMarca.strNombre);
        this.form.get('modelo').setValue(this.equipoModel.strModelo);
        if (this.equipoModel.intIdTipoEquipo != 0) {
          const tipoEquipo = this.listaTipoEquipo.find(
            (x) => x.intId === this.equipoModel.intIdTipoEquipo
          );
          if (tipoEquipo) {
            this.form.get('tipoEquipoSelectAC').setValue(tipoEquipo);
          }
        }
        this.form.get('cantidad').setValue(this.equipoModel.intCantidad);
        this.form
          .get('fechaFabricacion')
          .setValue(this.equipoModel.dtFechaFabricacion);
        this.form.get('serie').setValue(this.equipoModel.strSerie);
        this.form.get('referencia').setValue(this.equipoModel.strReferencia);
        this.form.get('tipo').setValue(this.equipoModel.strTipoEquipo);
        this.form
          .get('fechaInstalacion')
          .setValue(this.equipoModel.dtFechaInstalacion);
        this.form.get('informe').setValue(this.equipoModel.strInforme);
      });
    }
  }

  guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.form.valid) {
        const form = this.form.value;
        this.equipoModel.intIdTipoEquipo = form.tipoEquipoSelectAC.intId;
        this.equipoModel.intCantidad = form.cantidad;
        this.equipoModel.dtFechaFabricacion = form.fechaFabricacion;
        this.equipoModel.strSerie = form.serie;
        this.equipoModel.strReferencia = form.referencia;
        this.equipoModel.strTipoEquipo = form.tipo;
        this.equipoModel.dtFechaInstalacion = form.fechaInstalacion;
        this.equipoModel.strInforme = form.informe;
        this.equipoModel.strUsuarioCreacion = localStorage.getItem('username');
        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios en ficha técnica del activo?.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#004f91',
            cancelButtonColor: '#7B7A83',
            confirmButtonText: 'Sí, Aceptar!',
            cancelButtonText: 'No, Cancelar!',
          })
          .then((result) => {
            if (result.value) {
              if (this.idEquipo > 0) {
                this.equipoModel.intId = this.idEquipo;
                this.cargando = true;
                this.equipoService
                  .actualizar(this.equipoModel)
                  .pipe(finalize(() => (this.cargando = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`info/equipos`);
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
        text: '¿Está seguro de salir? Los datos de la ficha tecnica del activo no se guardarán.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Sí, Aceptar!',
        cancelButtonText: 'No, Cancelar!',
      })
      .then((result) => {
        if (result.value) {
          this.router.navigateByUrl(`info/equipos`);
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
}
