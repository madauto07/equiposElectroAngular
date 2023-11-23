import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramacionTecnicaService } from 'src/app/core/_service/prog/programacion-tecnica.service';
import { ProgramacionTecnicaModel } from 'src/app/core/_model/prog/programacion-tecnica-model';
import { finalize, map, startWith } from 'rxjs/operators';
import swal from 'sweetalert2';

@Component({
  selector: 'app-programacion-anual-generar',
  templateUrl: './programacion-anual-generar.component.html',
  styles: [
  ]
})
export class ProgramacionAnualGenerarComponent implements OnInit {

  strBuscarNombre = '';
  fechaVersion = '';
  public isLoadingResults = false;
  form: FormGroup;

  programacionTecnica : ProgramacionTecnicaModel;


  constructor( 
    private router: Router,
    private formBuilder: FormBuilder,
     private programacionTecService: ProgramacionTecnicaService) { 
    this.construirFormulario();
  }

  ngOnInit(): void {
  }

  buscar(): void {
   // this.BuscarEnServicio(0, this.numeroFilas);
  }

  limpiar(): void {
    this.strBuscarNombre = '';
    document.getElementById('filtroNombre').focus();
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      titulo: ['',Validators.required],
      fechaInicio: ['',Validators.required],
      fechaFin: ['',Validators.required],
      fechaGeneracion: ['',Validators.required],
    });
  }


  private BuscarEnServicio( ): void {
    const strbuscarNombre = this.strBuscarNombre;
    this.isLoadingResults = true;
    this.programacionTecnica = new ProgramacionTecnicaModel();
    this.programacionTecnica.strNombre= strbuscarNombre;
    this.programacionTecService.generar(this.programacionTecnica)
      .pipe
      (
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe(respuesta => 
      {
        console.log(respuesta);
       
      })
  }

  generar(): void {
    this.programacionTecnica = new ProgramacionTecnicaModel();

    if (this.form.valid) {
      const form = this.form.value;
    this.programacionTecnica.strNombre=form.titulo;
    this.programacionTecnica.dtFechaInicio=form.fechaInicio;
    this.programacionTecnica.dtFechaFin=form.fechaFin;
    this.programacionTecnica.dtFechaGeneracion=form.fechaGeneracion;

    swal
    .fire({
      title: 'Confirmación',
      text: '¿Está seguro de generar la programación anual?.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#004f91',
      cancelButtonColor: '#7B7A83',
      confirmButtonText: 'Sí, Aceptar!',
      cancelButtonText: 'No, Cancelar!',
    })
    .then((result) => {
      if (result.value) {
          console.log(this.programacionTecnica);
          this.programacionTecnica.intId = 0;
          this.isLoadingResults = true;
          this.programacionTecService
            .generar(this.programacionTecnica)
            .pipe(finalize(() => (this.isLoadingResults = false)))
            .subscribe((respuesta) => {
              swal.fire('Ok', respuesta.mensaje, 'success');
              this.router.navigateByUrl(`prog/indisponibilidad/programacionanual`);
            });
        
      }
    });

    }

  }

  getFontSize(): number {
    return 12;
  }


}
