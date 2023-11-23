import { Component, OnInit,ViewChild } from '@angular/core';
import { Validators, FormBuilder,FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {SelectionModel} from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, startWith } from 'rxjs/operators';
import { TrabajadorModel } from 'src/app/core/_model/administracion/trabajador-model';
import { AreaModel } from 'src/app/core/_model/administracion/area-model';
import { ActividadTrabajadorModel } from 'src/app/core/_model/info/actividad-trabajador-model';
import { AreaService } from 'src/app/core/_service/administracion/area.service';
import { ActividadTrabajadorService } from 'src/app/core/_service/info/actividad-trabajador.service';
import { TrabajadorService } from 'src/app/core/_service/administracion/trabajador.service';
import { ModoVerificacionService } from 'src/app/core/_service/info/modo-verificacion.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-actividad-mantenimiento-responsables',
  templateUrl: './actividad-mantenimiento-responsables.component.html',
  styleUrls: ['./actividad-mantenimiento-responsables.component.scss'],
})
export class ActividadMantenimientoResponsablesComponent implements OnInit {

  idActividad = 0;
  idfactor = 0;
  idModo = 0;
  idarea=0;
  form: FormGroup;
  @ViewChild(MatPaginator, { static: true }) paginator?: MatPaginator;
  displayedColumns = ['select', 'codigo','nombre','especialidad'];
  displayedColumnsFA = ['select', 'codigo','nombre','especialidad'];
  //displayedColumnsMV = ['valor' ,'nombre','eval','acciones'];
  dataSource = new MatTableDataSource<any>();
  dataSourceFA = new MatTableDataSource<any>();
  //dataSourceMV = new MatTableDataSource<any>();
  public isLoadingResults = false;
  public strBuscarNombre: any='';
   cantidadRegistros: number = 0;
   numeroFilas: number = 10;

   selectedAreaFiltro = 0;
   areaTodos: AreaModel;
   listaArea: AreaModel[];
   listaAreaFiltrada: Observable<AreaModel[]>;
   textSelectedAreaFiltro = 'Todos';
  

   cantidadRegistrosAsignado: number = 0;
   numeroFilasAsignado: number = 10;

   //modoVerificacion : ModoVerificacionModel;
   trabajador : TrabajadorModel;
   trabajadores : TrabajadorModel[];
   actividadTrabajador : ActividadTrabajadorModel;
   actividadTrabajadores : ActividadTrabajadorModel[];
   factortitulo : string="";
   selection = new SelectionModel<TrabajadorModel>(true, []);
   selectionFA = new SelectionModel<ActividadTrabajadorModel>(true, []);

  constructor(
    private formBuilder : FormBuilder, private router: Router, 
    public dialog: MatDialog,
    private trabajadorService: TrabajadorService,
    private modoService: ModoVerificacionService,
    private actividadtrabajadorService: ActividadTrabajadorService,
    private activateRoute: ActivatedRoute,
    private areaService: AreaService,
  ) { 
    this.obtenerIdUrl();
  }

  
  construirFormulario() {
    this.form = this.formBuilder.group({
     
      area: ['', Validators.required],
     
    });
  }

  ngOnInit(): void {

    this.setListadoArea();
    this.BuscarTrabajadores(0, this.numeroFilas,this.idarea);
    this.BuscarTrabajadoresAsignados(0, this.numeroFilas);
  }
  obtenerIdUrl(): void {
    this.idActividad = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  
  setListadoArea(): void {
    this.areaTodos = new AreaModel();
    this.areaTodos.intId = 0;
    this.areaTodos.strNombre = 'Todos';
    this.areaService.listar().subscribe((response) => {
      this.listaArea = response.Items;
      this.listaArea.splice(0, 0, this.areaTodos);
    });
  }

  selectedValueArea(event: any): void {
    this.textSelectedAreaFiltro = event.source.triggerValue;
  //  console.log(event.source.value );
    this.idarea=event.source.value;
    this.BuscarTrabajadores(0, this.numeroFilas,this.idarea);

  }

  obtenerListaArea(area: any = ''): void {
    this.isLoadingResults = true;
    this.areaService
      .listar().pipe(
        finalize(() => {
          this.isLoadingResults = false;
        })
      ).subscribe((rpta) => {
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
  checkboxLabel(row?: TrabajadorModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    //console.log(row);
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.intId + 1}`;
    
  }


  isAllSelectedFA() {
    const numSelected = this.selectionFA.selected.length;
    const numRows = this.dataSourceFA.data.length;
    return numSelected === numRows;
  }

  masterToggleFA() {
    if (this.isAllSelectedFA()) {
      this.selectionFA.clear();
      return;
    }
    this.selectionFA.select(...this.dataSourceFA.data);
  }



  checkboxLabelFA(row?: ActividadTrabajadorModel): string {
    if (!row) {
      return `${this.isAllSelectedFA() ? 'deselect' : 'select'} all`;
    }
    return `${this.selectionFA.isSelected(row) ? 'deselect' : 'select'} row ${row.intIdActividad + 1}`;
  }


  private BuscarTrabajadores(indicePagina:number, numeroFilasABuscar:number, idarea:number): void
  {
    this.isLoadingResults = true;
    this.trabajadorService.listarPageable(indicePagina,numeroFilasABuscar,"",0,idarea)
      .pipe(
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe(response => 
      {
        this.dataSource.data = response.Items;
        this.cantidadRegistros = response.Total;
      //  console.log('trabajador');
      //  console.log(response.Items);
      })
  }

  private BuscarTrabajadoresAsignados(indicePagina:number, numeroFilasABuscar:number): void
  {
    this.isLoadingResults = true;
    this.actividadtrabajadorService.listarPageable(indicePagina,numeroFilasABuscar,this.idActividad)
      .pipe(
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe(response => 
      {
        this.dataSourceFA.data = response.Items;
        this.cantidadRegistrosAsignado = response.Total;
       // console.log('TrabajadorAsignado');
        //console.log(response);
      })
  }


 


  asignarResponsable(){
  // console.log(this.selection.selected);
   //console.log( 'actividad'+  this.idActividad);
    const numCheckSelect = this.selection.selected.length;
    this.trabajador = new TrabajadorModel();
    this.actividadTrabajador = new ActividadTrabajadorModel();
    if(numCheckSelect > 0)
    {
     const trabajadorSelect = this.selection.selected;
      this.trabajadores= trabajadorSelect;
      //console.log( this.trabajadores);
      for(let itemtrab of this.trabajadores)
      {
        this.actividadTrabajador.intIdActividad=this.idActividad;
        this.actividadTrabajador.intIdTrabajador=itemtrab.intId;
       // console.log(this.actividadTrabajador);

        this.actividadtrabajadorService.registrar(this.actividadTrabajador)
        .pipe
        (
          finalize(() => this.isLoadingResults = false)
        )
        .subscribe(respuesta => 
        {
         // console.log(respuesta);
          this.BuscarTrabajadoresAsignados(0,this.numeroFilas);
        })

      }

     

    }
  }

  desAsignarResponsable(){

    const numCheckSelect = this.selectionFA.selected.length;
    this.actividadTrabajador = new ActividadTrabajadorModel();
    if(numCheckSelect > 0)
    {
     const activdadfactorSelect = this.selectionFA.selected;
      this.actividadTrabajadores= activdadfactorSelect;
      //console.log(this.factores);
      for(let factor of this.actividadTrabajadores)
      {
        this.actividadTrabajador.intIdActividad=factor.intIdActividad;
        this.actividadTrabajador.intIdTrabajador=factor.intIdTrabajador;
  
        this.actividadtrabajadorService.eliminar(factor.intIdActividad,factor.intIdTrabajador)
        .pipe
        (
          finalize(() => this.isLoadingResults = false)
        )
        .subscribe(respuesta => 
        {
         // console.log(respuesta);
          this.BuscarTrabajadoresAsignados(0,this.numeroFilas);
        })
      }
    }
  }

  handlePage(e: any) {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) 
    {
      this.BuscarTrabajadores(e.pageIndex, e.pageSize,this.idarea);
      
    }
  }

  handlePageAsignado(e: any) {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) 
    {
      this.BuscarTrabajadoresAsignados(e.pageIndex, e.pageSize);
      
    }
  }

  mostrarNombreAreaSelect(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
  }

0}
