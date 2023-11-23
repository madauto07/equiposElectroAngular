import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import swal, { SweetAlertOptions } from 'sweetalert2';
import { finalize, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';

@Component({
  selector: 'app-constante-mantenimiento',
  templateUrl: './constante-mantenimiento.component.html',
  styleUrls: ['./constante-mantenimiento.component.css'],
})
export class ConstanteMantenimientoComponent implements OnInit {

    public isLoadingResults = false;
    intIdTipoConstante = 0;
    intIdConstante = 0;
    ConstanteMoldel: ConstanteModel = new ConstanteModel();
    formPrincipal = this.formBuilder.group({
      strId: [''],
      strNombre: ['', Validators.required],
      strCodigo: ['', Validators.required],
      strValor: ['', Validators.required],
      strDescripcion: [''],
      bolEstado: [true],
    });

  constructor(
    private formBuilder: FormBuilder,
    private servicio: ConstanteService,
    private activateRoute: ActivatedRoute,
    private router: Router
  ) {
    this.intIdConstante = Number(
      this.activateRoute.snapshot.paramMap.get('idconstante')
    );
    this.intIdTipoConstante = Number(this.activateRoute.snapshot.paramMap.get('idtipo'));
  }

  ngOnInit(): void {
    this.isLoadingResults = false;
    this.EstablecerDatosExistente();
  }

  EstablecerDatosExistente(): void {
    if (this.intIdConstante > 0) {
      this.isLoadingResults = true;
      this.servicio
        .Obtener(this.intIdConstante)
        .pipe(finalize(() => (this.isLoadingResults = false)))
        .subscribe((respuesta) => {
          this.ConstanteMoldel = respuesta;
          this.EstablecerValorEnForm('strId', this.ConstanteMoldel.intId);
          this.EstablecerValorEnForm(
            'strNombre',
            this.ConstanteMoldel.strNombre
          );
          this.EstablecerValorEnForm(
            'strValor',
            this.ConstanteMoldel.strValor
          );
          this.EstablecerValorEnForm(
            'strDescripcion',
            this.ConstanteMoldel.strDescripcion
          );
          if (this.ConstanteMoldel.intEstado === 1) {
            this.EstablecerValorEnForm('bolEstado', true);
          } else {
            this.EstablecerValorEnForm('bolEstado', false);
          }
        });
    } else {
      this.EstablecerValorEnForm('strId', this.intIdConstante);
      this.EstablecerValorEnForm('bolEstado', true);
    }
  }

  EstablecerValorEnForm(nombreControl: string, valor: any): void {
    this.formPrincipal.get(nombreControl).setValue(valor);
  }

  getFontSize(): number {
    return 12;
  }

  Guardar(): void {
    if (this.formPrincipal.valid) {
      const formulario = this.formPrincipal.value;
      this.ConstanteMoldel.intIdTipoConstante = this.intIdTipoConstante;
      this.ConstanteMoldel.intId = this.intIdConstante;
      this.ConstanteMoldel.strNombre = formulario.strNombre;
      this.ConstanteMoldel.strCodigo = formulario.strCodigo;
      this.ConstanteMoldel.strValor = formulario.strValor;
      this.ConstanteMoldel.strDescripcion = formulario.strDescripcion;
      if (formulario.bolEstado) {
        this.ConstanteMoldel.intEstado = 1;
      } else {
        this.ConstanteMoldel.intEstado = 0;
      }

      swal
        .fire({
          title: 'Confirmación',
          text: '¿Está seguro de guardar los cambios de Constante?.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#004f91',
          cancelButtonColor: '#7B7A83',
          confirmButtonText: 'Sí, Aceptar!',
          cancelButtonText: 'No, Cancelar!',
        })
        .then((result) => {
          if (result.value) {
            if (this.intIdConstante > 0) {
              this.ConstanteMoldel.intId = formulario.strId;
              this.isLoadingResults = true;

              this.servicio
                .Actualizar(this.ConstanteMoldel)
                .pipe(finalize(() => (this.isLoadingResults = false)))
                .subscribe((respuesta) => {
                  swal.fire('Ok', respuesta.mensaje, 'success');
                  this.router.navigateByUrl(
                    `administracion/constantes/${this.intIdTipoConstante}`
                  );
                });
            } else {
              this.isLoadingResults = true;
              this.servicio
                .Registrar(this.ConstanteMoldel)
                .pipe(finalize(() => (this.isLoadingResults = false)))
                .subscribe((respuesta) => {
                  swal.fire('Ok', respuesta.mensaje, 'success');
                  this.router.navigateByUrl(
                    `administracion/constantes/${this.intIdTipoConstante}`
                  );
                });
            }
          }
        });
    }
  }

  Cancelar(): void {
    swal
      .fire({
        title: 'Confirmación',
        text: '¿Está seguro de salir? Los datos de constante no se guardarán.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Sí, Aceptar!',
        cancelButtonText: 'No, Cancelar!',
      })
      .then((result) => {
        if (result.value) {
          this.router.navigateByUrl(
            `administracion/constantes/${this.intIdTipoConstante}`
          );
        }
      });
  }
}
