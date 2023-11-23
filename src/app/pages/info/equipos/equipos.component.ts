import {
  AfterViewInit,
  Component,
  Inject,
  LOCALE_ID,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { finalize, map, startWith } from 'rxjs/operators';
import swal from 'sweetalert2';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import { EColumnsAuditoria as ColumnAudit } from 'src/app/core/_model/general/EColumnsAuditoria';
import { IColumnKey } from 'src/app/core/_model/general/IColumnKey';
import { ExcelService } from 'src/app/core/_service/general/excel-service';
import { PFDService } from 'src/app/core/_service/general/pdf-service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';

import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { EquipoModel } from 'src/app/core/_model/info/equipo-model';
import { EquipoService } from 'src/app/core/_service/info/equipo.service';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { Observable } from 'rxjs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BusquedaCodigoUbicacionTecnicaDialogComponent } from '../../modal-shared/busqueda-codigo-ubicacion-tecnica-dialog/busqueda-codigo-ubicacion-tecnica-dialog.component';
import { BusquedaCodigoEquipoDialogComponent } from '../../modal-shared/busqueda-codigo-equipo-dialog/busqueda-codigo-equipo-dialog.component';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-equipos',
  templateUrl: './equipos.component.html',
  styleUrls: ['./equipos.component.scss'],
})
export class EquiposComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  dataSource = new MatTableDataSource<EquipoModel>();
  numeroFilas: number;
  pageSizeOptions: number[];
  cantidadRegistros = 0;
  isLoadingResults = false;
  ColumnAudit = ColumnAudit;
  form: FormGroup;

  listaTipoActivo: ConstanteModel[];
  listaTipoActivoFiltrada: Observable<ConstanteModel[]>;
  soloLectura = false;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private excelService: ExcelService,
    private pFDService: PFDService,
    private configurationService: ConfigurationService,
    private tipoAccesoService: TipoAccesoService,
    private equipoService: EquipoService,
    private constanteService: ConstanteService,
    @Inject(LOCALE_ID) private locale: string,
    private http: HttpClient,
    public dialog: MatDialog
  ) {
    this.construirFormulario();
    // Asignar variables de configuracion
    this.numeroFilas = this.configurationService.getNumeroFilas();
    this.pageSizeOptions = this.configurationService.getRangoPaginacion();
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Equipo);
  }

  construirFormulario() {
    this.form = this.formBuilder.group({
      filtroDescripcion: [''],
      filtroCodigoKKS: [''],
      filtroTipoEquipoSelectAC: [new ConstanteModel()],
      filtroUbicacionTecnica: [''],
      filtroCodigoEquipo: [''],
    });
  }

  ngOnInit(): void {
    this.inicializacionColumnas();
    this.obtenerListaTipoActivo();
    this.listar();
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

  setObservableCambioSelectTipoActivo(): void {
    this.listaTipoActivoFiltrada = this.form
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

  ngAfterViewInit(): void {
    this.configurarEnlaceColumnasSort();
  }

  configurarEnlaceColumnasSort(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'Id':
          return item.intId;
        case 'Codigo KKS':
          return item.strCodigoKKS;
        case 'Descripcion':
          return item.strNombre;
        case 'Tipo':
          return item.objConstanteTipoActivo.strValor;
        case 'N° Serie':
          return item.strNumeroSerie;
        case 'Marca':
          return item.objDatoMarca.strNombre;
        case 'Modelo':
          return item.strModelo;
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
      case 'Codigo KKS':
        return { key: 'strCodigoKKS', subkey: '' };
      case 'Descripcion':
        return { key: 'strNombre', subkey: '' };
      case 'Tipo':
        return { key: 'objConstanteTipoActivo', subkey: 'strValor' };
      case 'N° Serie':
        return { key: 'strNumeroSerie', subkey: '' };
      case 'Marca':
        return { key: 'objDatoMarca', subkey: 'strNombre' };
      case 'Modelo':
        return { key: 'strModelo', subkey: '' };
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
      'Codigo KKS',
      'Descripcion',
      'Tipo',
      'N° Serie',
      'Marca',
      'Modelo',
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
    let idTipoActivoFiltro = 0;
    if (this.form.value.filtroTipoEquipoSelectAC.intId) {
      idTipoActivoFiltro = this.form.value.filtroTipoEquipoSelectAC.intId;
    }
    this.equipoService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        this.form.value.filtroDescripcion,
        this.form.value.filtroCodigoKKS,
        idTipoActivoFiltro,
        this.form.value.filtroUbicacionTecnica,
        this.form.value.filtroCodigoEquipo
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
        console.log('equipos');
        console.log(response.Items);
      });
  }

  limpiar() {
    this.form.get('filtroDescripcion').setValue('');
    this.form.get('filtroCodigoKKS').setValue('');
    this.form.get('filtroTipoEquipoSelectAC').setValue(new ConstanteModel());
    this.form.get('filtroUbicacionTecnica').setValue('');
    this.form.get('filtroCodigoEquipo').setValue('');
    this.listar();
  }

  nuevo(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      this.router.navigateByUrl(`info/equipomantenimiento/${0}`);
    }
  }

  editar(idEquipo: number): void {
    this.router.navigateByUrl(`info/equipomantenimiento/${idEquipo}`);
  }

  eliminar(equipo: EquipoModel): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      swal
        .fire({
          title: 'Confirmación',
          text: `¿Está seguro de eliminar el activo: ${equipo.strNombre} ?`,
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
            this.equipoService
              .eliminar(equipo.intId)
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
      'Listado de Equipos',
      '',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      [
        {
          filtro: 'Descripcion:',
          valorFiltro: this.form.value.filtroDescripcion,
        },
        { filtro: 'Cód. KKS:', valorFiltro: this.form.value.filtroCodigoKKS },
        {
          filtro: 'Tipo:',
          valorFiltro: this.form.value.filtroTipoAutoComplete,
        },
        {
          filtro: 'Ubicación Técnica:',
          valorFiltro: this.form.value.filtroUbicacionTecnica,
        },
        {
          filtro: 'Código del Equipo:',
          valorFiltro: this.form.value.filtroCodigoEquipo,
        },
      ],
      this.dataSource.data,
      [],
      'equipos',
      'listadoEquipos',
      ''
    );
  }

  exportarPDF(): void {
    this.pFDService.exportAsPDFFile(
      'Listado de Equipos',
      this.columnaOcultarMostrarList.filter((x) => x.isActive && x.key !== ''),
      this.dataSource.data
    );
  }

  mostrarNombreTipoActivoSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  desplegarFiltroUbicacionTecnica() {
    const dialogRef = this.dialog.open(
      BusquedaCodigoUbicacionTecnicaDialogComponent,
      {
        width: '50%',
        height: '90%',
        disableClose: true
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.form
          .get('filtroUbicacionTecnica')
          .setValue(result.codigoUbicacionTecnicaSeleccionado);
      }
    });
  }

  desplegarFiltroCodigoEquipo() {
    const dialogRef = this.dialog.open(BusquedaCodigoEquipoDialogComponent, {
      width: '50%',
      height: '90%',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.form
          .get('filtroCodigoEquipo')
          .setValue(result.codigoEquipoSeleccionado);
      }
    });
  }

  imprimirFichaTecnica(idEquipo: number) {
    //Obtener datos de equipo
    this.equipoService.obtener(idEquipo).subscribe((result: EquipoModel) => {
      console.log(result);
      this.generatePDFFichaTecnica(result);
    });
  }

  public getBase64Image() {
    return this.http
      .get('/assets/img/u18.png', { responseType: 'blob' })
      .toPromise()
      .then((res) => {
        return res;
      });
  }

  blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  async generatePDFFichaTecnica(equipo: EquipoModel) {
    let imagBlob = await this.getBase64Image();
    let imag = await this.blobToBase64(imagBlob);
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      header: {
        columns: [
          {
            image: imag,
            width: 60,
            margin: [8, 8, 0, 0],
          },
          {
            stack: [
              `Usuario: ${localStorage.getItem('username')}`,
              `Fecha: ${formatDate(new Date(), 'dd/MM/yyyy', this.locale)}`,
              `Hora: ${formatDate(new Date(), 'hh:mm:ss a', this.locale)}`,
            ],
            fontSize: 8,
            alignment: 'right',
            margin: [0, 8, 8, 0],
          },
        ],
      },
      footer: function (currentPage, pageCount) {
        return [
          {
            text: 'Pág. ' + currentPage.toString() + ' de ' + pageCount,
            alignment: 'center',
            margin: [0, 16, 0, 0],
          },
        ];
      },
      content: [
        {
          text: 'Ficha Técnica',
          fontSize: 14,
          alignment: 'center',
          bold: true,
          //color: '#047886',
          margin: [0, 0, 0, 8],
        },
        {
          text: 'Datos del Activo',
          bold: true,
          margin: [0, 8],
          decoration: 'underline',
        },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Código KKS: ', bold: true },
                `${equipo.strCodigoKKS}`,
              ],
            },
            {
              width: '*',
              text: [
                { text: 'Código SITEC: ', bold: true },
                `${equipo.strCodigoSITEC}`,
              ],
            },
          ],
          margin: [8, 0, 0, 4],
          //Espacion entre columnas
          columnGap: 8,
        },
        {
          text: [{ text: 'Descripción: ', bold: true }, `${equipo.strNombre}`],
          margin: [8, 0, 0, 4],
        },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Marca: ', bold: true },
                `${equipo.objDatoMarca?.strNombre}`,
              ],
            },
            {
              width: '*',
              text: [{ text: 'Modelo: ', bold: true }, `${equipo.strModelo}`],
            },
          ],
          margin: [8, 0, 0, 4],
          //Espacion entre columnas
          columnGap: 8,
        },
        {
          text: 'Caracteristicas del Activo',
          bold: true,
          margin: [0, 8],
          decoration: 'underline',
        },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Tipo: ', bold: true },
                `${equipo.objConstanteTipoEquipo?.strValor}`,
              ],
            },
            {
              width: '*',
              text: [
                { text: 'F. Fabricación: ', bold: true },
                `${formatDate(
                  new Date(`${equipo.dtFechaFabricacion}Z`),
                  'dd/MM/yyyy',
                  this.locale
                )}`,
              ],
            },
          ],
          margin: [8, 0, 0, 4],
          //Espacion entre columnas
          columnGap: 8,
        },
        {
          text: [{ text: 'Cantidad: ', bold: true }, `${equipo.intCantidad}`],
          margin: [8, 0, 0, 4],
        },
        {
          columns: [
            {
              width: '*',
              text: [{ text: 'Serie: ', bold: true }, `${equipo.strSerie}`],
            },
            {
              width: '*',
              text: [
                { text: 'Referencia: ', bold: true },
                `${equipo.strReferencia}`,
              ],
            },
          ],
          margin: [8, 0, 0, 4],
          //Espacion entre columnas
          columnGap: 8,
        },
        {
          columns: [
            {
              width: '*',
              text: [{ text: 'Tipo: ', bold: true }, `${equipo.strTipoEquipo}`],
            },
            {
              width: '*',
              text: [
                { text: 'F. Instalacion: ', bold: true },
                `${formatDate(
                  new Date(`${equipo.dtFechaInstalacion}Z`),
                  'dd/MM/yyyy',
                  this.locale
                )}`,
              ],
            },
          ],
          margin: [8, 0, 0, 4],
          //Espacion entre columnas
          columnGap: 8,
        },
        {
          text: 'Informe',
          bold: true,
          margin: [0, 8],
          decoration: 'underline',
        },
        {
          text: `${equipo.strInforme}`,
          margin: [8, 0, 0, 4],
          alignment: 'justify',
        },
      ],

      defaultStyle: {
        fontSize: 12,
      },
    };
    pdfMake.createPdf(docDefinition).download();
  }
}
