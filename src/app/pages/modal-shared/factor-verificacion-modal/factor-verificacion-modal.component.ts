import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import swal, { SweetAlertOptions } from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { finalize } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FactorVerificacionModel } from 'src/app/core/_model/info/factor-verificacion-model';
import { ModoVerificacionModel } from 'src/app/core/_model/info/modo-verificacion-model';
import { FactorVerificacionService } from 'src/app/core/_service/info/factor-verificacion.service';
import { TipoAccesoService } from 'src/app/core/_service/general/tipoacceso.service';
import { EOpcion } from 'src/app/core/_model/general/EOpcion';

@Component({
  selector: 'app-factor-verificacion-modal',
  templateUrl: './factor-verificacion-modal.component.html',
  styleUrls: ['./factor-verificacion-modal.component.css'],
})
export class FactorVerificacionModalComponent implements OnInit {
  soloLectura = false;

  constructor(
    private tipoAccesoService: TipoAccesoService,
    private formBuilder: FormBuilder,
    private factorService: FactorVerificacionService,
    public dialogRef: MatDialogRef<FactorVerificacionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.formFactor.get('codigoFV').setValue(data.codigoFV);
    this.intIdFactor = data.codigoFV;
    this.soloLectura = this.tipoAccesoService.getSoloLectura(EOpcion.Actividad);
  }
  displayTitulo: string = '';

  intIdFactor: number = 0;
  public isLoadingResults = false;
  factorModel: FactorVerificacionModel;
  formFactor = this.formBuilder.group({
    codigoFV: [''],
    ponderacion: ['', Validators.required],
    nombre: ['', Validators.required],
    parte: ['', Validators.required],
  });

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit(): void {
    this.BuscarFactorVerificacion();
  }

  BuscarFactorVerificacion(): void {
    if (this.intIdFactor > 0) {
      this.displayTitulo = 'Modificar de Factor de Verificación';
      this.factorService
        .obtener(this.intIdFactor)
        .pipe(finalize(() => (this.isLoadingResults = false)))
        .subscribe((respuesta) => {
          this.factorModel = respuesta as FactorVerificacionModel;
          console.log(respuesta);
          this.EstablecerValorEnFormulario(
            'ponderacion',
            this.factorModel.intPonderacion
          );
          this.EstablecerValorEnFormulario(
            'nombre',
            this.factorModel.strNombre
          );
          this.EstablecerValorEnFormulario('parte', this.factorModel.strParte);
        });
    } else {
      this.displayTitulo = 'Registro de Factor de Verificación';
    }
  }

  EstablecerValorEnFormulario(nombreControl: string, valor: any) {
    this.formFactor.controls[nombreControl].setValue(valor);
  }

  Grabar(): void {
    if (this.tipoAccesoService.validarSoloLectura(this.soloLectura)) {
      this.factorModel = new FactorVerificacionModel();

      if (this.formFactor.valid) {
        let formfactor = this.formFactor.value;
        console.log(formfactor);
        //this.factorModel.intId= formfactor.codigoFV;
        this.factorModel.strNombre = formfactor.nombre;
        this.factorModel.intPonderacion = formfactor.ponderacion;
        this.factorModel.strParte = formfactor.parte;
        console.log(this.factorModel);

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
              console.log(this.intIdFactor);
              if (this.intIdFactor > 0) {
                this.factorModel.intId = formfactor.codigoFV;
                this.isLoadingResults = true;

                this.factorService
                  .actualizar(this.factorModel)
                  .pipe(finalize(() => (this.isLoadingResults = false)))
                  .subscribe((respuesta) => {
                    swal.fire('Ok', respuesta.mensaje, 'success');
                    this.dialogRef.close();
                    // this.router.navigateByUrl(`administracion/areas`);
                  });
              } else {
                this.factorModel.intEstado = 1;

                console.log(this.factorModel);
                this.isLoadingResults = true;
                this.factorService
                  .registrar(this.factorModel)
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
