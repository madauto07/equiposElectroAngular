import { Component, OnInit, SecurityContext } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { EquipoDocumentoModel } from 'src/app/core/_model/info/equipo-documento-model';
import { DocumentoModel } from 'src/app/core/_model/info/documento-model';
import { EquipoDocumentoService } from 'src/app/core/_service/info/equipo-documento.service';
import { DocumentoService } from 'src/app/core/_service/info/documento.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { finalize } from 'rxjs/operators';
import swal from 'sweetalert2';
import { EConstante } from 'src/app/core/_model/general/EConstante';
import * as fs from 'file-saver';
import { MatDialog } from '@angular/material/dialog';
import { EquipoMantenimientoDocumentoPreviewComponent } from '../equipo-mantenimiento-documento-preview/equipo-mantenimiento-documento-preview.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-equipo-mantenimiento-documento',
  templateUrl: './equipo-mantenimiento-documento.component.html',
  styleUrls: ['./equipo-mantenimiento-documento.component.scss']
})
export class EquipoMantenimientoDocumentoComponent implements OnInit {

  form: FormGroup;
  idEquipo = 0;
  idTipoDocumento = EConstante.TipoDocumentoDocumento;
  filtroNombre = '';
  isLoadingResults = false;
  equipoDocumentoModel: EquipoDocumentoModel;
  displayedColumns = ['Id', 'Nombre', 'URL', 'Acciones'];
  dataSource = new MatTableDataSource<DocumentoModel>();
  numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  cantidadRegistros = 0;
  selectedFile: File[];
  formatosPermitidos = ['pdf',
                        'doc','docx','.dot',
                        'xls','xlsx','xlsm',
                        'ppt','pptx','pps','pot',
                        'txt',
                        'csv']

  constructor(
    private formBuilder: FormBuilder,
    private equipoDocumentoService: EquipoDocumentoService,
    private documentoService: DocumentoService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.obtenerIdUrl();
    this.construirFormulario();
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      nombre: ['', Validators.required],
      url: [''],
      archivo: ['', Validators.required],
      idequipo: [this.idEquipo],
      usuario: [''],
      ip: [''],
      idTipoDocumento: [this.idTipoDocumento],
      archivoSource: [''],
    });
  }

  obtenerIdUrl(): void {
    this.idEquipo = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.listar();
  }

  getFontSize() {
    return 12;
  }

  handlePage(e: any): void {
    console.log(e);
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.listar(e.pageIndex, e.pageSize);
    }
  }

  listar(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
    this.isLoadingResults = true;
    this.documentoService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        this.idEquipo,
        this.idTipoDocumento,
        this.filtroNombre
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
      });
  }

  guardar(): void {
    if (this.form.valid) {
      // Archivo
      console.log(this.form.value);
      swal
        .fire({
          title: 'Confirmación',
          text: '¿Está seguro de guardar el documento?.',
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
            this.equipoDocumentoService
              .registrar(this.form.value)
              .pipe(finalize(() => (this.isLoadingResults = false)))
              .subscribe((respuesta) => {
                swal.fire('Ok', respuesta.mensaje, 'success');
                this.listar();
                this.cancelar()
              });
          }
        });
    }
  }

  limpiar() {
    this.filtroNombre = '';
    document.getElementById('filtroNombreImagen').focus();
  }

  examinar(event) {
    this.selectedFile = <File[]>event.target.files;
    if (this.selectedFile.length > 0) {
      this.form.get('archivo').setValue(this.selectedFile[0].name);
      this.form.get('archivoSource').setValue(this.selectedFile[0]);
    }
  }

  cancelar() {
    this.form.get('nombre').reset();
    this.form.get('nombre').setErrors(null);
    this.form.get('nombre').setValue('');
    this.form.get('url').reset();
    this.form.get('url').setValue('');
    this.form.get('archivo').reset();
    this.form.get('archivo').setValue('');
    this.form.get('archivo').setErrors(null);
    this.form.get('archivoSource').reset();
    this.form.get('archivoSource').setValue('');
    (<HTMLInputElement>document.getElementById('file')).value = '';
    document.getElementById('nombreImagenForm').focus();
  }

  vistaPrevia(idDocumento: number) {
    this.isLoadingResults = true;
    this.documentoService
      .obtener(idDocumento)
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((data: DocumentoModel) => {
        let pdf = data.vbArchivo
        const dialogRef = this.dialog.open(
          EquipoMantenimientoDocumentoPreviewComponent,
          {
            width: '90%',
            height: '90%',
            data: { nombreDocumento: data.strNombre, srcBase64Documento: pdf },
          }
        );
      });
  }

  descargar(idDocumento: number) {
    this.documentoService
      .obtener(idDocumento)
      .subscribe((data: DocumentoModel) => {
        const arrayNombreArchivo = data.strDescripcion.split('.')
        let extension = "pdf"
        if (arrayNombreArchivo.length > 1) {
          extension = arrayNombreArchivo.pop();
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

  eliminar(documento: DocumentoModel): void {
    swal
      .fire({
        title: 'Confirmación',
        text: `¿Está seguro de eliminar el documento?`,
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
          this.equipoDocumentoService
            .eliminar(this.idEquipo, documento.intId)
            .pipe(finalize(() => (this.isLoadingResults = false)))
            .subscribe((respuesta) => {
              swal.fire('Ok', respuesta.mensaje, 'success');
              this.listar();
            });
        }
      });
  }


}
