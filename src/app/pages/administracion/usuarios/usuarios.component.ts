import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UsuarioModel } from 'src/app/core/_model/administracion/usuario-model';
import { UsuarioService } from 'src/app/core/_service/administracion/usuario.service';
import { AreaService } from 'src/app/core/_service/administracion/area.service';
import { RolService } from 'src/app/core/_service/administracion/rol.service';

import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

import { ConfigurationService } from 'src/app/core/_service/general/configuration.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  providers: [DatePipe],
})
export class UsuariosComponent implements OnInit {
  UsuarioModelo: UsuarioModel;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns = [
    'id',
    'login',
    'nombres',
    'apellidos',
    'roles',
    'estado',
    'acciones',
  ];
  dataSource = new MatTableDataSource<UsuarioModel>();
  public isLoadingResults = false;
  strBuscarLogin: any = '';
  cantidadRegistros: number = 0;
  numeroFilas: number = 10;
  listaRol: any[] = [];
  formularioListaUsuario = this.formBuilder.group({
    controlArea: new FormControl(''),
    controlRoles: new FormControl(''),
    controlLogin: new FormControl(''),
  });

  soloLectura = false;
  titulo: string = '';

  constructor(
    private router: Router,
    private userService: UsuarioService,
    private rolService: RolService,
    private formBuilder: FormBuilder,
    private tipoAccesoService: TipoAccesoService,
    private configurationService: ConfigurationService
  ) {
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Usuario);
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

    const observable = forkJoin([this.rolService.listar()]);

    observable.pipe(finalize(() => (this.isLoadingResults = false))).subscribe({
      next: (value) => {
        //console.log("pipe");
        console.log(value[0].Items);
        this.listaRol = value[0].Items;
      },
      complete: () => {},
    });
  }

  Eliminar(model: UsuarioModel) {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      swal
        .fire({
          title: 'Confirmación',
          text: `¿Está seguro de eliminar el modulo ${model.strNombres} ?`,
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
            this.userService
              .Eliminar(model.intId)
              .pipe(finalize(() => (this.isLoadingResults = false)))
              .subscribe((respuesta) => {
                swal.fire('Ok', respuesta.mensaje, 'success');
                this.buscar();
              });
          }
        });
    }
  }

  nuevo() {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      this.router.navigateByUrl(`administracion/usuariomantenimiento/${0}`);
    }
  }

  Editar(idUsuario: number) {
    this.router.navigateByUrl(
      `administracion/usuariomantenimiento/${idUsuario}`
    );
  }

  Asignar(idUsuario: number) {
    this.router.navigateByUrl(`administracion/usuarioperfil/${idUsuario}`);
  }

  Exportar() {}

  buscar(): void {
    this.BuscarEnServicio(0, this.numeroFilas);
  }

  limpiar() {
    this.strBuscarLogin = '';
    this.cantidadRegistros = 0;
    this.dataSource = new MatTableDataSource<UsuarioModel>();
  }

  private BuscarEnServicio(
    indicePagina: number,
    numeroFilasABuscar: number
  ): void {
    let formulario = this.formularioListaUsuario.value;
    let strBuscarLogin = formulario.controlLogin ? formulario.controlLogin : '';
    let idPerfil = formulario.controlRoles ? formulario.controlRoles.intId : 0;
    //let intIdarea= formulario.controlArea.intIdTablaDetalle;
    console.log(formulario);
    this.isLoadingResults = true;

    this.userService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        strBuscarLogin,
        idPerfil
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
        console.log(response.Items);
      });
  }

  handlePage(e: any) {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.BuscarEnServicio(e.pageIndex, e.pageSize);
    }
  }

  exportarExcel(){

  }

  exportarPDF(){

  }

}
