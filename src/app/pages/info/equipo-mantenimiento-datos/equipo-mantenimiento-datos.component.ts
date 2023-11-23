import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { EquipoModel } from 'src/app/core/_model/info/equipo-model';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { DatoModel } from 'src/app/core/_model/info/dato-model';
import { EquipoService } from 'src/app/core/_service/info/equipo.service';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { DatoService } from 'src/app/core/_service/info/dato.service';
import { forkJoin, Observable } from 'rxjs';

import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import {
  EConstante as ConstanteEnum,
  EConstante,
} from 'src/app/core/_model/general/EConstante';
import { IpService } from 'src/app/core/_service/general/ip.service';
import { BusquedaCodigoUbicacionTecnicaDialogComponent } from '../../modal-shared/busqueda-codigo-ubicacion-tecnica-dialog/busqueda-codigo-ubicacion-tecnica-dialog.component';
import { BusquedaCodigoEquipoDialogComponent } from '../../modal-shared/busqueda-codigo-equipo-dialog/busqueda-codigo-equipo-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';
@Component({
  selector: 'app-equipo-mantenimiento-datos',
  templateUrl: './equipo-mantenimiento-datos.component.html',
  styleUrls: ['./equipo-mantenimiento-datos.component.scss'],
})
export class EquipoMantenimientoDatosComponent implements OnInit {
  cargando = false;
  isDisabledBotonEquipo = false;
  form: FormGroup;
  ipAddress = '';
  idEquipo = 0;
  equipoModel: EquipoModel = new EquipoModel();
  listaTipoActivo: ConstanteModel[];
  listaTipoActivoFiltrada: Observable<ConstanteModel[]>;
  idMarca = 0;
  soloLectura = false;
  constructor(
    private formBuilder: FormBuilder,
    private equipoService: EquipoService,
    private constanteService: ConstanteService,
    private datoService: DatoService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private ipService: IpService,
    public dialog: MatDialog,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.construirFormulario();
    this.obtenerIdUrl();
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Equipo);
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      id: [0],
      descripcion: ['', Validators.required],
      serie: ['', Validators.required],
      codigoSitec: [''],
      tipoActivoSelectAC: [new ConstanteModel(), Validators.required],
      nivel01: ['', Validators.required],
      nivel23: ['', Validators.required],
      marca: [''],
      modelo: [''],
      estado: [true],
    });
    this.form.get('tipoActivoSelectAC').valueChanges.subscribe((value) => {
      let tipoActivoSel: ConstanteModel = value;
      if (tipoActivoSel.intId == EConstante.TipoActivoUbicacionTecnica) {
        this.form.get('nivel23').setValidators(null);
      } else {
        this.form.get('nivel23').setValidators([Validators.required]);
      }
      this.form.get('nivel23').updateValueAndValidity();
    });
  }

  obtenerIdUrl(): void {
    this.idEquipo = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.getIP();
    this.cargando = true;
    const obs = forkJoin([
      this.constanteService.listarControlId(TipoConstanteEnum.TipoActivo), //0
    ]);
    obs
      .pipe(
        finalize(() => {
          this.cargando = false;
        })
      )
      .subscribe({
        next: (value) => {
          this.listaTipoActivo = value[0].Items;
        },
        complete: () => {
          this.setObservableCambioSelectTipoActivo();
          this.obtenerDatos();
          document.getElementById('controlDescripcion').focus();
        },
      });
  }

  obtenerDatos(): void {
    if (this.idEquipo > 0) {
      this.equipoService.obtener(this.idEquipo).subscribe((result) => {
        this.equipoModel = result;
        this.form.get('id').setValue(this.idEquipo);
        this.form.get('descripcion').setValue(this.equipoModel.strNombre);
        this.form.get('serie').setValue(this.equipoModel.strNumeroSerie);
        this.form.get('codigoSitec').setValue(this.equipoModel.strCodigoSITEC);
        if (this.equipoModel.intIdTipoActivo != 0) {
          const tipoActivo = this.listaTipoActivo.find(
            (x) => x.intId === this.equipoModel.intIdTipoActivo
          );
          if (tipoActivo) {
            this.form.get('tipoActivoSelectAC').setValue(tipoActivo);
          }
        }
        this.form.get('nivel01').setValue(this.equipoModel.strUbicacionTecnica);
        this.form.get('nivel23').setValue(this.equipoModel.strCodigoEquipo);
        this.idMarca = this.equipoModel.intIdMarca;
        this.form
          .get('marca')
          .setValue(this.equipoModel.objDatoMarca.strNombre);
        this.form.get('modelo').setValue(this.equipoModel.strModelo);
        if (this.equipoModel.intEstado === 1) {
          this.form.get('estado').setValue(true);
        } else {
          this.form.get('estado').setValue(false);
        }
      });
    }
  }

  setObservableCambioSelectTipoActivo(): void {
    this.listaTipoActivoFiltrada = this.form
      .get('tipoActivoSelectAC')
      .valueChanges.pipe(
        startWith(new ConstanteModel()),
        map((valorInput) => this.filtrarlistaTipoActivo(valorInput))
      );
  }

  filtrarlistaTipoActivo(val: any): ConstanteModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strValor ? val.strValor : '';
    }
    return this.listaTipoActivo.filter((x) =>
      x.strValor.toLowerCase().includes(valorFiltrado)
    );
  }

  getIP() {
    this.ipService.getIPAddress().subscribe((res: any) => {
      this.ipAddress = res.ip;
    });
  }

  guardar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.form.valid) {
        const form = this.form.value;
        this.equipoModel.strNombre = form.descripcion;
        this.equipoModel.strNumeroSerie = form.serie;
        this.equipoModel.strCodigoSITEC = form.codigoSitec;
        this.equipoModel.intIdTipoActivo = form.tipoActivoSelectAC.intId;
        this.equipoModel.strUbicacionTecnica = form.nivel01;
        this.equipoModel.strCodigoEquipo = form.nivel23;
        this.equipoModel.strCodigoKKS = `${
          this.equipoModel.strUbicacionTecnica
        } ${
          this.equipoModel.strCodigoEquipo
            ? this.equipoModel.strCodigoEquipo
            : ''
        }`;
        this.equipoModel.intIdMarca = this.idMarca;
        this.equipoModel.strModelo = form.modelo;
        this.equipoModel.strIPCreacion = this.ipAddress;
        // Obtener el usuario
        this.equipoModel.strUsuarioCreacion = localStorage.getItem('username');
        const valorEstado = form.estado;
        if (valorEstado) {
          this.equipoModel.intEstado = 1;
        } else {
          this.equipoModel.intEstado = 0;
        }
        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios del activo?.',
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
                this.equipoModel.intId = form.id;
                this.cargando = true;

                this.equipoService
                  .actualizar(this.equipoModel)
                  .pipe(finalize(() => (this.cargando = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.router.navigateByUrl(`info/equipos`);
                  });
              } else {
                this.cargando = true;
                this.equipoService
                  .registrar(this.equipoModel)
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
        text: '¿Está seguro de salir? Los datos del activo no se guardarán.',
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

  onSelectionChange(event) {
    console.log(event.option.value.intId);
    this.form.get('nivel23').reset();
    this.form.get('nivel23').setValue('');
    this.idMarca = 0;
    this.form.get('marca').reset();
    this.form.get('marca').setValue('');
    this.form.get('modelo').reset();
    this.form.get('modelo').setValue('');
    if (event.option.value.intId === ConstanteEnum.TipoActivoEquipo) {
      this.form.get('nivel23').enable();
      this.form.get('marca').enable();
      this.form.get('modelo').enable();
      this.isDisabledBotonEquipo = false;
    } else {
      this.form.get('nivel23').disable();
      this.form.get('marca').disable();
      this.form.get('modelo').disable();
      this.isDisabledBotonEquipo = true;
    }
  }

  desplegarUbicacionTecnica() {
    const dialogRef = this.dialog.open(
      BusquedaCodigoUbicacionTecnicaDialogComponent,
      {
        width: '50%',
        height: '90%',
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.form
          .get('nivel01')
          .setValue(result.codigoUbicacionTecnicaSeleccionado);
      }
    });
  }

  desplegarEquipo() {
    const dialogRef = this.dialog.open(BusquedaCodigoEquipoDialogComponent, {
      width: '50%',
      height: '90%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.form.get('nivel23').setValue(result.codigoEquipoSeleccionado);
        if (result.objDatoA0Seleccionado) {
          let datoA0: DatoModel = result.objDatoA0Seleccionado;
          this.idMarca = datoA0.intId;
          this.form.get('marca').setValue(datoA0.strNombre);
        }
      }
    });
  }
}
