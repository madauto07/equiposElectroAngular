import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import swal from 'sweetalert2';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import { EColumnsAuditoria as ColumnAudit } from 'src/app/core/_model/general/EColumnsAuditoria';
import { IColumnKey } from 'src/app/core/_model/general/IColumnKey';
import { ExcelService } from 'src/app/core/_service/general/excel-service';
import { PFDService } from 'src/app/core/_service/general/pdf-service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { PrefijoModel } from 'src/app/core/_model/info/prefijo-model';
import { PrefijoService } from 'src/app/core/_service/info/prefijo.service';
import { OpcionService } from 'src/app/core/_service/administracion/opcion.service';

@Component({
  selector: 'app-nivel01',
  templateUrl: './nivel01.component.html',
  styles: [
  ]
})
export class Nivel01Component implements OnInit,AfterViewInit {

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  dataSource = new MatTableDataSource<PrefijoModel>();
  numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  cantidadRegistros = 0;
  isLoadingResults = false;
  ColumnAudit = ColumnAudit;

  selectedModuloFiltro = 0;
  textSelectedModuloFiltro = 'Todos';
 // moduloTodos: NivelModel;
  strBuscarNombre = '';
  //listaModulo: NivelModel[];

  constructor(
    private router: Router,
    private excelService: ExcelService,
    private pFDService: PFDService,
    private opcionService: OpcionService,
    private prefijoService: PrefijoService
    //private moduloService: ModuloService
  ) {
  }

  ngOnInit(): void {
    this.inicializacionColumnas();
   // this.setListaModulo();
    this.listar();
  }
  ngAfterViewInit(): void {
    this.configurarEnlaceColumnasSort();
  }

  configurarEnlaceColumnasSort(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'Id':
          return item.intId;
        case 'Nivel':
          return item.objNivel.strNombre;
          case 'Descripcion':
            return item.strDescripcion;
        case 'Nombre':
          return item.strNombre;
          case 'Superior':
            return item.intSuperior;
            case 'Tamano':
              return item.intTamano;
              case 'Orden':
                return item.intOrden;
        case 'Estado':
          return item.dbEstado;
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
      case 'Nivel':
        return { key: 'objNivel', subkey: 'strNombre' };
        case 'Descripcion':
          return { key: 'strDescripcion', subkey: '' };
      case 'Nombre':
        return { key: 'strNombre', subkey: '' };
        case 'Superior':
          return { key: 'intSuperior', subkey: '' };
          case 'Tamano':
            return { key: 'intTamano', subkey: '' };
            case 'Orden':
              return { key: 'intOrden', subkey: '' };

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
      'Nivel',
      'Descripcion',
      'Nombre',
      'Superior',
      'Tamano',
      'Orden',
      'Estado',
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

  listar(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
    this.isLoadingResults = true;
    this.prefijoService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
       this.strBuscarNombre,1
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
        console.log(response.Items);
      });
  }





  editarDatos(intIdPrefijo: number): void {
    this.router.navigateByUrl(
      `info/estructura/datosmantenimiento/${intIdPrefijo}`
    );
  }


  exportarExcel(): void {
    this.excelService.exportAsExcelFile(
      'Listado de Niveles y Prefijos',
      '',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      [
        { filtro: 'Modulo:', valorFiltro: this.textSelectedModuloFiltro },
        { filtro: 'Nombre:', valorFiltro: this.strBuscarNombre },
      ],
      this.dataSource.data,
      [],
      'opciones',
      'listadoOpciones',
      'UsuarioCreador'
    );
  }

  exportarPDF(): void {
    this.pFDService.exportAsPDFFile(
      'Listado de Niveles y Prefijos',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      this.dataSource.data
    );
  }

  // setListaModulo(): void {
  //   this.moduloTodos = new ModuloModel();
  //   this.moduloTodos.intId = 0;
  //   this.moduloTodos.strNombre = 'Todos';
  //   this.moduloService.listar().subscribe((response: ModuloModel[]) => {
  //     this.listaModulo = response;
  //     this.listaModulo.splice(0, 0, this.moduloTodos);
  //   });
  //}

  selectedValueModulo(event: any): void {
    this.textSelectedModuloFiltro = event.source.triggerValue;
  }


}
