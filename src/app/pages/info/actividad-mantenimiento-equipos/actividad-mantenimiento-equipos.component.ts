import {
  AfterViewInit,
  Component,
  Inject,
  LOCALE_ID,
  OnInit,
  ViewChild,
} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, startWith } from 'rxjs/operators';
import swal from 'sweetalert2';
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { EquipoModel } from 'src/app/core/_model/info/equipo-model';
import { ActividadEquipoModel } from 'src/app/core/_model/info/actividad-equipo-model';
import { ActividadEquipoService } from 'src/app/core/_service/info/actividad-equipo.service';
import { EquipoService } from 'src/app/core/_service/info/equipo.service';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BusquedaCodigoUbicacionTecnicaDialogComponent } from '../../modal-shared/busqueda-codigo-ubicacion-tecnica-dialog/busqueda-codigo-ubicacion-tecnica-dialog.component';
import { BusquedaCodigoEquipoDialogComponent } from '../../modal-shared/busqueda-codigo-equipo-dialog/busqueda-codigo-equipo-dialog.component';
import { MatSort } from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import { ActividadProgramacionDialogComponent } from '../../modal-shared/actividad-programacion-dialog/actividad-programacion-dialog.component';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-actividad-mantenimiento-equipos',
  templateUrl: './actividad-mantenimiento-equipos.component.html',
  styleUrls: ['./actividad-mantenimiento-equipos.component.scss'],
})
export class ActividadMantenimientoEquiposComponent implements OnInit,AfterViewInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  displayedColumnsAsignados: string[];
  dataSource = new MatTableDataSource<EquipoModel>();
  dataSourceAsignado = new MatTableDataSource<ActividadEquipoModel>();
  numeroFilas: number;
  pageSizeOptions: number[];
  cantidadRegistros = 0;
  isLoadingResults = false;


  numeroFilasAsignados: number;
  pageSizeOptionsAsignados: number[];
  cantidadRegistrosAsignados = 0;
  isLoadingResultsAsignados = false;

  actividadEquipoModel : ActividadEquipoModel;
  listaTipoActivo: ConstanteModel[];
  listaTipoActivoFiltrada: Observable<ConstanteModel[]>;
  selection = new SelectionModel<EquipoModel>(true, []);
  equiposSeleccionados : EquipoModel[];
  idActividad : number;
  idProgramacion : number;
  soloLectura = false;

  constructor(private formBuilder: FormBuilder,
    private equipoService: EquipoService,
    private constanteService: ConstanteService,
    private configurationService: ConfigurationService,
    private actividadEquipoService : ActividadEquipoService,
    @Inject(LOCALE_ID) private locale: string,
    private http: HttpClient,
    public dialog: MatDialog,
    private activateRoute: ActivatedRoute,
    private tipoAccesoService: TipoAccesoService
    ) {
      this.obtenerIdUrl();
      this.construirFormulario();
    // Asignar variables de configuracion
    this.numeroFilas = configurationService.getNumeroFilas();
    this.pageSizeOptions = configurationService.getRangoPaginacion();
    this.numeroFilasAsignados=configurationService.getNumeroFilas();
    this.pageSizeOptionsAsignados = configurationService.getRangoPaginacion();
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Actividad);
     }

    construirFormulario() {
      this.firstFormGroup = this.formBuilder.group({
        filtroDescripcion: [''],
        filtroCodigoKKS: [''],
        filtroTipoEquipoSelectAC: [new ConstanteModel()],
        filtroUbicacionTecnica: [''],
        filtroCodigoEquipo: [''],
        filtroTextoAsignado:['']
      });
    }

  ngOnInit(): void {

    // this.firstFormGroup = this.formBuilder.group({
    //   firstCtrl: ['', Validators.required],
    // });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required],
    });

    this.inicializacionColumnas();
    this.inicializacionColumnas_Asignado();
    this.obtenerListaTipoActivo();
    this.listar();
    this.listarAsignados();
  }

  obtenerIdUrl(): void {
    this.idActividad = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  inicializacionColumnas_Asignado(): void {
    // Columnas para MatTable
    this.displayedColumnsAsignados = [

      'tipoActivo',
      'CodigoKKS',
      'Nombre',
      'CondicionSistema',
      'CondicionEquipo',
      'acciones'
    ];
   }

   configurarEnlaceColumnasSort_Asignado(): void {
    this.dataSourceAsignado.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'tipoActivo':
          return item.objEquipo.intIdTipoActivo;
          case 'CodigoKKS':
            return item.objEquipo.strCodigoKKS;
        case 'Nombre':
          return item.objEquipo.strNombre;

        case 'CondicionSistema':
          return item.intIndSistema;
        case 'CondicionEquipo':
          return item.intIndEquipo;


        default:
          return item[property];
      }
    };
    this.dataSourceAsignado.sort = this.sort;
  }


  obtenerListaTipoActivo(): void {
    this.isLoadingResults = true;
    const todos = new ConstanteModel();
    todos.intId = 0;
    todos.strValor = 'Todos';
    this.constanteService
      .listarControlId(TipoConstanteEnum.TipoActivo)
      .pipe(
        finalize(() => {
          this.isLoadingResults = false;
        })
      )
      .subscribe((rpta) => {
        this.listaTipoActivo = rpta.Items;
        this.listaTipoActivo.splice(0, 0, todos);
        this.setObservableCambioSelectTipoActivo();
      });
  }

  setObservableCambioSelectTipoActivo(): void {
    this.listaTipoActivoFiltrada = this.firstFormGroup
      .get('filtroTipoEquipoSelectAC')
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

  handlePage(e: any): void {
   // console.log(e);
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.listar(e.pageIndex, e.pageSize);
    }
  }

  handlePageAsignados(e: any): void {
    //console.log(e);
    this.numeroFilasAsignados = e.pageSize;
    if (this.dataSourceAsignado.data.length > 0) {
      this.listarAsignados(e.pageIndex, e.pageSize);
    }
  }

  listar(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
    this.isLoadingResults = true;
    let idTipoActivoFiltro = 0;
    if (this.firstFormGroup.value.filtroTipoEquipoSelectAC.intId) {
      idTipoActivoFiltro = this.firstFormGroup.value.filtroTipoEquipoSelectAC.intId;
    }
    this.equipoService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        this.firstFormGroup.value.filtroDescripcion,
        this.firstFormGroup.value.filtroCodigoKKS,
        idTipoActivoFiltro,
        this.firstFormGroup.value.filtroUbicacionTecnica,
        this.firstFormGroup.value.filtroCodigoEquipo
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
        console.log('equipos');
        console.log(response.Items);
      });
  }

  listarEquiposAsignados(listar: boolean): void {
    this.listarAsignados();
    //this.listar(this.rol.intId);
  }

  listarAsignados(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
    this.isLoadingResultsAsignados = true;
    let idTipoActivoFiltro = 0;

    this.actividadEquipoService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        this.idActividad,
        0
      )
      .pipe(finalize(() => (this.isLoadingResultsAsignados = false)))
      .subscribe((response) => {
        this.cantidadRegistrosAsignados = response.Total;
        this.dataSourceAsignado.data = response.Items;
        console.log('asignados');
        console.log(response.Items);
      });
  }

  limpiar() {
    this.firstFormGroup.get('filtroDescripcion').setValue('');
    this.firstFormGroup.get('filtroCodigoKKS').setValue('');
    this.firstFormGroup.get('filtroTipoEquipoSelectAC').setValue(new ConstanteModel());
    this.firstFormGroup.get('filtroUbicacionTecnica').setValue('');
    this.firstFormGroup.get('filtroCodigoEquipo').setValue('');
    this.listar();
  }

  mostrarNombreTipoActivoSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  desplegarFiltroUbicacionTecnica() {
    const dialogRef = this.dialog.open(
      BusquedaCodigoUbicacionTecnicaDialogComponent,
      {
        width: '50%',
        height: '90%',
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.firstFormGroup
          .get('filtroUbicacionTecnica')
          .setValue(result.codigoUbicacionTecnicaSeleccionado);
      }
    });
  }

  desplegarFiltroCodigoEquipo() {
    const dialogRef = this.dialog.open(BusquedaCodigoEquipoDialogComponent, {
      width: '50%',
      height: '90%',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.firstFormGroup
          .get('filtroCodigoEquipo')
          .setValue(result.codigoEquipoSeleccionado);
      }
    });
  }

  ngAfterViewInit(): void {
    this.configurarEnlaceColumnasSort();
    this.configurarEnlaceColumnasSort_Asignado();
  }
  configurarEnlaceColumnasSort(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'Id':
          return item.intId;
        case 'Codigo KKS':
          return item.strCodigoKKS;
        case 'Descripcion':
          return item.strNombre;
        case 'Tipo':
          return item.objConstanteTipoActivo.strValor;
        case 'N° Serie':
          return item.strNumeroSerie;
        case 'Marca':
          return item.objDatoMarca.strNombre;
        case 'Modelo':
          return item.strModelo;
        case 'Estado':
          return item.intEstado;

        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;
  }
  inicializacionColumnas(): void {
    // Columnas para MatTable
    this.displayedColumns = [
      'select',
      'Id',
      'Codigo KKS',
      'Descripcion',
      'Tipo',
      'N° Serie',
      'Marca',
      'Modelo',
      'Estado'

    ];

  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }


  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.data);

  }
  checkboxLabel(row?: EquipoModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    //console.log(row);
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.intId + 1}`;

  }

  Siguiente_Programacion()
  {

    const equipoSelect = this.selection.selected;
    this.equiposSeleccionados= equipoSelect;
   // console.log( this.equiposSeleccionados);
    // for(let factor of this.equiposSeleccionados)
    // {
    // }

  }

  SeleccionarEquipo(){
    //console.log(this.selection.selected);

  }

  listarProgramacion(listar: boolean): void {
   // this.buscar();
    //this.listar(this.rol.intId);
  }

  editarAsignado(e: any): void {

    console.log(e);
    this.actividadEquipoModel = new ActividadEquipoModel();
    this.actividadEquipoModel = e;
    const dialogRef = this.dialog.open(ActividadProgramacionDialogComponent, {
      width: '70%',
      height: '80%',
      data: {idactividad: this.idActividad, idequipo: this.actividadEquipoModel.intIdEquipo}
    });
    dialogRef.afterClosed().subscribe(result =>
      {
        //this.BuscarModoVerificacion(0,this.numeroFilas,this.idfactor);
      });

  }

  eliminarAsignado(e: ActividadEquipoModel): void {

    console.log(e);

    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      swal
        .fire({
          title: 'Confirmación',
          text: `¿Está seguro de eliminar el equipo asignado ?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#004f91',
          cancelButtonColor: '#7B7A83',
          confirmButtonText: 'Sí, Aceptar!',
          cancelButtonText: 'No, Cancelar!',
        })
        .then((result) => {
          if (result.value) {
            this.isLoadingResults = true;
            this.actividadEquipoService
              .eliminar(e.intIdActividad,e.intIdEquipo)
              .pipe(finalize(() => (this.isLoadingResults = false)))
              .subscribe((respuesta) => {
                swal.fire('Ok', respuesta.mensaje, 'success');
                this.listarAsignados();
              });
          }
        });
      }


  }

  stepper_reset():void{
   // stepper.reset();
  }

  EditarModo(intId : number){


    const dialogRef = this.dialog.open(ActividadProgramacionDialogComponent, {
      width: '70%',
      height: '70%',
      data: {idactividad: this.idActividad, idequipo:1}
    });
    dialogRef.afterClosed().subscribe(result =>
      {
        //this.BuscarModoVerificacion(0,this.numeroFilas,this.idfactor);
      });

  }

}
