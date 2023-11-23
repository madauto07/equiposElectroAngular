import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import swal from 'sweetalert2';
import * as fs from 'file-saver';
import { ElementoService } from 'src/app/core/_service/info/elemento.service';
import { DocumentoModel } from 'src/app/core/_model/info/documento-model';
import { DocumentoService } from 'src/app/core/_service/info/documento.service';
import { ActividadElementoModel } from 'src/app/core/_model/info/actividad-elemento-model';
import { ActividadElementoService } from 'src/app/core/_service/info/actividad-elemento.service';
import { finalize } from 'rxjs/operators';
import { ElementoModel } from 'src/app/core/_model/info/elemento-model';
import { ActivatedRoute } from '@angular/router';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';
@Component({
  selector: 'app-actividad-mantenimiento-hoja',
  templateUrl: './actividad-mantenimiento-hoja.component.html',
  styleUrls: ['./actividad-mantenimiento-hoja.component.scss'],
})
export class ActividadMantenimientoHojaComponent implements OnInit {
  isLoadingResults = false;
  idActividad = 0;
  form: FormGroup;
  dataSourceElementoBusqueda = new MatTableDataSource<ElementoModel>();
  displayedColumnsElementoBusqueda = ['Id', 'Descripcion', 'Acciones'];
  dataSourceElementoAsignado = new MatTableDataSource<ElementoModel>();
  displayedColumnsElementoAsignado = ['Id', 'Descripcion', 'Acciones'];

  selectedFile: File[];

  idElementoSeleccionado: number;
  elementoAsignadoSel: ElementoModel = new ElementoModel();
  isEdit = false;
  soloLectura = false;

  constructor(
    private formBuilder: FormBuilder,
    private elementoService: ElementoService,
    private documentoService: DocumentoService,
    private actividadElementoService: ActividadElementoService,
    private activateRoute: ActivatedRoute,
    private tipoAccesoService: TipoAccesoService
  ) {
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Actividad);
    this.construirFormulario();
    this.obtenerIdUrl();
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      id: [0],
      descripcion: ['', Validators.required],
      archivo: [''],
      usuario: [''],
      ip: [''],
      archivoSource: [''],
      iddocumento: [0],
    });
  }

  obtenerIdUrl(): void {
    this.idActividad = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.listarElementos();
    this.listarElementosAsignados();
  }

  getFontSize() {
    return 12;
  }

  rowClick(elemento: ElementoModel) {
    this.idElementoSeleccionado = elemento.intId;
  }

  rowClickElementosAsignados(elemento: ElementoModel) {
    this.elementoAsignadoSel = elemento;
  }

  editarElemento(elemento: ElementoModel) {
    //obtener elemento
    this.elementoService
      .obtener(elemento.intId)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((elem: ElementoModel) => {
        this.isEdit = true;
        this.form.get('id').setValue(elem.intId);
        this.form.get('descripcion').setValue(elem.strNombre);
        this.form.get('archivo').setValue(elem.objDocumento.strDescripcion);
        //this.form.get('archivoSource').setValue(elem.objDocumento.vbArchivo);
        this.form.get('iddocumento').setValue(elem.intIdDocumento);
        //Convertir Base64 a File y asignarlo al formulario
        const arrayNombreArchivo = elem.objDocumento.strDescripcion.split('.');
        let extension = '';
        if (arrayNombreArchivo.length > 1) {
          extension = arrayNombreArchivo[1];
        }
        const file = new Blob([
          this.b64toFile(
            elem.objDocumento.vbArchivo,
            'nombre',
            `image/${extension}`
          ),
        ]);
        this.form.get('archivoSource').setValue(file);
      });
  }

  eliminarElemento(elemento: ElementoModel) {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      swal
        .fire({
          title: 'Confirmación',
          text: `¿Está seguro de eliminar el elemento?`,
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
            let elementoEliminar: ElementoModel = new ElementoModel();
            elementoEliminar.intId = elemento.intId;
            elementoEliminar.intIdDocumento = elemento.intIdDocumento;
            elementoEliminar.strIPCreacion = '';
            elementoEliminar.strUsuarioCreacion =
              localStorage.getItem('username');
            this.elementoService
              .eliminar(elementoEliminar)
              .pipe(finalize(() => (this.isLoadingResults = false)))
              .subscribe((respuesta) => {
                swal.fire('Ok', respuesta.mensaje, 'success');
                this.listarElementos();
              });
          }
        });
    }
  }

  validaElementoAsignado() {
    return this.actividadElementoService
      .obtener(this.idActividad, this.idElementoSeleccionado)
      .toPromise()
      .then((res) => {
        if (res.intEstado == 1) {
          return false;
        } else {
          return true;
        }
      });
  }

  async agregarAsignacion() {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.idElementoSeleccionado > 0) {
        const valida = await this.validaElementoAsignado();
        if (valida) {
          swal
            .fire({
              title: 'Confirmación',
              text: '¿Está seguro de asignar el elemento seleccionado?.',
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
                let actividadElemento = new ActividadElementoModel();
                actividadElemento.intIdActividad = this.idActividad;
                actividadElemento.intIdElemento = this.idElementoSeleccionado;
                actividadElemento.strUsuarioCreacion =
                  localStorage.getItem('username');
                actividadElemento.strIPCreacion = '';
                this.actividadElementoService
                  .registrar(actividadElemento)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.listarElementosAsignados();
                  });
              }
            });
        } else {
          swal.fire({
            title: 'El elemento seleccionado ya está asignado',
            icon: 'info',
            confirmButtonColor: '#004f91',
            confirmButtonText: 'Aceptar',
          });
        }
      }
    }
  }

  eliminarAginacion() {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.elementoAsignadoSel.intId > 0) {
        swal
          .fire({
            title: 'Confirmación',
            text: `¿Está seguro de eliminar la asignación del elemento ${this.elementoAsignadoSel.strNombre} ?`,
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
              let actividadElementoEliminar = new ActividadElementoModel();
              actividadElementoEliminar.intIdActividad = this.idActividad;
              actividadElementoEliminar.intIdElemento =
                this.elementoAsignadoSel.intId;
              actividadElementoEliminar.strIPCreacion = '';
              actividadElementoEliminar.strUsuarioCreacion =
                localStorage.getItem('username');
              this.actividadElementoService
                .eliminar(actividadElementoEliminar)
                .pipe(finalize(() => (this.isLoadingResults = false)))
                .subscribe((respuesta) => {
                  swal.fire('Ok', respuesta.mensaje, 'success');
                  this.listarElementosAsignados();
                });
            }
          });
      }
    }
  }

  descargarArchivoElemento(elemento: ElementoModel) {
    this.documentoService
      .obtener(elemento.intIdDocumento)
      .subscribe((data: DocumentoModel) => {
        const arrayNombreArchivo = data.strDescripcion.split('.');
        let extension = '';
        if (arrayNombreArchivo.length > 1) {
          extension = arrayNombreArchivo[1];
        }
        const file = new Blob([
          this.b64toFile(data.vbArchivo, 'nombre', `image/${extension}`),
        ]);
        fs.saveAs(file, `${data.strNombre}.${extension}`);
      });
  }

  b64toFile(b64Data, filename, contentType) {
    var sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);

      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    var file = new File(byteArrays, filename, { type: contentType });
    return file;
  }

  examinar(event) {
    this.selectedFile = <File[]>event.target.files;
    if (this.selectedFile.length > 0) {
      this.form.get('archivo').setValue(this.selectedFile[0].name);
      this.form.get('archivoSource').setValue(this.selectedFile[0]);
      //console.log(this.selectedFile[0]);
    }
  }

  limpiarFormulario() {
    this.isEdit = false;
    this.form.get('id').reset();
    this.form.get('id').setValue(0);
    this.form.get('iddocumento').reset();
    this.form.get('iddocumento').setValue(0);
    this.form.get('descripcion').reset();
    this.form.get('descripcion').setErrors(null);
    this.form.get('descripcion').setValue('');
    this.form.get('archivo').reset();
    this.form.get('archivo').setValue('');
    this.form.get('archivo').setErrors(null);
    this.form.get('archivoSource').reset();
    this.form.get('archivoSource').setValue('');
    (<HTMLInputElement>document.getElementById('file')).value = '';
    document.getElementById('idDescripcionElementoBusqueda').focus();
  }

  listarElementos(): void {
    this.isLoadingResults = true;
    this.elementoService
      .listar()
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.dataSourceElementoBusqueda.data = response;
      });
  }

  listarElementosAsignados(): void {
    this.isLoadingResults = true;
    this.elementoService
      .listarxActividad(this.idActividad)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.dataSourceElementoAsignado.data = response;
      });
  }

  guardarElemento(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      if (this.form.valid) {
        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar el elemento?.',
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
              if (this.form.get('id').value == 0) {
                //Registrar
                this.elementoService
                  .registrar(this.form.value)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.listarElementos();
                    this.limpiarFormulario();
                  });
              } else {
                //Actualizar
                this.elementoService
                  .actualizar(this.form.value)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.listarElementos();
                    this.limpiarFormulario();
                  });
              }
            }
          });
      }
    }
  }

  cancelar(): void {
    this.limpiarFormulario();
  }
}
