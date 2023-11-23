import { AfterViewInit,Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import { EColumnsAuditoria as ColumnAudit } from 'src/app/core/_model/general/EColumnsAuditoria';
import { IColumnKey } from 'src/app/core/_model/general/IColumnKey';
import { ExcelService } from 'src/app/core/_service/general/excel-service';
import { PFDService } from 'src/app/core/_service/general/pdf-service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';

import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { TipoConstanteModel } from 'src/app/core/_model/administracion/tipo-constante-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { TipoConstanteService } from 'src/app/core/_service/administracion/tipoconstante.service';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';
@Component({
  selector: 'app-constantes',
  templateUrl: './constantes.component.html',
  styleUrls: ['./constantes.component.scss'],
})
export class ConstantesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  ColumnAudit = ColumnAudit;
  //displayedColumns = ['id', 'nombre', 'valor', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<ConstanteModel>();
  public isLoadingResults = false;
  intIdTipoConstante = 0;
  strBuscarNombre = '';
  strTipoConstante = 0;
  strNombreTipoConstante = '';
  cantidadRegistros = 0;
  numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  soloLectura = false;

  constructor(
    private router: Router,
    private excelService: ExcelService,
    private pFDService: PFDService,
    private constanteService: ConstanteService,
    private tipoConstanteService: TipoConstanteService,
    private activateRoute: ActivatedRoute,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.intIdTipoConstante = Number(
      this.activateRoute.snapshot.paramMap.get('idTipo')
    );
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Constantes);
  }

  ngOnInit(): void {
    this.inicializacionColumnas();
    this.ObtenerTipoConstante();
    this.BuscarEnServicio(0, this.numeroFilas, this.intIdTipoConstante);
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
        case 'Codito':
          return { key: 'strCodigo', subkey: '' };
        case 'Valor':
        return { key: 'strValor', subkey: '' };
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
      'Codigo',
      'Valor',
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

  ObtenerTipoConstante(): void {
    this.isLoadingResults = true;
    this.tipoConstanteService
      .Obtener(this.intIdTipoConstante)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((tipocons: TipoConstanteModel) => {
        this.strNombreTipoConstante = tipocons.strNombre;
      });
  }

  BuscarEnServicio(
    indicePagina: number,
    numeroFilasABuscar: number,
    inttipoConstante: number
  ): void {
    const strbuscarNombre = this.strBuscarNombre;
    this.isLoadingResults = true;

    this.constanteService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        inttipoConstante,
        strbuscarNombre
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
      });
  }

  Eliminar(rol: ConstanteModel): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
    swal
      .fire({
        title: 'Confirmación',
        text: `¿Está seguro de eliminar la constante ${rol.strNombre} ?`,
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
          this.constanteService
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

  nuevo(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
    this.router.navigateByUrl(
      `administracion/constantemantenimiento/${
        this.intIdTipoConstante
      }/${0}`
    );
    }
  }

  Editar(idconstante: number): void {
    this.router.navigateByUrl(
      `administracion/constantemantenimiento/${this.intIdTipoConstante}/${idconstante}`
    );
  }

  exportarExcel(): void {
    this.excelService.exportAsExcelFile(
      'Listado de Constantes',
      '',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      [
        { filtro: 'Nombre:', valorFiltro: this.strBuscarNombre }
      ],
      this.dataSource.data,
      [],
      'constantes',
      'listadoconstantes',
      'UsuarioCreador'
    );
  }

  exportarPDF(): void {
    this.pFDService.exportAsPDFFile(
      'Listado de Constantes',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      this.dataSource.data
    );
  }

  buscar(): void {
    this.BuscarEnServicio(0, this.numeroFilas, this.intIdTipoConstante);
  }

  limpiar(): void {
    this.strBuscarNombre = '';
    document.getElementById('filtroNombre').focus();
  }

  handlePage(e: any): void {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.BuscarEnServicio(e.pageIndex, e.pageSize, this.intIdTipoConstante);
    }
  }

  verSubConstante(constante: ConstanteModel): void {
    this.router.navigateByUrl(`administracion/subconstantes/${constante.intIdTipoConstante}/${constante.intId}`);
  }

  irAListadoTipoConstante(): void{
    this.router.navigateByUrl(`administracion/tipoconstantes`);
  }


}
