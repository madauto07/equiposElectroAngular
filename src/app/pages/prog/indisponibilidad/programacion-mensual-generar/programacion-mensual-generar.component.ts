import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ProgramacionTecnicaMensualService } from 'src/app/core/_service/prog/programacion-tecnica-mensual.service';
import { ProgramacionTecnicaMensualModel } from 'src/app/core/_model/prog/programacion-tecnica-mensual-model';
import { finalize, map, startWith } from 'rxjs/operators';
import swal from 'sweetalert2';


@Component({
  selector: 'app-programacion-mensual-generar',
  templateUrl: './programacion-mensual-generar.component.html',
  styles: [
  ]
})
export class ProgramacionMensualGenerarComponent implements OnInit {

  
  strBuscarNombre = '';
  fechaVersion = '';
  public isLoadingResults = false;
  form: FormGroup;

  programacionTecnica : ProgramacionTecnicaMensualModel;


  constructor( 
    private router: Router,
    private formBuilder: FormBuilder,
     private programacionTecService: ProgramacionTecnicaMensualService) { 
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
      controlAnho: ['',Validators.required],
      controlMes: ['',Validators.required],
      fechaGeneracion: [''],
    });
  }


  // private BuscarEnServicio( ): void {
  //   const strbuscarNombre = this.strBuscarNombre;
  //   this.isLoadingResults = true;
  //   this.programacionTecnica = new ProgramacionTecnicaMensualModel();
  //   this.programacionTecnica.strNombre= strbuscarNombre;
  //   this.programacionTecService.generar(this.programacionTecnica)
  //     .pipe
  //     (
  //       finalize(() => this.isLoadingResults = false)
  //     )
  //     .subscribe(respuesta => 
  //     {
  //       console.log(respuesta);
       
  //     })
  // }

  generar(): void {
    this.programacionTecnica = new ProgramacionTecnicaMensualModel();

    if (this.form.valid) {
      const form = this.form.value;
    this.programacionTecnica.strNombre=form.titulo;
    this.programacionTecnica.intAnho=form.controlAnho;
    this.programacionTecnica.intMes=form.controlMes;
    this.programacionTecnica.dtFechaGeneracion=form.fechaGeneracion;

    swal
    .fire({
      title: 'Confirmación',
      text: '¿Está seguro de generar la programación mensual?.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#004f91',
      cancelButtonColor: '#7B7A83',
      confirmButtonText: 'Sí, Aceptar!',
      cancelButtonText: 'No, Cancelar!',
    })
    .then((result) => {
      if (result.value) {
      
          this.programacionTecnica.intId = 0;
          console.log(this.programacionTecnica);
          this.isLoadingResults = true;
          this.programacionTecService
            .generar(this.programacionTecnica)
            .pipe(finalize(() => (this.isLoadingResults = false)))
            .subscribe((respuesta) => {
              swal.fire('Ok', respuesta.mensaje, 'success');
              this.router.navigateByUrl(`prog/indisponibilidad/programacionmensual`);
            });
        
      }
    });

    }

  }

  getFontSize(): number {
    return 12;
  }

}
