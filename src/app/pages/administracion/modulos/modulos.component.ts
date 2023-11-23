import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ModuloModel } from 'src/app/core/_model/administracion/modulo-model';
import { ModuloService } from 'src/app/core/_service/administracion/modulo.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';

@Component({
  selector: 'app-modulos',
  templateUrl: './modulos.component.html',
  styleUrls: ['./modulos.component.scss'],
})
export class ModulosComponent implements OnInit {
  ModuloModelo: ModuloModel;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns = ['id', 'nombre', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<ModuloModel>();
  public isLoadingResults = false;
  strBuscarNombre: string = '';
  cantidadRegistros: number = 0;
  numeroFilas: number = 10;
  soloLectura = false;
  constructor(
    private router: Router,
    private moduloService: ModuloService,
    private tipoAccesoService: TipoAccesoService,
    private configurationService: ConfigurationService
  ) {
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Modulo);
  }

  get nombreActivo(): string{
    return this.configurationService.getNombreActivo();
  }

  get nombreInactivo(): string{
    return this.configurationService.getNombreInactivo();
  }

  ngOnInit(): void {
    this.numeroFilas = 5;
    this.BuscarEnServicio(0, this.numeroFilas);
    this.isLoadingResults = true;
  }

  Eliminar(area: ModuloModel) {
    if (this.validarSoloLectura()) {
      swal
      .fire({
        title: 'Confirmación',
        text: `¿Está seguro de eliminar el modulo ${area.strNombre} ?`,
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
          this.moduloService
            .eliminar(area.intId)
            .pipe(finalize(() => (this.isLoadingResults = false)))
            .subscribe((respuesta) => {
              swal.fire('Ok', respuesta.mensaje, 'success');
              this.buscar();
            });
        }
      });
    }
  }

  validarSoloLectura(): boolean{
    let continuarEjecucionCodigo = true
    if (this.soloLectura) {
      swal
      .fire({
        title: 'No tiene habilitada esta opción',
        icon: 'info',
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Aceptar',
      })
      continuarEjecucionCodigo = false
    }
    return continuarEjecucionCodigo
  }

  Nuevo() {
    if (this.validarSoloLectura()) {
      this.router.navigateByUrl(`administracion/modulomantenimiento/${0}`);
    }
  }

  Editar(intId: number) {
    this.router.navigateByUrl(`administracion/modulomantenimiento/${intId}`);
  }

  exportarExcel() {

  }

  exportarPDF(){

  }

  buscar(): void {
    this.BuscarEnServicio(0, this.numeroFilas);
  }

  limpiar() {
    this.strBuscarNombre = '';
    this.cantidadRegistros = 0;
    this.dataSource = new MatTableDataSource<ModuloModel>();
  }

  private BuscarEnServicio(
    indicePagina: number,
    numeroFilasABuscar: number
  ): void {
    let strbuscarNombre = this.strBuscarNombre;
    this.isLoadingResults = true;

    this.moduloService
      .listarPageable(indicePagina, numeroFilasABuscar, strbuscarNombre)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
        console.log(response);
      });
  }

  handlePage(e: any) {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.BuscarEnServicio(e.pageIndex, e.pageSize);
    }
  }
}
