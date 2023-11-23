import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import swal from 'sweetalert2';
import { FormBuilder, FormGroup,FormControl } from '@angular/forms';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import { EColumnsAuditoria as ColumnAudit } from 'src/app/core/_model/general/EColumnsAuditoria';
import { IColumnKey } from 'src/app/core/_model/general/IColumnKey';
import { ExcelService } from 'src/app/core/_service/general/excel-service';
import { PFDService } from 'src/app/core/_service/general/pdf-service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';
import { ProgramacionTecnicaService } from 'src/app/core/_service/prog/programacion-tecnica.service';
import { ProgramacionTecnicaModel } from 'src/app/core/_model/prog/programacion-tecnica-model';
import { ProgramacionTecnicaSemanalModel } from 'src/app/core/_model/prog/programacion-tecnica-semanal-model';
import { ProgramacionTecnicaSemanalService } from 'src/app/core/_service/prog/programacion-tecnica-semanal.service';
import * as _moment from 'moment';


@Component({
  selector: 'app-programacion-semanal',
  templateUrl: './programacion-semanal.component.html',
  styles: [
  ]
})
export class ProgramacionSemanalComponent implements OnInit {

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  dataSource = new MatTableDataSource<ProgramacionTecnicaSemanalModel>();
  numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  cantidadRegistros = 0;
  isLoadingResults = false;
  ColumnAudit = ColumnAudit;
  form: FormGroup;
  soloLectura = false;
  intAnio: number = new Date().getFullYear();
  intSem: number = 0;
  //date = new FormControl(moment());
 

  constructor(private router: Router,
    private excelService: ExcelService,
    private pFDService: PFDService,
    private formBuilder: FormBuilder,
    private tipoAccesoService: TipoAccesoService,
    private programacionTecService: ProgramacionTecnicaSemanalService) {
      this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Opcion);
      this.construirFormulario();
     }

 
     get nombreActivo(): string{
      return "Activo";
   }
 
   get nombreInactivo(): string{
     return "Inactivo";
   }
 
   ngOnInit(): void {
     this.inicializacionColumnas();
 
     this.listar();

//  let  currentdate:any = new Date();
//  let oneJan:any = new Date(currentdate.getFullYear(),0,1);
// let numberOfDays:number = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
// let result = Math.ceil(( currentdate.getDay() + 1 + numberOfDays) / 7);
// console.log('numero semana');
// console.log(result);
   }
   construirFormulario() {
     this.form = this.formBuilder.group({
       strBuscarNombre:[''],
       controlAnho :[this.intAnio],
       controlSemana : [this.GetNumeroSemana()],
     });
    
   }

   GetNumeroSemana():number{
    let  currentdate:any = new Date();
    let oneJan:any = new Date(currentdate.getFullYear(),0,1);
    let numberOfDays:number = Math.floor((currentdate - oneJan) / (24 * 60 * 60 * 1000));
    let result = Math.ceil(( currentdate.getDay() + 1 + numberOfDays) / 7);
    
     return result;
   }

   ngAfterViewInit(): void {
     this.configurarEnlaceColumnasSort();
   }
 
   configurarEnlaceColumnasSort(): void {
     this.dataSource.sortingDataAccessor = (item, property) => {
       switch (property) {
         case 'Id':
           return item.intId;
         case 'Titulo':
           return item.strNombre;
         case 'Del':
           return item.dtFechaInicio;
           case 'Al':
             return item.dtFechaFin;
         case 'Estado':
           return item.intEstado;
         case ColumnAudit.UsuarioCreacion:
           return item.strUsuarioCreacion;
         case ColumnAudit.FechaCreacion:
           return item.dtFechaCreacion;
         case ColumnAudit.IPCreacion:
           return item.strIPCreacion;
         case ColumnAudit.UsuarioModifica:
           return item.strUsuarioModificacion;
         case ColumnAudit.FechaModifica:
           return item.dtFechaModificacion;
         case ColumnAudit.IPModifica:
           return item.strIPModificacion;
         default:
           return item[property];
       }
     };
     this.dataSource.sort = this.sort;
   }
 
   enlaceMostrarOcultarColumn(columnName: string): IColumnKey {
     switch (columnName) {
       case 'Id':
         return { key: 'intId', subkey: '' };
       case 'Titulo':
         return { key: 'strNombre', subkey: '' };
       case 'Del':
         return { key: 'dtFechaInicio', subkey: '' };
         case 'Al':
         return { key: 'dtFechaFin', subkey: '' };
       case 'Estado':
         return { key: 'intEstado', subkey: '' };
       case ColumnAudit.UsuarioCreacion:
         return { key: 'strUsuarioCreacion', subkey: '' };
       case ColumnAudit.FechaCreacion:
         return { key: 'dtFechaCreacion', subkey: '' };
       case ColumnAudit.IPCreacion:
         return { key: 'strIPCreacion', subkey: '' };
       case ColumnAudit.UsuarioModifica:
         return { key: 'strUsuarioModificacion', subkey: '' };
       case ColumnAudit.FechaModifica:
         return { key: 'dtFechaModificacion', subkey: '' };
       case ColumnAudit.IPModifica:
         return { key: 'strIPModificacion', subkey: '' };
       default:
         return { key: '', subkey: '' };
     }
   }
 
   inicializacionColumnas(): void {
     // Columnas para MatTable
     this.displayedColumns = [
       'Id',
       'Titulo',
       'Del',
       'Al',
       ColumnAudit.UsuarioCreacion,
       ColumnAudit.FechaCreacion,
       ColumnAudit.IPCreacion,
       ColumnAudit.UsuarioModifica,
       ColumnAudit.FechaModifica,
       ColumnAudit.IPModifica,
       'Acciones',
     ];
     // Activar todas las Columnas
     this.displayedColumns.forEach((element, index) => {
       this.columnaOcultarMostrarList.push({
         possition: index,
         key: this.enlaceMostrarOcultarColumn(element).key,
         subkey: this.enlaceMostrarOcultarColumn(element).subkey,
         name: element,
         isActive: true,
       });
     });
     // Desactivar columnas
     this.desactivarColumnas([
       ColumnAudit.UsuarioCreacion,
       ColumnAudit.FechaCreacion,
       ColumnAudit.IPCreacion,
       ColumnAudit.UsuarioModifica,
       ColumnAudit.FechaModifica,
       ColumnAudit.IPModifica,
     ]);
   }
 
   desactivarColumnas(columnas: string[]): void {
     // Quitar columnas de Grilla
     columnas.forEach((x) => {
       const i = this.displayedColumns.indexOf(x);
       if (i > -1) {
         this.displayedColumns.splice(i, 1);
       }
     });
     // Desmarcar check de listado
     columnas.forEach((x) => {
       const i = this.columnaOcultarMostrarList.findIndex((z) => z.name === x);
       if (i > -1) {
         this.columnaOcultarMostrarList[i].isActive = false;
       }
     });
   }
 
   mostrarOcultarColumna(column: IColumnaPersonalizada): void {
     if (column.isActive) {
       if (column.possition > this.displayedColumns.length - 1) {
         this.displayedColumns.push(column.name);
       } else {
         this.displayedColumns.splice(column.possition, 0, column.name);
       }
     } else {
       const i = this.displayedColumns.indexOf(column.name);
       if (i > -1) {
         this.displayedColumns.splice(i, 1);
       }
     }
   }
 
   handlePage(e: any): void {
     console.log(e);
     this.numeroFilas = e.pageSize;
     if (this.dataSource.data.length > 0) {
       this.listar(e.pageIndex, e.pageSize);
     }
   }
 
   drop(event: CdkDragDrop<string[]>): void {
     moveItemInArray(
       this.displayedColumns,
       event.previousIndex,
       event.currentIndex
     );
   }
   buscar()
   {
     this.listar();
   }
 
   listar(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
     const form = this.form.value;

    console.log(form);
     this.programacionTecService
       .listarPageable(
         indicePagina,
         numeroFilasABuscar,form.strBuscarNombre,form.controlAnho,form.controlSemana)
       .pipe(finalize(() => (this.isLoadingResults = false)))
       .subscribe((response) => {
         console.log(response);
         this.cantidadRegistros = response.Total;
         this.dataSource.data = response.Items;
       });
   }
 
   limpiar() {}
 
   generar(): void {
     if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
       this.router.navigateByUrl(`prog/indisponibilidad/programaciongenerar/3`);
     }
   }
 
   COES():void{}
 
   resumen():void{}
 
   detalle():void{}
 
   editar(intIdOpcion: number): void {
     this.router.navigateByUrl(
       `prog/indisponibilidad/programacionsemanaledit/${intIdOpcion}`
     );
   }
 
   eliminar(opcion: ProgramacionTecnicaModel): void {
     if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
       swal
         .fire({
           title: 'Confirmación',
           text: `¿Está seguro de eliminar la opción: ${opcion.strNombre} ?`,
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
             this.programacionTecService
               .eliminar(opcion.intId)
               .pipe(finalize(() => (this.isLoadingResults = false)))
               .subscribe((respuesta) => {
                 console.log(respuesta);
 
                 swal.fire('Ok', respuesta.mensaje, 'success');
                 this.listar();
               });
           }
         });
     }
   }



}
