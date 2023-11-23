import { Component, OnInit,ViewChild } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import {SelectionModel} from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { concatAll, finalize } from 'rxjs/operators';
import { FactorVerificacionModel } from 'src/app/core/_model/info/factor-verificacion-model';
import { FactorVerificacionService } from 'src/app/core/_service/info/factor-verificacion.service';
import { ActividadFactorVerificacionModel } from 'src/app/core/_model/info/actividad-factor-verificacion-model';
import { ActividadFactorVerificacionService } from 'src/app/core/_service/info/actividad-factor-verificacion.service';
import { ModoVerificacionModel } from 'src/app/core/_model/info/modo-verificacion-model';
import { ModoVerificacionService } from 'src/app/core/_service/info/modo-verificacion.service';
import { FactorVerificacionModalComponent } from 'src/app/pages/modal-shared/factor-verificacion-modal/factor-verificacion-modal.component';
import { ModoVerificacionModalComponent } from 'src/app/pages/modal-shared/modo-verificacion-modal/modo-verificacion-modal.component';

@Component({
  selector: 'app-actividad-mantenimiento-factores',
  templateUrl: './actividad-mantenimiento-factores.component.html',
  styleUrls: ['./actividad-mantenimiento-factores.component.scss'],
})
export class ActividadMantenimientoFactoresComponent implements OnInit {

  idActividad = 0;
  idfactor = 0;
  idModo = 0;

  @ViewChild(MatPaginator, { static: true }) paginator?: MatPaginator;
  displayedColumns = ['select', 'nombre','parte','ponderacion', 'acciones'];
  displayedColumnsFA = ['select', 'nombre','parte','ponderacion'];
  displayedColumnsMV = ['valor' ,'nombre','eval','acciones'];
  dataSource = new MatTableDataSource<any>();
  dataSourceFA = new MatTableDataSource<any>();
  dataSourceMV = new MatTableDataSource<any>();
  public isLoadingResults = false;
  public strBuscarNombre: any='';
   cantidadRegistros: number = 0;
   numeroFilas: number = 10;
   factores : FactorVerificacionModel[];
   modoVerificacion : ModoVerificacionModel;
   factorVerificacion : FactorVerificacionModel;
   actividadFactor : ActividadFactorVerificacionModel;
   actividadFactores : ActividadFactorVerificacionModel[];

   factortitulo : string="";

   selection = new SelectionModel<FactorVerificacionModel>(true, []);
   selectionFA = new SelectionModel<ActividadFactorVerificacionModel>(true, []);

   clickedRows = new Set<FactorVerificacionModel>();

  constructor(private formBuilder : FormBuilder, private router: Router,
    public dialog: MatDialog,
    private factorService: FactorVerificacionService,
    private modoService: ModoVerificacionService,
    private actividadfactorService: ActividadFactorVerificacionService,
    private activateRoute: ActivatedRoute

    ) {
      this.obtenerIdUrl();
    }

  ngOnInit(): void {
    this.BuscarFactores(0, this.numeroFilas);
    this.BuscarActividadFactores(0,this.numeroFilas);
    //this.BuscarModoVerificacion(0,this.numeroFilas,1);
  }
  obtenerIdUrl(): void {
    this.idActividad = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  
  clickedRowsset(row? : any)
  {
    this.factorVerificacion = new FactorVerificacionModel();
    this.factorVerificacion= row;
    this.factortitulo= this.factorVerificacion.strNombre;
    this.idfactor = this.factorVerificacion.intId;
      this.BuscarModoVerificacion(0,this.numeroFilas,this.factorVerificacion.intId);
    // console.log(this.modoVerificacion);

  }
  // clickedRows(row : any) : void{
  //   console.log(row);

  // }

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

    // const factorSelect = this.selection.selected;
    //   this.factores= factorSelect;
    //   console.log(this.factores);
  }
  checkboxLabel(row?: FactorVerificacionModel): string {
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
    if (this.isAllSelected()) {
      this.selectionFA.clear();
      return;
    }
    this.selectionFA.select(...this.dataSourceFA.data);
  }



  checkboxLabelFA(row?: ActividadFactorVerificacionModel): string {
    if (!row) {
      return `${this.isAllSelectedFA() ? 'deselect' : 'select'} all`;
    }
    return `${this.selectionFA.isSelected(row) ? 'deselect' : 'select'} row ${row.intIdFactor + 1}`;
  }


  private BuscarFactores(indicePagina:number, numeroFilasABuscar:number): void
  {
    this.isLoadingResults = true;
    this.factorService.listarPageable(indicePagina,numeroFilasABuscar)
      .pipe(
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe(response =>
      {
        this.dataSource.data = response.Items;
        //console.log('Factor');
        //console.log(response);
      })
  }

  private BuscarActividadFactores(indicePagina:number, numeroFilasABuscar:number): void
  {
    this.isLoadingResults = true;
    this.actividadfactorService.listarPageable(indicePagina,numeroFilasABuscar,this.idActividad)
      .pipe(
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe(response =>
      {
        this.dataSourceFA.data = response.Items;
       // console.log('FactorAsignado');
       // console.log(response);
      })
  }

  private BuscarModoVerificacion(indicePagina:number, numeroFilasABuscar:number, idFactor : number): void
  {
    this.isLoadingResults = true;
    this.modoService.listarPageable(indicePagina,numeroFilasABuscar,idFactor)
      .pipe(
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe(response =>
      {
        this.dataSourceMV.data = response.Items;
       // console.log('MODO');
       // console.log(response);
      })
  }



  NuevoFactor(): void
  {
   // let form = this.personaNatural.value;
    const dialogRef = this.dialog.open(FactorVerificacionModalComponent, {
      width: '60%',
      height: '60%',
      disableClose: true,
      data: {codigoFV: 0}
    });
    dialogRef.afterClosed().subscribe(result =>
      {
        this.BuscarFactores(0, this.numeroFilas);
      });
  }


  EditarFactor(intId : number){
    const dialogRef = this.dialog.open(FactorVerificacionModalComponent, {
      width: '60%',
      height: '60%',
      disableClose: true,
      data: {codigoFV: intId}
    });
    dialogRef.afterClosed().subscribe(result =>
      {
        this.BuscarFactores(0, this.numeroFilas);
      });
  }

  ElminarFactor(intId : number){

    if (intId > 0) {
      swal
        .fire({
          title: 'Confirmación',
          text: `¿Está seguro de eliminar el factor ?`,
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
            this.factorService
              .eliminar(intId)
              .pipe(finalize(() => (this.isLoadingResults = false)))
              .subscribe((respuesta) => {
                swal.fire('Ok', respuesta.mensaje, 'success');
                
                this.BuscarFactores(0, this.numeroFilas);
                this.BuscarActividadFactores(0,this.numeroFilas);
              });
          }
        });
    }
  }

  NuevoModo(): void
  {
    //let form = this.personaNatural.value;
    const dialogRef = this.dialog.open(ModoVerificacionModalComponent, {
      width: '60%',
      height: '60%',
      disableClose: true,
      data: {codigoMV: 0, codigoFV:this.idfactor}
    });
    dialogRef.afterClosed().subscribe(result =>
      {

        this.BuscarModoVerificacion(0,this.numeroFilas,this.idfactor);
      });
  }

  EditarModo(intId : number){

    //console.log(intId);
   // let form = this.personaNatural.value;
    const dialogRef = this.dialog.open(ModoVerificacionModalComponent, {
      width: '70%',
      height: '70%',
      disableClose: true,
      data: {codigoMV: intId}
    });
    dialogRef.afterClosed().subscribe(result =>
      {
        this.BuscarModoVerificacion(0,this.numeroFilas,this.idfactor);
      });

  }
  ElminarModo(intId : number){

  }

  asignarFactor(){
   // console.log(this.selection.selected);
    const numCheckSelect = this.selection.selected.length;
    this.actividadFactor = new ActividadFactorVerificacionModel();
    if(numCheckSelect > 0)
    {
     const factorSelect = this.selection.selected;
      this.factores= factorSelect;
      //console.log(this.factores);
      for(let factor of this.factores)
      {
        this.actividadFactor.intIdActividad=this.idActividad;
        this.actividadFactor.intIdFactor=factor.intId;


        this.actividadfactorService.registrar(this.actividadFactor)
        .pipe
        (
          finalize(() => this.isLoadingResults = false)
        )
        .subscribe(respuesta =>
        {
         // console.log(respuesta);
          this.BuscarActividadFactores(0,this.numeroFilas);
        })

      }



    }
  }

  desAsignarFactor(){

    const numCheckSelect = this.selectionFA.selected.length;
    this.actividadFactor = new ActividadFactorVerificacionModel();
    if(numCheckSelect > 0)
    {
     const activdadfactorSelect = this.selectionFA.selected;
      this.actividadFactores= activdadfactorSelect;
      //console.log(this.factores);
      for(let factor of this.actividadFactores)
      {
        this.actividadFactor.intIdActividad=factor.intIdActividad;
        this.actividadFactor.intIdFactor=factor.intIdFactor;

        this.actividadfactorService.eliminar(factor.intIdActividad,factor.intIdFactor)
        .pipe
        (
          finalize(() => this.isLoadingResults = false)
        )
        .subscribe(respuesta =>
        {
          //console.log(respuesta);
          this.BuscarActividadFactores(0,this.numeroFilas);
        })

      }



    }


  }





}
