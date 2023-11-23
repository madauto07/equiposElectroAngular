import { Component, OnInit,  ViewChild, } from '@angular/core';
import { FormControl, FormBuilder,FormGroup } from '@angular/forms';
import { BusquedaCodigoUbicacionTecnicaDialogComponent } from '../../../modal-shared/busqueda-codigo-ubicacion-tecnica-dialog/busqueda-codigo-ubicacion-tecnica-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';
import { EquipoModel } from 'src/app/core/_model/info/equipo-model';
import { EquipoService } from 'src/app/core/_service/info/equipo.service';
import { finalize, map, startWith } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { ActividadEquipoModel } from 'src/app/core/_model/info/actividad-equipo-model';
import { MatSort } from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';


@Component({
  selector: 'app-programacion-agregar-actividad',
  templateUrl: './programacion-agregar-actividad.component.html',
  styles: [
  ]
})
export class ProgramacionAgregarActividadComponent implements OnInit {

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  displayedColumnsAsignados: string[];

  numeroFilas: number;
  pageSizeOptions: number[];
  cantidadRegistros = 0;
  isLoadingResults = false;
  numeroFilasAsignados: number;
  pageSizeOptionsAsignados: number[];
  cantidadRegistrosAsignados = 0;
  isLoadingResultsAsignados = false;
  dataSource = new MatTableDataSource<EquipoModel>();
  dataSourceAsignado = new MatTableDataSource<ActividadEquipoModel>();
  selection = new SelectionModel<EquipoModel>(true, []);

  textSemana = '';
  textActividad = '';
  textDescripcion='';
  fechaInicio='';
  fechaFin = '';
  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private equipoService: EquipoService,
    public dialog: MatDialog,
    private configurationService: ConfigurationService,
  ) { 
    this.construirFormulario();

    this.numeroFilas = configurationService.getNumeroFilas();
    this.pageSizeOptions = configurationService.getRangoPaginacion();
    this.numeroFilasAsignados=configurationService.getNumeroFilas();
    this.pageSizeOptionsAsignados = configurationService.getRangoPaginacion();
  }

  construirFormulario() {
    this.form = this.formBuilder.group({
      filtroDescripcion: [''],
      filtroCodigoKKS: [''],
      filtroUbicacionTecnica: [''],
     
    });
  }


  ngOnInit(): void {

    this.listar();
    this.inicializacionColumnas();
  }

  
  ngAfterViewInit(): void {
    this.configurarEnlaceColumnasSort();
  //  this.configurarEnlaceColumnasSort_Asignado();
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

  buscar(){

  }

  limpiar(){}

  listar(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
    this.isLoadingResults = true;
    let idTipoActivoFiltro = 0;
    // if (this.firstFormGroup.value.filtroTipoEquipoSelectAC.intId) {
    //   idTipoActivoFiltro = this.firstFormGroup.value.filtroTipoEquipoSelectAC.intId;
    // }
    this.equipoService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        this.form.value.filtroDescripcion,
        this.form.value.filtroCodigoKKS,
        idTipoActivoFiltro,
        this.form.value.filtroUbicacionTecnica,
        ''
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
        console.log('equipos');
        console.log(response.Items);
      });
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
        this.form
          .get('filtroUbicacionTecnica')
          .setValue(result.codigoUbicacionTecnicaSeleccionado);
      }
    });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  handlePage(e: any): void {
    // console.log(e);
     this.numeroFilas = e.pageSize;
     if (this.dataSource.data.length > 0) {
       this.listar(e.pageIndex, e.pageSize);
     }
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





}
