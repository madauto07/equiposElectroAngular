import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import swal, { SweetAlertOptions } from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { finalize } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FactorVerificacionModel } from 'src/app/core/_model/info/factor-verificacion-model';
import { ModoVerificacionModel } from 'src/app/core/_model/info/modo-verificacion-model';
import { ModoVerificacionService } from 'src/app/core/_service/info/modo-verificacion.service';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-modo-verificacion-modal',
  templateUrl: './modo-verificacion-modal.component.html',
  styles: [],
})
export class ModoVerificacionModalComponent implements OnInit {
  soloLectura = false;

  constructor(
    private tipoAccesoService: TipoAccesoService,
    private formBuilder: FormBuilder,
    private modoService: ModoVerificacionService,
    public dialogRef: MatDialogRef<ModoVerificacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formModo.get('codigoMV').setValue(data.codigoMV);
    this.intIdModo = data.codigoMV;
    this.intIdFactor = data.codigoFV;
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Actividad);
  }
  displayTitulo: string = '';

  intIdModo: number = 0;
  intIdFactor: number = 0;

  public isLoadingResults = false;
  modoModel: ModoVerificacionModel;
  formModo = this.formBuilder.group({
    codigoMV: [''],
    evaluacion: ['', Validators.required],
    nombre: ['', Validators.required],
    valor: ['', Validators.required],
  });

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit(): void {
    this.BuscarFactorVerificacion();
  }

  BuscarFactorVerificacion(): void {
    if (this.intIdModo > 0) {
      this.displayTitulo = 'Modificar de Modo de Verificación';
      this.modoService
        .obtener(this.intIdModo)
        .pipe(finalize(() => (this.isLoadingResults = false)))
        .subscribe((respuesta) => {
          this.modoModel = respuesta as ModoVerificacionModel;
          console.log(respuesta);
          this.EstablecerValorEnFormulario('nombre', this.modoModel.strNombre);
          this.EstablecerValorEnFormulario('valor', this.modoModel.strValor);
          this.EstablecerValorEnFormulario(
            'evaluacion',
            this.modoModel.intEvaluacion
          );
        });
    } else {
      this.displayTitulo = 'Registro de Modo de Verificación';
    }
  }

  EstablecerValorEnFormulario(nombreControl: string, valor: any) {
    this.formModo.controls[nombreControl].setValue(valor);
  }

  Grabar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      this.modoModel = new ModoVerificacionModel();

      if (this.formModo.valid) {
        let formfactor = this.formModo.value;
        console.log(formfactor);
        //this.factorModel.intId= formfactor.codigoFV;
        this.modoModel.strNombre = formfactor.nombre;
        this.modoModel.intEvaluacion = formfactor.evaluacion;
        this.modoModel.strValor = formfactor.valor;
        this.modoModel.intIdFactor = this.intIdFactor;
        console.log(this.modoModel);

        swal
          .fire({
            title: 'Confirmación',
            text: '¿Está seguro de guardar los cambios?.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#004f91',
            cancelButtonColor: '#7B7A83',
            confirmButtonText: 'Sí, Aceptar!',
            cancelButtonText: 'No, Cancelar!',
          })
          .then((result) => {
            if (result.value) {
              console.log(this.intIdModo);
              if (this.intIdModo > 0) {
                this.modoModel.intId = formfactor.codigoMV;
                this.isLoadingResults = true;

                this.modoService
                  .actualizar(this.modoModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.dialogRef.close();
                    // this.router.navigateByUrl(`administracion/areas`);
                  });
              } else {
                this.modoModel.intEstado = 1;

                console.log(this.modoModel);
                this.isLoadingResults = true;
                this.modoService
                  .registrar(this.modoModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.toString(), 'success');
                    this.dialogRef.close();
                    //swal.fire('Ok',respuesta.mensaje,'success')
                    // this.router.navigateByUrl(`administracion/areas`);
                  });
              }
            }
          });
      }
    }
  }

  Cancelar(): void {
    this.dialogRef.close();
  }
}
