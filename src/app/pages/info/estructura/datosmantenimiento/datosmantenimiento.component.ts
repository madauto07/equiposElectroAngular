import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  Input,
} from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import swal from 'sweetalert2';
import { finalize, map, startWith } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
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
import { RolModel } from 'src/app/core/_model/administracion/rol-model';

import { PrefijoModel } from 'src/app/core/_model/info/prefijo-model';
import { PrefijoService } from 'src/app/core/_service/info/prefijo.service';
import { DatoModel } from 'src/app/core/_model/info/dato-model';
import { DatoService } from 'src/app/core/_service/info/dato.service';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';
@Component({
  selector: 'app-datosmantenimiento',
  templateUrl: './datosmantenimiento.component.html',
  styles: [],
})
export class DatosmantenimientoComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  ColumnAudit = ColumnAudit;
  //displayedColumns = ['id', 'nombre', 'valor', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<DatoModel>();
  public isLoadingResults = false;

  strNivel = '';
  strDescripcion = '';
  strPrefijo = '';

  cantidadRegistros = 0;
  numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  intIdPrefijo = 0;

  rol: RolModel;
  prefijo: PrefijoModel;
  bolGuardandoData = false;
  idOpcion: 0;
  idPrefijo: 0;
  idDatos = 0;
  idNivel = 0;
  idSuperior = 0;
  idPrefijoLst = 0;
  soloLectura = false;

  constructor(
    private excelService: ExcelService,
    private pFDService: PFDService,
    private formBuilder: FormBuilder,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private prefijoService: PrefijoService,
    private datoService: DatoService,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.soloLectura = this.tipoAccesoService.getSoloLectura(
      EOpcion.Estructura
    );
    this.intIdPrefijo = Number(
      this.activateRoute.snapshot.paramMap.get('idPrefijo')
    );
  }

  ngOnInit(): void {
    this.ObtenerPrefijo();

    this.inicializacionColumnas();
    //this.ObtenerPrefijo();
    this.buscar();

    if (this.intIdPrefijo == 0) {
      //Retornar
    } else {
      //BUscar prefijo y datos
      //this.ObtenerPrefijo();
    }
  }

  ngAfterViewInit(): void {
    this.configurarEnlaceColumnasSort();
  }

  configurarEnlaceColumnasSort(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'Id':
          return item.intId;
        case 'Superior':
          return item.intIdSuperior;
        case 'Codigo':
          return item.strCodigo;
        case 'Valor':
          return item.strNombre;
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
      case 'Superior':
        return { key: 'intIdSuperior', subkey: '' };
      case 'Codigo':
        return { key: 'strCodigo', subkey: '' };
      case 'Valor':
        return { key: 'strNombre', subkey: '' };
      case 'Estado':
        return { key: 'dbEstado', subkey: '' };
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
      'Superior',
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

  ObtenerPrefijo(): void {
    this.isLoadingResults = true;
    // console.log(this.intIdPrefijo);
    this.prefijoService
      .Obtener(this.intIdPrefijo)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((prefijo: PrefijoModel) => {
        this.strNivel = prefijo.objNivel.strNombre;
        this.strPrefijo = prefijo.strNombre;
        this.strDescripcion = prefijo.strDescripcion;
        this.idSuperior = prefijo.intIdSuperior;
        this.idNivel = prefijo.intIdNivel;
        this.idPrefijoLst = prefijo.intidPrefijoLst;
        console.log(prefijo);
      });
  }

  BuscarEnServicio(
    indicePagina: number,
    numeroFilasABuscar: number,
    intidPrefijo: number
  ): void {
    //const strbuscarNombre = this.strBuscarNombre;
    this.isLoadingResults = true;

    this.datoService
      .listarPageable(indicePagina, numeroFilasABuscar, intidPrefijo)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
      });
  }

  Eliminar(dato: DatoModel): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
    swal
      .fire({
        title: 'Confirmación',
        text: `¿Está seguro de eliminar la Datos ${dato.strNombre} ?`,
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
          this.datoService
            .Eliminar(dato.intId)
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
    this.idDatos = 0;
    this.bolGuardandoData = true;
    // this.router.navigateByUrl(
    //   `administracion/constantemantenimiento/${
    //     this.intIdTipoConstante
    //   }/${0}`
    // );
    }
  }

  Editar(iddatos: number): void {
    this.idDatos = iddatos;
    this.bolGuardandoData = true;
  }

  exportarExcel(): void {
    this.excelService.exportAsExcelFile(
      'Listado de Datos',
      '',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      [{ filtro: 'Nombre:', valorFiltro: '' }],
      this.dataSource.data,
      [],
      'datos',
      'listadodatos',
      'UsuarioCreador'
    );
  }

  exportarPDF(): void {
    this.pFDService.exportAsPDFFile(
      'Listado de Datos',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      this.dataSource.data
    );
  }

  buscar(): void {
    this.BuscarEnServicio(0, this.numeroFilas, this.intIdPrefijo);
  }

  limpiar(): void {
    // this.strBuscarNombre = '';
    // document.getElementById('filtroNombre').focus();
  }

  handlePage(e: any): void {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.BuscarEnServicio(e.pageIndex, e.pageSize, this.intIdPrefijo);
    }
  }

  irAListadoTipoConstante(): void {
    this.router.navigateByUrl(`info/estructura/nivel01`);
  }

  ocultarComponenteRegistro(ocultar: boolean): void {
    this.bolGuardandoData = ocultar;
  }
  listarDatos(listar: boolean): void {
    this.buscar();
    //this.listar(this.rol.intId);
  }

  nuevo_datos(): void {
    this.idDatos = 0;
    this.bolGuardandoData = true;
  }
}
