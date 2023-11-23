import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SubconstanteModel } from 'src/app/core/_model/administracion/sub-constante-model';
import { ActivatedRoute, Router } from '@angular/router';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import { EColumnsAuditoria as ColumnAudit } from 'src/app/core/_model/general/EColumnsAuditoria';
import { IColumnKey } from 'src/app/core/_model/general/IColumnKey';
import { ExcelService } from 'src/app/core/_service/general/excel-service';
import { PFDService } from 'src/app/core/_service/general/pdf-service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';

import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { TipoConstanteService } from 'src/app/core/_service/administracion/tipoconstante.service';
import { SubconstanteService } from 'src/app/core/_service/administracion/subconstante.service';
import { finalize } from 'rxjs/operators';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { TipoConstanteModel } from 'src/app/core/_model/administracion/tipo-constante-model';
import swal from 'sweetalert2';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';
@Component({
  selector: 'app-subconstante',
  templateUrl: './subconstante.component.html',
  styleUrls: ['./subconstante.component.scss'],
})
export class SubconstanteComponent implements OnInit, AfterViewInit {
  //#region variables
  idTipoConstante = 0;
  idConstante = 0;
  idSubConstante = 0;
  isLoadingResults = false;
  nombreTipoConstanteFiltro = '';
  nombreConstanteFiltro = '';
  nombreSubconstanteFiltro = '';
  cantidadRegistros = 0;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  ColumnAudit = ColumnAudit;
  dataSource = new MatTableDataSource<SubconstanteModel>();
  bolGuardandoData = false;
  soloLectura = false;
  //#endregion

  //#region constructor
  constructor(
    private activateRoute: ActivatedRoute,
    private excelService: ExcelService,
    private pFDService: PFDService,
    private constanteService: ConstanteService,
    private tipoConstanteService: TipoConstanteService,
    private subconstanteService: SubconstanteService,
    private router: Router,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.idTipoConstante = Number(
      this.activateRoute.snapshot.paramMap.get('idtipo')
    );
    this.idConstante = Number(
      this.activateRoute.snapshot.paramMap.get('idconstante')
    );
    this.soloLectura = this.tipoAccesoService.getSoloLectura(
      EOpcion.Constantes
    );
  }
  //#endregion

  //#region Inicializador de componente
  ngOnInit(): void {
    this.inicializacionColumnas();
    this.ObtenerTipoConstante();
    this.ObtenerConstante();
    this.BuscarEnServicio(0, this.numeroFilas);
  }

  ngAfterViewInit(): void {
    this.configurarEnlaceColumnasSort();
  }

  configurarEnlaceColumnasSort(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'Id':
          return item.intId;
        case 'Nombre':
          return item.strNombre;
        case 'Valor':
          return item.strValor;
        case 'Descripcion':
          return item.strDescripcion;
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
      case 'Nombre':
        return { key: 'strNombre', subkey: '' };
      case 'Valor':
        return { key: 'strValor', subkey: '' };
      case 'Descripcion':
        return { key: 'strDescripcion', subkey: '' };
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
      'Nombre',
      'Valor',
      'Descripcion',
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

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      this.displayedColumns,
      event.previousIndex,
      event.currentIndex
    );
  }

  //#endregion

  //#region Funciones
  ObtenerTipoConstante(): void {
    this.isLoadingResults = true;
    this.tipoConstanteService
      .Obtener(this.idTipoConstante)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((tipocons: TipoConstanteModel) => {
        this.nombreTipoConstanteFiltro = tipocons.strNombre;
      });
  }

  ObtenerConstante(): void {
    this.isLoadingResults = true;
    this.constanteService
      .Obtener(this.idConstante)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((tipocons: ConstanteModel) => {
        this.nombreConstanteFiltro = tipocons.strNombre;
      });
  }

  BuscarEnServicio(indicePagina: number, numeroFilasABuscar: number): void {
    this.isLoadingResults = true;
    this.subconstanteService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        this.idConstante,
        this.nombreSubconstanteFiltro
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
      });
  }

  buscar(): void {
    this.BuscarEnServicio(0, this.numeroFilas);
  }

  exportarExcel(): void {
    this.excelService.exportAsExcelFile(
      'Listado de Subconstantes',
      '',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      [{ filtro: 'Nombre:', valorFiltro: this.nombreSubconstanteFiltro }],
      this.dataSource.data,
      [],
      'subconstantes',
      'listadoSubconstantes',
      'UsuarioCreador'
    );
  }

  exportarPDF(): void {
    this.pFDService.exportAsPDFFile(
      'Listado de Subconstantes',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      this.dataSource.data
    );
  }

  limpiar(): void {
    this.nombreSubconstanteFiltro = '';
    document.getElementById('filtroNombre').focus();
  }

  nuevo(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      // TODO: NUEVO
      this.idSubConstante = 0;
      this.bolGuardandoData = true;
    }
  }

  Editar(idSubConstante: number): void {
    this.idSubConstante = idSubConstante;
    this.bolGuardandoData = true;
  }

  Eliminar(rol: SubconstanteModel): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      swal
        .fire({
          title: 'Confirmación',
          text: `¿Está seguro de eliminar la Subconstante ${rol.strNombre} ?`,
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
            this.subconstanteService
              .Eliminar(rol.intId)
              .pipe(finalize(() => (this.isLoadingResults = false)))
              .subscribe((respuesta) => {
                swal.fire('Ok', respuesta.mensaje, 'success');
                this.buscar();
              });
          }
        });
    }
  }

  handlePage(e: any): void {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.BuscarEnServicio(e.pageIndex, e.pageSize);
    }
  }

  ocultarComponenteRegistro(ocultar: boolean): void {
    this.bolGuardandoData = ocultar;
  }

  listarSubConstante(listar: boolean): void {
    this.buscar();
  }

  irAListadoConstante(): void {
    this.router.navigateByUrl(
      `administracion/constantes/${this.idTipoConstante}`
    );
  }

  //#endregion
}
