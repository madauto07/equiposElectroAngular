import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SubconstanteModel } from 'src/app/core/_model/administracion/sub-constante-model';
import { SubconstanteService } from 'src/app/core/_service/administracion/subconstante.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
@Component({
  selector: 'app-subconstante-mantenimiento',
  templateUrl: './subconstante-mantenimiento.component.html',
  styleUrls: ['./subconstante-mantenimiento.component.scss'],
})
export class SubconstanteMantenimientoComponent implements OnInit, OnChanges {
  @Input() idConstante: number;
  @Input() idSubConstante: number;
  @Output() cerrar: EventEmitter<boolean> = new EventEmitter();
  @Output() listarSubConstante: EventEmitter<boolean> = new EventEmitter();
  form: FormGroup;
  subconstante: SubconstanteModel;
  constructor(
    private formBuilder: FormBuilder,
    private subconstanteService: SubconstanteService,
    private router: Router
  ) {
    this.construirFormulario();
  }

  ngOnInit(): void {
    this.establecerDatosExistentes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.establecerDatosExistentes();
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      valor: [''],
      descripcion: [''],
      estado: [true],
    });
  }

  establecerDatosExistentes(): void {
    console.log(this.idSubConstante);
    if (this.idSubConstante > 0) {
      this.subconstanteService
        .Obtener(this.idSubConstante)
        .subscribe((result: SubconstanteModel) => {
          this.subconstante = result;
          this.form.get('nombre').setValue(this.subconstante.strNombre);
          this.form.get('valor').setValue(this.subconstante.strValor);
          this.form
            .get('descripcion')
            .setValue(this.subconstante.strDescripcion);
        });
    } else {
      this.limpiarForm();
      this.subconstante = new SubconstanteModel();
    }
  }

  limpiarForm(): void{
    this.form.reset();
    this.form.get('estado').setValue(true);
    document.getElementById('controlNombre').focus();
  }

  guardarSubconstante(event: Event): void {
    event.preventDefault();
    if (this.form.valid) {
      console.log(this.idConstante);
      this.subconstante.intIdConstante = this.idConstante;
      this.subconstante.strNombre = this.form.value.nombre;
      this.subconstante.strValor = this.form.value.valor;
      this.subconstante.strDescripcion = this.form.value.descripcion;
      if (this.form.value.estado) {
        this.subconstante.intEstado = 1;
      } else {
        this.subconstante.intEstado = 0;
      }
      swal
        .fire({
          title: 'Confirmación',
          text: '¿Está seguro de guardar los cambios de la subconstante?.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#004f91',
          cancelButtonColor: '#7B7A83',
          confirmButtonText: 'Sí, Aceptar!',
          cancelButtonText: 'No, Cancelar!',
        })
        .then((result) => {
          if (result.value) {
            if (this.idSubConstante > 0) {
              this.subconstante.intId = this.idSubConstante;
              this.subconstanteService
                .Actualizar(this.subconstante)
                .subscribe((respuesta) => {
                  swal.fire('Ok', respuesta.mensaje, 'success');
                  this.limpiarForm();
                  this.idSubConstante = 0;
                  this.listarSubConstante.emit(true);
                });
            } else {
              this.subconstanteService
                .Registrar(this.subconstante)
                .subscribe((respuesta) => {
                  swal.fire('Ok', respuesta.mensaje, 'success');
                  this.limpiarForm();
                  this.idSubConstante = 0;
                  this.listarSubConstante.emit(true);
                });
            }
          }
        });
    }
  }

  limpiarControles(): void {
    this.form.get('nombre').setValue('');
    this.form.get('valor').setValue('');
    this.form.get('descripcion').setValue('');
  }

  ocultarComponente(): void {
    this.cerrar.emit(false);
  }
}
