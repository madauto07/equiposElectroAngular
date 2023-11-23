
import { Component, OnInit,OnChanges ,ViewChild, Input,AfterViewInit,LOCALE_ID,Inject,  SimpleChanges,
  ElementRef} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table'
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, startWith } from 'rxjs/operators';
import { ProgramacionTecnicaService } from 'src/app/core/_service/prog/programacion-tecnica.service';
import { ProgramacionTecnicaDetalleService } from 'src/app/core/_service/prog/programacion-tecnica-detalle.service';
import { ProgramacionTecnicaModel } from 'src/app/core/_model/prog/programacion-tecnica-model';
import { ProgramacionAnualModel } from 'src/app/core/_model/prog/programacion-anual-model';
import { ProgramacionTecnicaDetalleModel } from 'src/app/core/_model/prog/programacion-tecnica-detalle-model';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { SubconstanteModel } from 'src/app/core/_model/administracion/sub-constante-model';
import { SubconstanteService } from 'src/app/core/_service/administracion/subconstante.service';
import { Validators, FormBuilder, FormGroup ,FormControl} from '@angular/forms';
import { Observable } from 'rxjs';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import { IColumnKey } from 'src/app/core/_model/general/IColumnKey';
import { ExcelService } from 'src/app/core/_service/general/excel-service';

import { MatDialog } from '@angular/material/dialog';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import { BusquedaCodigoUbicacionTecnicaDialogComponent } from '../../../modal-shared/busqueda-codigo-ubicacion-tecnica-dialog/busqueda-codigo-ubicacion-tecnica-dialog.component';
import { BusquedaCodigoEquipoDialogComponent } from '../../../modal-shared/busqueda-codigo-equipo-dialog/busqueda-codigo-equipo-dialog.component';
import { BusquedaCodigoTrabajadorDialogComponent } from '../../../modal-shared/busqueda-codigo-trabajador-dialog/busqueda-codigo-trabajador-dialog.component';
import {MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatDatepicker} from '@angular/material/datepicker';
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';

const moment = _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

interface Mes {
  
  id: number;
  name: string;
}

interface Semana {
  
  id: number;
  name: string;
}

@Component({
  selector: 'app-programacion-mant',
  templateUrl: './programacion-mant.component.html',
//  styleUrls: ['./programacion-mant.component.scss'],
  // providers: [
  //   // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
  //   // application's root module. We provide it at the component level here, due to limitations of
  //   // our example generation script.
  //   {
  //     provide: DateAdapter,
  //     useClass: MomentDateAdapter,
  //     deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
  //   },

  //   {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  // ],

})
export class ProgramacionMantComponent implements OnInit ,OnChanges,AfterViewInit{
  date = new FormControl(moment());
  

  @ViewChild(MatPaginator, { static: true }) paginator?: MatPaginator;
  displayedColumns = [ 'idactividad', 'Actividad', 'TipoMant', 'parte','subparte','ubitecnica','codequipo','Equipo','condsistema','condequipo',
                      '1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20', '21','22','23','24','25','26','27','28','29','30','31',
                      '32','33','34','35','36','37','38','39','40','41', '42','43','44','45','46','47','48','49','50','51','52']
                      ;

  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  dataSourceExcel = new MatTableDataSource<any>();
  dataSource = new MatTableDataSource<any>();
  selectedMes : string[]=[];
  selectedSemana : string[]=[];
  selectedAnho : string[]=[];
  anhoLista :ConstanteModel[];
  semanaLista :ConstanteModel[];
  public isLoadingResults = false;
  isMesResult = false;
  isAnhoResult = false;
isSemanaResult = false;
  soloLectura = false;
  idProgramacion = 0;
  idOpcion =0;
  titulo = '';
  fechaIni = '';
  fechaFin = '';
   numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  cantidadRegistros: number = 0;
  form1: FormGroup;
  selectedTipoActivo = 0;
   selectedTipoMant : string[]=[];
  listaParte: ConstanteModel[];
  listaParteFiltrada: Observable<ConstanteModel[]>;
  listaSubparte: SubconstanteModel[];
  listaSubParteFiltrada: Observable<SubconstanteModel[]>;
  listaTipoActivo: ConstanteModel[];
  listaTipoActivoFiltrada: Observable<ConstanteModel[]>;
   listaTipoMant: ConstanteModel[];
   events: string[] = [];
  programacionTecnicaModel: ProgramacionTecnicaModel = new ProgramacionTecnicaModel();
  @ViewChild('inputFocoInicial', { static: true,read: ElementRef }) inputFocoInicial: ElementRef;

  mesLista: Mes[] = [
    { id: 1 , name: 'Enero'},
    { id: 2 , name: 'Febrero'},
    { id: 3 , name: 'Marzo'},
    { id: 4 , name: 'Abril'},
    { id: 5 , name: 'Mayo'},
    { id: 6 , name: 'Junio'},
    { id: 7 , name: 'Julio'},
    { id: 8 , name: 'Agosto'},
    { id: 9 , name: 'Septiembre'},
    { id: 10 , name: 'Octubre'},
    { id: 11 , name: 'Noviembre'},
    { id: 12 , name: 'Diciembre'}
    
  ];

  array : any=[
    // {Name :  "A", Addres : "A001", Email : "a001@gmail.com" },
    // {Name :  "B", Addres : "B001", Email : "B001@gmail.com" },
    // {Name :  "C", Addres : "C001", Email : "C001@gmail.com" }
  ];
  tabKey:any=[];
  tabValue: any=[];

  constructor(  
    private formBuilder: FormBuilder,
    private activateRoute: ActivatedRoute,
     private programacionTecnicaService:ProgramacionTecnicaService,
     private programacionTecnicaDetalleService :ProgramacionTecnicaDetalleService,
     private constanteService: ConstanteService,
     private subConstanteService: SubconstanteService,
     private excelService: ExcelService,
     @Inject(LOCALE_ID) private locale: string,
     private router: Router,
     public dialog: MatDialog) {
    this.obtenerIdUrl();
    this.construirFormulario();
  //  this.getdata();
    //this.listar();
   }

   getdata(){
    this.array.forEach((element:any) => {
      this.tabKey=Object.keys(element);
      this.tabValue.push(Object.values(element));
      
    });
   // console.log(this.tabKey);
   }

   construirFormulario() {
    this.form1 = this.formBuilder.group({
      fechaInicio: [''],
      filtroAnho : ['', Validators.required],
      filtroMes : ['', Validators.required],
      filtroSemana : [''],
      filtroCodActividad : [''],
      filtroNombreEquipo : [''],
      filtroSelectTipoMant: [''],
      filtroTipoEquipoSelectAC: [new ConstanteModel()],
        filtroSelectTipoActivo: [''],
       filtroUbicacionTecnica: [''],
       filtroCodigoEquipo: [''],
       filtroControlActividad : [''],
     
    });
  }


  ngOnInit(): void {

  
    this.obtenerIdUrl();
   this.activateList();
   this.obtenerSelectAnho();
   //this.obtenerDatos();
   this.obtenerListaTipoActivo();
   this.obtenerSelectTipoMantenimiento();
   this.inputFocoInicial.nativeElement.focus();

    }
    ngAfterViewInit(): void {
     //console.log('after');
    }
    ngOnChanges():void{
     // console.log(this.idOpcion);
    }
    activateList()
    {
     // console.log(this.idOpcion);

      if(this.idOpcion==1)
      {
        this.isAnhoResult = true;
        this.isMesResult = false;
        this.isSemanaResult = false;
      }
      if(this.idOpcion==2)
      {
        this.isAnhoResult = true;
        this.isMesResult = true;
        this.isSemanaResult = false;
      }
      if(this.idOpcion==3)
      {
        this.isAnhoResult = true;
        this.isMesResult = false;
        this.isSemanaResult = true;
      }
   
    }

  obtenerIdUrl(): void {
    this.idOpcion = Number(this.activateRoute.snapshot.paramMap.get('id'));

    
    

  }

  // obtenerDatos(): void {
  //   if (this.idProgramacion > 0) {
  //     this.programacionTecnicaService.obtener(this.idProgramacion).subscribe((result) => {
  //       this.programacionTecnicaModel = result;
  //       console.log(result);
  //       this.titulo=result.strNombre;
  //       this.fechaIni=result.dtFechaInicio.toString();
  //       this.fechaFin=result.dtFechaFin.toString();
  //       this.idProgramacion= result.intId;
        
  //       // this.form.get('id').setValue(this.idEquipo);
  //       // this.form.get('descripcion').setValue(this.equipoModel.strNombre);
  //       // this.form.get('serie').setValue(this.equipoModel.strNumeroSerie);
  //       // this.form.get('codigoSitec').setValue(this.equipoModel.strCodigoSITEC);
      
  //     });
  //   }
  // }
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

  listar(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
    this.isLoadingResults = true;
    let NroAnho = 0;
    let NroMes = 0;
    let idactividad=0;
    let idtipomant=0;
    let nombreactividad='';
    let nombreequipo='';
    let ubicacion =0;
    let codigoequipo=0;
   // console.log(this.date.value.year());
   // console.log(this.date.value.month() + 1);
let formulario = this.form1.value;

    if(formulario.filtroAnho)
    {
      NroAnho=formulario.filtroAnho;
    }
    if(formulario.filtroMes)
    {
      NroMes=formulario.filtroMes;
    }

    if(this.form1.value.filtroCodActividad)
    {
      idactividad=this.form1.value.filtroCodActividad
    }
    if(this.form1.value.filtroSelectTipoMant)
    idtipomant=this.form1.value.filtroSelectTipoMant;

    if(this.form1.value.filtroControlActividad)
    nombreactividad=this.form1.value.filtroControlActividad;
   
    if(this.form1.value.filtroNombreEquipo)
    nombreequipo=this.form1.value.filtroNombreEquipo;

//console.log(this.idOpcion);

    this.programacionTecnicaDetalleService
    .listarPageDetalle(NroAnho,NroMes,0,
      indicePagina,
      numeroFilasABuscar,
      this.idProgramacion,
      idactividad,
      idtipomant,
      nombreactividad,
      nombreequipo,
      this.form1.value.filtroUbicacionTecnica,
      this.form1.value.filtroCodigoEquipo,this.idOpcion).
      pipe(
       
      finalize(() => (this.isLoadingResults = false))
      )
      .subscribe((response) => {
       // console.log( response);
       this.dataSource.data=response.Items;
       //this.array = response.Items;
       console.log(response);
        console.log(response.Items);
      // this.getdata();
      });
  }

  setObservableCambioSelectTipoActivo(): void {
    this.listaTipoActivoFiltrada = this.form1
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

  obtenerSelectTipoMantenimiento(
    isEdit: boolean = false,
    value: number = 0
  ): void {
    this.isLoadingResults = true;
    const todos = new ConstanteModel();
    todos.intId = 0;
    todos.strValor = 'Todos';
    this.constanteService
      .listarControlId(TipoConstanteEnum.TipoMantenimiento)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((rpta) => {
        this.listaTipoMant = rpta.Items;
        this.listaTipoMant.splice(0, 0, todos);
        //   console.log(rpta.Items);
      //  if (isEdit) {
          this.form1.get('filtroSelectTipoMant').setValue(value);
      //  }
      });
  }
  obtenerSelectAnho(): void {
    this.isLoadingResults = true;
    const todos = new ConstanteModel();
    todos.intId = 0;
    todos.strValor = 'Todos';
    this.constanteService
      .listarAnho(10)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((rpta) => {
       
       //console.log(rpta);
       this.anhoLista = rpta.Items;
      });
  }

  obtenerSelectSemana(id : number): void {
    this.isLoadingResults = true;
    const todos = new ConstanteModel();
    todos.intId = 0;
    todos.strValor = 'Todos';
    this.constanteService
      .listarSemana(id)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((rpta) => {
       
      // console.log(rpta);
       this.semanaLista = rpta.Items;
      });
  }

  
  obtenerSelectTipoActivo(isEdit: boolean = false, value: number = 0): void {
    this.isLoadingResults = true;
    const todos = new ConstanteModel();
    todos.intId = 0;
    todos.strValor = 'Todos';
    this.constanteService
      .listarControlId(TipoConstanteEnum.TipoActivo)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((rpta) => {
        this.listaTipoActivo = rpta.Items;
        this.listaTipoActivo.splice(0, 0, todos);
        //   console.log(rpta.Items);
        if (isEdit) {
          this.form1.get('filtroSelectTipoActivo').setValue(value);
        }
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
        this.form1
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
        //console.log(result);
        this.form1
          .get('filtroCodigoEquipo')
          .setValue(result.codigoEquipoSeleccionado);
      }
    });
  }
buscar(){
  this.listar();
  console.log(this.array);
  this.getdata();

}

  limpiar() {
    this.form1.get('filtroCodActividad').setValue('');
    this.form1.get('filtroNombreEquipo').setValue('');
    this.form1.get('filtroTipoEquipoSelectAC').setValue(new ConstanteModel());
    this.form1.get('filtroUbicacionTecnica').setValue('');
    this.form1.get('filtroCodigoEquipo').setValue('');
    
     this.form1.get('filtroControlActividad').setValue('');
   
     this.form1.get('filtroSelectTipoMant').setValue(new ConstanteModel());
    
    this.listar();
  }
  agregar(){
    this.router.navigateByUrl(`prog/indisponibilidad/programacionagregaractividad`);
  }
  regresar(){

    this.router.navigateByUrl(`prog/indisponibilidad/programacionanual`);
  }
  
  onMesChange(event:any):void{
   // console.log(event);
  }

  onSemanaChange(event:any):void{
    //console.log(event);
  }
  
  onAnhoChange(event:any):void{
   // console.log(event);
    this.obtenerSelectSemana(event);
  }
  onTipoActivoChange(idModulo: number): void {
    // console.log(idModulo);
    // this.obtenerListadoOpcionesPadre(idModulo);
  }


  onTipoMantenimientoChange(event: any): void {
   //console.log(event);
  }

  mostrarNombreTipoActivoSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  resumen()
  {}

  detalle()
  {}
  

  handlePage(e: any) {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.listar(e.pageIndex, e.pageSize);
    }
  }

  chosenYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.date.value;
    ctrlValue.year(normalizedYear.year());
    this.date.setValue(ctrlValue);
  }

  
  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value;
    ctrlValue.month(normalizedMonth.month());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

  addEvent(event: any) {
    
    //console.log(event.value);

    //this.events.push(`${type}: ${event.value}`);
  }

  valuechange(event: any)
  {
//console.log(event);

  }


  detalleExcel(): void {
    this.excelService.exportAsExcelFile(
      'Listado de Equipos',
      '',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      [
        {
          filtro: 'Sede:',
          valorFiltro: "CPM",
        },
        { filtro: 'Año:', valorFiltro: this.form1.value.filtroAnho },
        
      ],
      this.dataSource.data,
      [],
      'equipos',
      'listadoEquipos',
      ''
    );
  }



}