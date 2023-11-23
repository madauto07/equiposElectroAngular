import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import swal from 'sweetalert2';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import { EColumnsAuditoria as ColumnAudit } from 'src/app/core/_model/general/EColumnsAuditoria';
import { IColumnKey } from 'src/app/core/_model/general/IColumnKey';
import { ExcelService } from 'src/app/core/_service/general/excel-service';
import { PFDService } from 'src/app/core/_service/general/pdf-service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';

import { OpcionRolModel } from 'src/app/core/_model/administracion/opcion-rol-model';
import { OpcionRolService } from 'src/app/core/_service/administracion/opcion-rol.service';
import { RolService } from 'src/app/core/_service/administracion/rol.service';
import { RolModel } from 'src/app/core/_model/administracion/rol-model';

import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-opcion-rol',
  templateUrl: './opcion-rol.component.html',
  styleUrls: ['./opcion-rol.component.css'],
})
export class OpcionRolComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  dataSource = new MatTableDataSource<OpcionRolModel>();
  numeroFilas = 5;
  pageSizeOptions = [5, 10, 15, 20, 50];
  cantidadRegistros = 0;
  selectedModuloFiltro = 0;
  isLoadingResults = false;
  rol: RolModel;
  bolGuardandoData = false;
  idOpcion: 0;
  soloLectura = false;
  constructor(
    private router: Router,
    private excelService: ExcelService,
    private pFDService: PFDService,
    private opcionRolService: OpcionRolService,
    private rolService: RolService,
    private activateRoute: ActivatedRoute,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.rol = new RolModel();
    this.rol.intId = Number(this.activateRoute.snapshot.paramMap.get('idrol'));
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Perfil);
  }

  ngOnInit(): void {
    this.inicializacionColumnas();
    this.obtenerOpcionRol();
    this.listar(this.rol.intId);
  }

  ngAfterViewInit(): void {
    this.configurarEnlaceColumnasSort();
  }

  obtenerOpcionRol(): void {
    this.isLoadingResults = true;
    this.rolService
      .Obtener(this.rol.intId)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((result: RolModel) => {
        this.rol = result;
      });
  }

  configurarEnlaceColumnasSort(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'Modulo':
          return item.objOpcion.objModulo.strNombre;
        case 'Opcion':
          return item.objOpcion.strNombre;
        case 'Acceso':
          return item.objTipoAcceso.strValor;
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
      case 'Modulo':
        return { key: 'objOpcion', subkey: 'strNombre' };
      case 'Opcion':
        return { key: 'objOpcion', subkey: 'strNombre' };
      case 'Acceso':
        return { key: 'objTipoAcceso', subkey: 'strValor' };
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
      'Modulo',
      'Opcion',
      'Acceso',
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
      this.listar(this.rol.intId, e.pageIndex, e.pageSize);
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(
      this.displayedColumns,
      event.previousIndex,
      event.currentIndex
    );
  }

  listar(
    idRol: number,
    indicePagina = 0,
    numeroFilasABuscar = this.numeroFilas
  ): void {
    this.isLoadingResults = true;
    this.opcionRolService
      .listarPageable(indicePagina, numeroFilasABuscar, idRol)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
      });
  }

  nuevo(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      this.idOpcion = 0;
      this.bolGuardandoData = true;
    }
  }

  eliminar(opcionRol: OpcionRolModel): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      swal
        .fire({
          title: 'Confirmación',
          text: `¿Está seguro de eliminar la opcion asignada al perfil?`,
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
            this.opcionRolService
              .eliminar(opcionRol.intIdOpcion, opcionRol.intIdRol)
              .pipe(finalize(() => (this.isLoadingResults = false)))
              .subscribe((respuesta) => {
                swal.fire('Ok', respuesta.mensaje, 'success');
                this.listar(this.rol.intId);
              });
          }
        });
    }
  }

  exportarExcel(): void {
    this.excelService.exportAsExcelFile(
      `Listado de Opciones asociadas al perfil ${this.rol.strNombre}`,
      '',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      [],
      this.dataSource.data,
      [],
      'opcionesPerfil',
      'listadoOpcionesPerfil',
      'usuario'
    );
  }

  exportarPDF(): void {
    this.pFDService.exportAsPDFFile(
      `Listado de Opciones asociadas al perfil ${this.rol.strNombre}`,
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      this.dataSource.data
    );
  }

  irAListadoPerfil(): void {
    this.router.navigateByUrl(`administracion/perfiles`);
  }

  ocultarComponenteRegistro(ocultar: boolean): void {
    this.bolGuardandoData = ocultar;
  }

  listarOpcionRol(listar: boolean): void {
    this.listar(this.rol.intId);
  }
}
