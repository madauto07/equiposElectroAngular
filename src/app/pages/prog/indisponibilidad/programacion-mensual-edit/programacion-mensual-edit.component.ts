import { Component, OnInit, ViewChild, Input,AfterViewInit,LOCALE_ID,Inject,  SimpleChanges,
  ElementRef} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table'
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, startWith } from 'rxjs/operators';
import { ProgramacionTecnicaMensualService } from 'src/app/core/_service/prog/programacion-tecnica-mensual.service';
import { ProgramacionTecnicaDetalleService } from 'src/app/core/_service/prog/programacion-tecnica-detalle.service';
import { ProgramacionTecnicaMensualModel } from 'src/app/core/_model/prog/programacion-tecnica-mensual-model';
import { ProgramacionTecnicaDetalleModel } from 'src/app/core/_model/prog/programacion-tecnica-detalle-model';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { SubconstanteModel } from 'src/app/core/_model/administracion/sub-constante-model';
import { SubconstanteService } from 'src/app/core/_service/administracion/subconstante.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { BusquedaCodigoUbicacionTecnicaDialogComponent } from '../../../modal-shared/busqueda-codigo-ubicacion-tecnica-dialog/busqueda-codigo-ubicacion-tecnica-dialog.component';
import { BusquedaCodigoEquipoDialogComponent } from '../../../modal-shared/busqueda-codigo-equipo-dialog/busqueda-codigo-equipo-dialog.component';
import { BusquedaCodigoTrabajadorDialogComponent } from '../../../modal-shared/busqueda-codigo-trabajador-dialog/busqueda-codigo-trabajador-dialog.component';


@Component({
  selector: 'app-programacion-mensual-edit',
  templateUrl: './programacion-mensual-edit.component.html',
  styles: [
  ]
})
export class ProgramacionMensualEditComponent implements OnInit {

  
  @ViewChild(MatPaginator, { static: true }) paginator?: MatPaginator;
  displayedColumns = ['id', 'idactividad', 'Actividad', 'TipoMant', 'parte','subparte','ubitecnica','codequipo','Equipo','condsistema','condequipo'];
  dataSource = new MatTableDataSource<any>();
  public isLoadingResults = false;
  soloLectura = false;
  idProgramacion = 0;
  titulo = '';
  fechaIni = '';
  fechaFin = '';
  labelanho ='';
  labelmes = '';
 
  numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  cantidadRegistros: number = 0;
  
  form1: FormGroup;

  // selectedObjetoFiltro = 0;
  // textSelectedObjetoFiltro = 'Todos';
   selectedTipoActivo = 0;
  // textSelectedTipoActivo = 'Todos';
   selectedTipoMant : string[]=[];
  // textSelectedTipoMant = 'Todos';
  listaParte: ConstanteModel[];
  listaParteFiltrada: Observable<ConstanteModel[]>;
  listaSubparte: SubconstanteModel[];
  listaSubParteFiltrada: Observable<SubconstanteModel[]>;
  listaTipoActivo: ConstanteModel[];
  listaTipoActivoFiltrada: Observable<ConstanteModel[]>;
  // objetosTodos: ConstanteModel;
  // listaObjetos: ConstanteModel[];
   listaTipoMant: ConstanteModel[];


  programacionTecnicaModel: ProgramacionTecnicaMensualModel = new ProgramacionTecnicaMensualModel();
  @ViewChild('inputFocoInicial', { static: true,read: ElementRef }) inputFocoInicial: ElementRef;

  constructor(  
    private formBuilder: FormBuilder,
    private activateRoute: ActivatedRoute,
     private programacionTecnicaMensualService:ProgramacionTecnicaMensualService,
     private programacionTecnicaDetalleService :ProgramacionTecnicaDetalleService,
     private constanteService: ConstanteService,
     private subConstanteService: SubconstanteService,
     @Inject(LOCALE_ID) private locale: string,
     private router: Router,
     public dialog: MatDialog) {
    this.obtenerIdUrl();
    this.construirFormulario();
    //this.listar();
   }

   construirFormulario() {
    this.form1 = this.formBuilder.group({
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

    this.obtenerDatos();
    this.obtenerListaTipoActivo();
    this.obtenerSelectTipoMantenimiento();
    // this.obtenerSelectTipoActivo();
   // this.listar();
   this.inputFocoInicial.nativeElement.focus();
   

    }
  obtenerIdUrl(): void {
    this.idProgramacion = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  obtenerDatos(): void {
    if (this.idProgramacion > 0) {
      this.programacionTecnicaMensualService.obtener(this.idProgramacion).subscribe((result) => {
        this.programacionTecnicaModel = result;
        console.log(result);
        this.titulo=result.strNombre;
        this.labelanho=result.intAnho.toString();
        this.labelmes=result.intMes.toString();
        this.idProgramacion= result.intId;
        
        // this.form.get('id').setValue(this.idEquipo);
        // this.form.get('descripcion').setValue(this.equipoModel.strNombre);
        // this.form.get('serie').setValue(this.equipoModel.strNumeroSerie);
        // this.form.get('codigoSitec').setValue(this.equipoModel.strCodigoSITEC);
      
      });
    }
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

  listar(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
    this.isLoadingResults = true;
    let idactividad = 0;
    let idtipomant = 0;
    let nombreactividad='';
    let nombreequipo='';
    let ubicacion = 0;
    let codigoequipo= 0;

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



    this.programacionTecnicaDetalleService
    .listarPageDetalle(2022,2,0,
      indicePagina,
      numeroFilasABuscar,
      this.idProgramacion,
      idactividad,
      idtipomant,
      nombreactividad,
      nombreequipo,
      this.form1.value.filtroUbicacionTecnica,
      this.form1.value.filtroCodigoEquipo,2)
          .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        console.log( response);
       this.dataSource.data=response.Items;
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
        console.log(result);
        this.form1
          .get('filtroCodigoEquipo')
          .setValue(result.codigoEquipoSeleccionado);
      }
    });
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

    this.router.navigateByUrl(`prog/indisponibilidad/programacionmensual`);
  }
  // desplegarFiltroTrabajador() {
  //   const dialogRef = this.dialog.open(
  //     BusquedaCodigoTrabajadorDialogComponent,
  //     {
  //       width: '50%',
  //       height: '90%',
  //     }
  //   );

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       this.form
  //         .get('filtroCodigoTrabajador')
  //         .setValue(result.codigoTrabajadorSeleccionado);
  //     }
  //   });
  // }


  onTipoActivoChange(idModulo: number): void {
    // console.log(idModulo);
    // this.obtenerListadoOpcionesPadre(idModulo);
  }


  onTipoMantenimientoChange(event: any): void {
   console.log(event);
  }

  mostrarNombreTipoActivoSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  

  handlePage(e: any) {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.listar(e.pageIndex, e.pageSize);
    }
  }
  
}
