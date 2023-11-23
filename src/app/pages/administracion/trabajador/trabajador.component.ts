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

import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { TrabajadorModel } from 'src/app/core/_model/administracion/trabajador-model';
import { TrabajadorService } from 'src/app/core/_service/administracion/trabajador.service';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';

import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-trabajador',
  templateUrl: './trabajador.component.html',
  styleUrls: ['./trabajador.component.scss'],
})
export class TrabajadorComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  dataSource = new MatTableDataSource<TrabajadorModel>();
  numeroFilas = 5;
  pageSizeOptions = [5, 10, 15, 20, 50];
  cantidadRegistros = 0;
  isLoadingResults = false;
  ColumnAudit = ColumnAudit;

  selectedEspecialidadFiltro = 0;
  textSelectedEspecialidadFiltro = 'Todos';
  especialidadTodos: ConstanteModel;
  strBuscarCodigo = '';
  listaEspecialidad: ConstanteModel[];
  soloLectura = false;
  constructor(
    private router: Router,
    private excelService: ExcelService,
    private pFDService: PFDService,
    private trabajadorService: TrabajadorService,
    private constanteService: ConstanteService,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.soloLectura = this.tipoAccesoService.getSoloLectura(
      EOpcion.Trabajadores
    );
  }

  ngOnInit(): void {
    this.inicializacionColumnas();
    this.setListaEspecialidad();
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
        case 'Codigo':
          return item.strCodigo;
        case 'Nombres':
          return item.strNombre;
        case 'Apellidos':
          return item.strApellido;
        case 'Correo':
          return item.strCorreo;
        case 'Especialidad':
          return item.objEspecialidad.strValor;
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
      case 'Codigo':
        return { key: 'strCodigo', subkey: '' };
      case 'Nombres':
        return { key: 'strNombre', subkey: '' };
      case 'Apellidos':
        return { key: 'strApellido', subkey: '' };
      case 'Correo':
        return { key: 'strCorreo', subkey: '' };
      case 'Especialidad':
        return { key: 'objEspecialidad', subkey: 'strValor' };
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
      'Codigo',
      'Nombres',
      'Apellidos',
      'Correo',
      'Especialidad',
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
    this.trabajadorService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        this.strBuscarCodigo,
        this.selectedEspecialidadFiltro
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
      });
  }

  nuevo(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      this.router.navigateByUrl(`administracion/trabajadormantenimiento/${0}`);
    }
  }

  editar(id: number): void {
    this.router.navigateByUrl(`administracion/trabajadormantenimiento/${id}`);
  }

  eliminar(trabajador: TrabajadorModel): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      swal
        .fire({
          title: 'Confirmación',
          text: `¿Está seguro de eliminar la opción: ${trabajador.strNombre} ?`,
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
            this.trabajadorService
              .eliminar(trabajador.intId)
              .pipe(finalize(() => (this.isLoadingResults = false)))
              .subscribe((respuesta) => {
                swal.fire('Ok', respuesta.mensaje, 'success');
                this.listar();
              });
          }
        });
    }
  }

  exportarExcel(): void {
    this.excelService.exportAsExcelFile(
      'Listado de Trabajadores',
      '',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      [
        { filtro: 'Codigo:', valorFiltro: this.strBuscarCodigo },
        {
          filtro: 'Especialidad:',
          valorFiltro: this.textSelectedEspecialidadFiltro,
        },
      ],
      this.dataSource.data,
      [],
      'trabajadores',
      'listadoTrabajadores',
      'UsuarioCreador'
    );
  }

  exportarPDF(): void {
    this.pFDService.exportAsPDFFile(
      'Listado de Trabajadores',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      this.dataSource.data
    );
  }

  setListaEspecialidad(): void {
    this.especialidadTodos = new ConstanteModel();
    this.especialidadTodos.intId = 0;
    this.especialidadTodos.strValor = 'Todos';
    this.constanteService
      .listarControlId(TipoConstanteEnum.Especialidad)
      .subscribe((response) => {
        this.listaEspecialidad = response.Items;
        this.listaEspecialidad.splice(0, 0, this.especialidadTodos);
      });
  }

  selectedValueEspecialidad(event: any): void {
    this.textSelectedEspecialidadFiltro = event.source.triggerValue;
  }
}
