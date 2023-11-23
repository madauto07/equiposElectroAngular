import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AreaModel } from 'src/app/core/_model/administracion/area-model';
import { AreaService } from 'src/app/core/_service/administracion/area.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';
import { ExcelService } from 'src/app/core/_service/general/excel-service';
import { PFDService } from 'src/app/core/_service/general/pdf-service';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.scss'],
})
export class AreasComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator?: MatPaginator;
  displayedColumns = ['id', 'nombre', 'estado', 'acciones'];
  dataSource = new MatTableDataSource<any>();
  public isLoadingResults = false;
  public strBuscarNombre: any = '';
  cantidadRegistros: number = 0;
  numeroFilas: number = 10;

  soloLectura = false;

  constructor(
    private router: Router,
    private areaService: AreaService,
    private tipoAccesoService: TipoAccesoService,
    private configurationService: ConfigurationService
  ) {
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Area);
  }

  get nombreActivo(): string{
    return this.configurationService.getNombreActivo();
  }

  get nombreInactivo(): string{
    return this.configurationService.getNombreInactivo();
  }

  ngOnInit(): void {
    this.numeroFilas = 5;
    this.isLoadingResults = true;
    this.BuscarAreaEnServicio(0, this.numeroFilas);

  }

  ElminarArea(area: AreaModel) {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
    swal
      .fire({
        title: 'Confirmación',
        text: `¿Está seguro de eliminar el area ${area.strNombre} ?`,
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
          this.areaService
            .Eliminar(area.intId)
            .pipe(finalize(() => (this.isLoadingResults = false)))
            .subscribe((respuesta) => {
              swal.fire('Ok', respuesta.mensaje, 'success');
              this.buscarAreas();
            });
        }
      });
    }
  }

  NuevoArea() {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      this.router.navigateByUrl(`administracion/areasmantenimiento/${0}`);
    }
  }

  EditarArea(intIdArea: number) {
    this.router.navigateByUrl(`administracion/areasmantenimiento/${intIdArea}`);
  }

  ExportarArea() {}

  buscarAreas(): void {
    this.BuscarAreaEnServicio(0, this.numeroFilas);
  }

  limpiarArea() {
    this.strBuscarNombre = '';
    this.cantidadRegistros = 0;
    this.dataSource = new MatTableDataSource<AreaModel>();
  }

  private BuscarAreaEnServicio(
    indicePagina: number,
    numeroFilasABuscar: number
  ): void {
    let strbuscarNombre = this.strBuscarNombre;
    this.isLoadingResults = true;
    this.areaService
      .listarPageable(indicePagina, numeroFilasABuscar, strbuscarNombre)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
      });
  }

  handlePage(e: any) {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.BuscarAreaEnServicio(e.pageIndex, e.pageSize);
    }
  }

  exportarExcel(): void {}

  exportarPDF(): void {}
}
