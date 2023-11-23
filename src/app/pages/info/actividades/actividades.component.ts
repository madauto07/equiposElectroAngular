import { AfterViewInit, Component, OnInit, ViewChild,Inject,LOCALE_ID } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { catchError, finalize, map, startWith } from 'rxjs/operators';
import swal from 'sweetalert2';
import { IColumnaPersonalizada } from 'src/app/core/_model/general/IColumnaPersonalizada';
import { EColumnsAuditoria as ColumnAudit } from 'src/app/core/_model/general/EColumnsAuditoria';
import { IColumnKey } from 'src/app/core/_model/general/IColumnKey';
import { ExcelService } from 'src/app/core/_service/general/excel-service';
import { PFDService } from 'src/app/core/_service/general/pdf-service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup } from '@angular/forms';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { ActividadService } from 'src/app/core/_service/info/actividad.service';
import { ActividadModel } from 'src/app/core/_model/info/actividad-model';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { SubconstanteModel } from 'src/app/core/_model/administracion/sub-constante-model';
import { SubconstanteService } from 'src/app/core/_service/administracion/subconstante.service';
import { Observable, throwError } from 'rxjs';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { BusquedaCodigoUbicacionTecnicaDialogComponent } from '../../modal-shared/busqueda-codigo-ubicacion-tecnica-dialog/busqueda-codigo-ubicacion-tecnica-dialog.component';
import { BusquedaCodigoEquipoDialogComponent } from '../../modal-shared/busqueda-codigo-equipo-dialog/busqueda-codigo-equipo-dialog.component';
import { BusquedaCodigoTrabajadorDialogComponent } from '../../modal-shared/busqueda-codigo-trabajador-dialog/busqueda-codigo-trabajador-dialog.component';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.component.html',
  styleUrls: ['./actividades.component.scss'],
})
export class ActividadesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  columnaOcultarMostrarList: IColumnaPersonalizada[] = [];
  dataSource = new MatTableDataSource<ActividadModel>();
  numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  cantidadRegistros = 0;
  isLoadingResults = false;
  ColumnAudit = ColumnAudit;
  form: FormGroup;
  selectedObjetoFiltro = 0;
  textSelectedObjetoFiltro = 'Todos';
  selectedTipoActivo = 0;
  textSelectedTipoActivo = 'Todos';
  selectedTipoMant : string[]=[];
  textSelectedTipoMant = 'Todos';
  listaParte: ConstanteModel[];
  listaParteFiltrada: Observable<ConstanteModel[]>;
  listaSubparte: SubconstanteModel[];
  listaSubParteFiltrada: Observable<SubconstanteModel[]>;
  listaTipoActivo: ConstanteModel[];
  listaTipoActivoFiltrada: Observable<ConstanteModel[]>;
  objetosTodos: ConstanteModel;
  listaObjetos: ConstanteModel[];
  listaTipoMant: ConstanteModel[];
  soloLectura = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private excelService: ExcelService,
    private pFDService: PFDService,
    private constanteService: ConstanteService,
    private subConstanteService: SubconstanteService,
    private actividadService: ActividadService,
    @Inject(LOCALE_ID) private locale: string,
    private http: HttpClient,
    public dialog: MatDialog,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Actividad);
    this.construirFormulario();
  }
  construirFormulario() {
    this.form = this.formBuilder.group({
      filtroParteSelectAC: [new ConstanteModel()],
      filtroSubParteSelectAC: [new SubconstanteModel()],
      filtroTitulo: [''],
      filtroCodigoActividad: [''],
      filtroSelectTipoMant: [''],
      filtroSelectObjeto: [''],
      filtroSelectTipoActivo: [''],
      filtroResponsable: [''],
      filtroUbicacionTecnica: [''],
      filtroCodigoEquipo: [''],
      filtroCodigoTrabajador: [''],
    });
  }

  ngOnInit(): void {
    this.inicializacionColumnas();
    this.obtenerListaParte();
    //this.obtenerListaSubParte();
    this.obtenerSelectTipoMantenimiento();
    this.obtenerSelectObjeto();
    this.obtenerSelectTipoActivo();
    this.listar();
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
        if (isEdit) {
          this.form.get('filtroSelectTipoMant').setValue(value);
        }
      });
  }

  obtenerSelectObjeto(isEdit: boolean = false, value: number = 0): void {
    this.isLoadingResults = true;
    this.objetosTodos = new ConstanteModel();
    this.objetosTodos.intId = 0;
    this.objetosTodos.strValor = 'Todos';
    this.constanteService
      .listarControlId(TipoConstanteEnum.Objeto)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((rpta) => {
        this.listaObjetos = rpta.Items;
        this.listaObjetos.splice(0, 0, this.objetosTodos);
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
          this.form.get('filtroSelectTipoActivo').setValue(value);
        }
      });
  }

  ngAfterViewInit(): void {
    this.configurarEnlaceColumnasSort();
  }

  configurarEnlaceColumnasSort(): void {
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'Id':
          return item.intId;
        case 'Mantto':
          return item.objConstanteTipoMantenimiento.strValor;
        case 'Codigo':
          return item.strCodigo;
        case 'Titulo':
          return item.strNombre;
        case 'Parte':
          return item.objConstanteParte.strValor;
        case 'Sub Parte':
          return item.objSubConstanteSubParte.strValor;
        case 'Objeto':
          return item.objConstanteObjeto.strValor;
        case 'Tipo Activo':
          return item.strTipoActivo;
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
      case 'Mantto':
        return { key: 'objConstanteTipoMantenimiento', subkey: 'strValor' };
      case 'Codigo':
        return { key: 'strCodigo', subkey: '' };
      case 'Titulo':
        return { key: 'strNombre', subkey: '' };
      case 'Parte':
        return { key: 'objConstanteParte', subkey: 'strValor' };
      case 'SubParte':
        return { key: 'objConstanteSubParte', subkey: 'strValor' };
      case 'Objeto':
        return { key: 'objConstanteObjeto', subkey: 'strValor' };
      case 'TipoActivo':
        return { key: 'strTipoActivo', subkey: '' };
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
      'Mantto',
      'Codigo',
      'Titulo',
      'Parte',
      'SubParte',
      'Objeto',
      'TipoActivo',
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
    // console.log(e);
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
    // let idTipoActivoFiltro = 0;
    let idTipoManttoFiltro = 0;
    let idObjetoFiltro = 0;
    let idParteFiltro = 0;
    let idSubParteFiltro = 0;

    if (this.form.value.filtroParteSelectAC.intId) {
      idParteFiltro = this.form.value.filtroParteSelectAC.intId;
      // console.log(idParteFiltro);
    }
    if (this.form.value.filtroSubParteSelectAC.intId) {
      idSubParteFiltro = this.form.value.filtroSubParteSelectAC.intId;
      // console.log(idParteFiltro);
    }
    console.log(this.selectedTipoMant);
    console.log(this.form.value.filtroSelectTipoMant)
    //console.log(JSON.stringify(this.selectedTipoMant.toString()));

    this.actividadService
      .listarPagina(
        indicePagina,
            numeroFilasABuscar,
            this.form.value.filtroTitulo,
            this.form.value.filtroCodigoActividad,
            this.selectedObjetoFiltro,
            this.selectedTipoActivo,
            this.form.value.filtroResponsable,
            this.form.value.filtroUbicacionTecnica,
            this.form.value.filtroCodigoEquipo,
            idParteFiltro,
            idSubParteFiltro,
           this.selectedTipoMant
      )
      .pipe(finalize(() => (this.isLoadingResults = false)),catchError(err=>{
        return throwError(err);
      }))
      .subscribe((response) => {
        //console.log( response);
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
      });

  }

  limpiar() {
    // TODO Limpiar
  }

  nuevo(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      this.router.navigateByUrl(`info/actividadmantenimiento/${0}`);
    }
  }

  editar(idEquipo: number): void {
    this.router.navigateByUrl(`info/actividadmantenimiento/${idEquipo}`);
  }

  actividad_datos(idactividad: number): void {
    this.router.navigateByUrl(`info/actividadmantenimientodatos/${idactividad}`);
  }

  actividad_FichaTecnica(idactividad: number): void {
    this.router.navigateByUrl(`info/actividadmantenimientoficha/${idactividad}`);
  }

  actividad_Factores(idactividad: number): void {
    this.router.navigateByUrl(`info/actividadmantenimientofactores/${idactividad}`);
  }

  actividad_Responsables(idactividad: number): void {
    this.router.navigateByUrl(`info/actividadmantenimientoresponsables/${idactividad}`);
  }

  actividad_equipos(idactividad: number): void {
    this.router.navigateByUrl(`info/actividadmantenimientoequipos/${idactividad}`);
  }

  actividad_hoja(idactividad: number): void {
    this.router.navigateByUrl(`info/actividadmantenimientohoja/${idactividad}`);
  }


  eliminar(actividad: ActividadModel): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      swal
        .fire({
          title: 'Confirmación',
          text: `¿Está seguro de eliminar la actividad: ${actividad.strNombre} ?`,
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
            this.actividadService
              .eliminar(actividad.intId)
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
      'Listado de Actividades',
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
      'Listado de Actividades',
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

  mostrarNombreParteSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  mostrarNombreSubParteSelect(option: any): string {
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
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.form
          .get('filtroCodigoEquipo')
          .setValue(result.codigoEquipoSeleccionado);
      }
    });
  }

  desplegarFiltroTrabajador() {
    const dialogRef = this.dialog.open(
      BusquedaCodigoTrabajadorDialogComponent,
      {
        width: '50%',
        height: '90%',
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.form
          .get('filtroCodigoTrabajador')
          .setValue(result.codigoTrabajadorSeleccionado);
      }
    });
  }

  // LISTAR PARTE
  obtenerListaParte(): void {
    this.isLoadingResults = true;
    const todos = new ConstanteModel();
    todos.intId = 0;
    todos.strValor = 'Todos';
    this.constanteService
      .listarControlId(TipoConstanteEnum.Parte)
      .pipe(
        finalize(() => {
          this.isLoadingResults = false;
        })
      )
      .subscribe((rpta) => {
        this.listaParte = rpta.Items;
        this.listaParte.splice(0, 0, todos);
        this.setObservableCambioSelectParte();
      });
  }

  setObservableCambioSelectParte(): void {
    this.listaParteFiltrada = this.form
      .get('filtroParteSelectAC')
      .valueChanges.pipe(
        startWith(new ConstanteModel()),
        map((valorInput) => this.filtrarlistaParte(valorInput))
      );
  }
  filtrarlistaParte(val: any): ConstanteModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strValor ? val.strValor : '';
    }
    return this.listaParte.filter((x) =>
      x.strValor.toLowerCase().includes(valorFiltrado)
    );
  }

  selectedParte(event: any): void {
    let idSeleccionado: number = event.option.value.intId;
    this.obtenerListaSubParte(idSeleccionado);
  }

  // LISTAR SUBPARTE
  obtenerListaSubParte(idParteSeleccionado: number): void {
    //  this.isLoadingResults = true;
    const todos = new SubconstanteModel();
    todos.intId = 0;
    todos.strValor = 'Todos';
    this.subConstanteService
      .listarControlId(idParteSeleccionado)

      .subscribe((rpta) => {
        this.listaSubparte = rpta.Items;
        this.listaSubparte.splice(0, 0, todos);
        this.setObservableCambioSelectSubParte();
      });
  }

  setObservableCambioSelectSubParte(): void {
    this.listaSubParteFiltrada = this.form
      .get('filtroSubParteSelectAC')
      .valueChanges.pipe(
        startWith(new SubconstanteModel()),
        map((valorInput) => this.filtrarlistaSubParte(valorInput))
      );
  }
  filtrarlistaSubParte(val: any): SubconstanteModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strValor ? val.strValor : '';
    }
    return this.listaSubparte.filter((x) =>
      x.strValor.toLowerCase().includes(valorFiltrado)
    );
  }


  onTipoActivoChange(idModulo: number): void {
    // console.log(idModulo);
    // this.obtenerListadoOpcionesPadre(idModulo);
  }

  onObjetoChange(event: any): void {
    //console.log(event.source.triggerValue);
    this.textSelectedObjetoFiltro = event.source.triggerValue;
  }

  onTipoMantenimientoChange(event: any): void {
    // console.log(event);
  }

  imprimirFichaTecnica(idactividad: number) {
    //Obtener datos de equipo
    this.actividadService.obtener(idactividad).subscribe((result: ActividadModel) => {
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

  async generatePDFFichaTecnica(actividad: ActividadModel) {
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
                { text: 'Código: ', bold: true },
                `${actividad.intId}`,
              ],
            },
            {
              width: '*',
              text: [
                { text: 'Tipo Mant: ', bold: true },
                `${actividad.objConstanteTipoMantenimiento.strValor}`,
              ],
            },
          ],
          margin: [8, 0, 0, 4],
          //Espacion entre columnas
          columnGap: 8,
        },
        {
          text: [{ text: 'Descripción: ', bold: true }, `${actividad.strNombre}`],
          margin: [8, 0, 0, 4],
        },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Objeto: ', bold: true },
                `${actividad.objConstanteObjeto?.strValor}`,
              ],
            },
            {
              width: '*',
              text: [{ text: 'Parte: ', bold: true }, `${actividad.objConstanteParte.strValor}`],
            },
          ],
          margin: [8, 0, 0, 4],
          //Espacion entre columnas
          columnGap: 8,
        },
        {
          text: 'Revisión',
          bold: true,
          margin: [0, 8],
          decoration: 'underline',
        },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Versión: ', bold: true },
                `${actividad.intNumeroVersion}`,
              ],
            },
            {
              width: '*',
              text: [
                { text: 'F. Versión: ', bold: true },
                `${formatDate(
                  new Date(`${actividad.dtFechaVersion}Z`),
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
          text: [{ text: 'Hora Inicio: ', bold: true }, `${actividad.strHoraInicio}`],
          margin: [8, 0, 0, 4],
        },
        {
          columns: [
            {
              width: '*',
              text: [{ text: 'Hora Fin: ', bold: true }, `${actividad.strHoraFin}`],
            },
            {
              width: '*',
              text: [
                { text: 'Tipo Personal: ', bold: true },
                `${actividad.objConstanteTipoPersonal.strValor}`,
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
              text: [{ text: 'Duración: ', bold: true }, `${actividad.strDuracion}`],
            },
            {
              width: '*',
              text: [{ text: 'Nivel de Resp.  : ', bold: true }, `${actividad.objConstanteNivelResp.strValor}`],
            },
          ],
          margin: [8, 0, 0, 4],
          //Espacion entre columnas
          columnGap: 8,
        },

        {
          text: 'Procedimiento',
          bold: true,
          margin: [0, 8],
          decoration: 'underline',
        },
        {
          text: `${actividad.strProcedimiento}`,
          margin: [8, 0, 0, 4],
          alignment: 'justify',
        },

        // Procedimiento tecnico

        {
          text: 'Procedimiento Técnico',
          bold: true,
          margin: [0, 8],
          decoration: 'underline',
        },
        {
          text: `${actividad.strProcedimientoTecnico}`,
          margin: [8, 0, 0, 4],
          alignment: 'justify',
        },

        //Proteccion personal

        {
          text: 'Proteccion personal',
          bold: true,
          margin: [0, 8],
          decoration: 'underline',
        },
        {
          text: `${actividad.strProteccionPersonal}`,
          margin: [8, 0, 0, 4],
          alignment: 'justify',
        },

            //Prevencion  Operacional

        {
          text: 'Prevención Operacional',
          bold: true,
          margin: [0, 8],
          decoration: 'underline',
        },
        {
          text: `${actividad.strPrevencionOperacional}`,
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
