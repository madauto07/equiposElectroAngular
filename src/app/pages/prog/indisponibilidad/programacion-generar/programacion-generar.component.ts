import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramacionTecnicaService } from 'src/app/core/_service/prog/programacion-tecnica.service';
import { ProgramacionTecnicaModel } from 'src/app/core/_model/prog/programacion-tecnica-model';

import { ProgramacionTecnicaMensualService } from 'src/app/core/_service/prog/programacion-tecnica-mensual.service';
import { ProgramacionTecnicaMensualModel } from 'src/app/core/_model/prog/programacion-tecnica-mensual-model';

import { ProgramacionTecnicaSemanalService } from 'src/app/core/_service/prog/programacion-tecnica-semanal.service';
import { ProgramacionTecnicaSemanalModel } from 'src/app/core/_model/prog/programacion-tecnica-semanal-model';

import { finalize, map, startWith } from 'rxjs/operators';
import swal from 'sweetalert2';


@Component({
  selector: 'app-programacion-generar',
  templateUrl: './programacion-generar.component.html',
  styles: [
  ]
})
export class ProgramacionGenerarComponent implements OnInit {

  strTitulo ='';
  idOpcion = 0;
  
  strBuscarNombreMensual = '';
  strBuscarNombreSemana='';
  strBuscarNombreAnho = '';
  //fechaVersion = '';
  public isLoadingResults = false;
  formAnho:FormGroup;
  formMes: FormGroup;
  formSemana:FormGroup;
  isActivateMes = false;
  isActivateSemana = false;
  isActivateAnho = false;
  programacionTecAnual : ProgramacionTecnicaModel;
  programacionTecMensual : ProgramacionTecnicaMensualModel;
  programacionTecSemanal : ProgramacionTecnicaSemanalModel;

  constructor( 
    private router: Router,
    private activateRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private programacionTecnicaAnualService: ProgramacionTecnicaService,
     private programacionTecnicaMesService: ProgramacionTecnicaMensualService,
    private programacionTecnicaSemanalService : ProgramacionTecnicaSemanalService
    ) { 
    this.construirFormularioAnual();
    this.construirFormularioMes();
    this.construirFormularioSemana();
    this.obtenerIdUrl();
  }

  ngOnInit(): void {
    this.strTitulo="";
    console.log(this.idOpcion);
    if(this.idOpcion==1){
      this.strTitulo="Anual";
      this.isActivateAnho=true;
    }
   

    if(this.idOpcion==2){
      this.strTitulo="Mensual";
    this.isActivateMes=true;
    }
    

    if(this.idOpcion == 3){
      this.strTitulo="Semanal";
      this.isActivateSemana=true;
    }
   

  }

  obtenerIdUrl(): void {
    this.idOpcion = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  buscar(): void {
   // this.BuscarEnServicio(0, this.numeroFilas);
  }

  limpiar(): void {
    this.strBuscarNombreMensual = '';
    this.strBuscarNombreAnho = '';
    this.strBuscarNombreSemana = '';
   
   
  
    
    if(this.idOpcion==1){
      document.getElementById('filtroNombreAnho').focus();
    }
    if(this.idOpcion==2){
      document.getElementById('filtroNombreMes').focus();
    }
    if(this.idOpcion==3){
      document.getElementById('filtroNombreSemana').focus();
    }

    

  }

  construirFormularioAnual(): void {
    this.formAnho = this.formBuilder.group({
      tituloAnho: ['',Validators.required],
      fechaInicio: ['',Validators.required],
      fechaFin: ['',Validators.required],
      fechaGeneracion: ['',Validators.required],
    });
  }


  construirFormularioMes(): void {
    this.formMes = this.formBuilder.group({
      tituloMes: ['',Validators.required],
      controlAnhoMes: ['',Validators.required],
      controlMes: ['',Validators.required],
      fechaGeneracionMes: [''],
    });
  }

  construirFormularioSemana(): void {
    this.formSemana = this.formBuilder.group({
      tituloSemana: ['',Validators.required],
      controlAnhoSemana: ['',Validators.required],
      controlSemana: ['',Validators.required],
      fechaGeneracionSemana: [''],
    });
  }

  
  generarAnual(): void {
    this.programacionTecAnual = new ProgramacionTecnicaModel();

    if (this.formAnho.valid) {
      const form = this.formAnho.value;
    this.programacionTecAnual.strNombre=form.titulo;
    this.programacionTecAnual.dtFechaInicio=form.fechaInicio;
    this.programacionTecAnual.dtFechaFin=form.fechaFin;
    this.programacionTecAnual.dtFechaGeneracion=form.fechaGeneracion;

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
      
          this.programacionTecAnual.intId = 0;
          this.isLoadingResults = true;
          this.programacionTecnicaAnualService
            .generar(this.programacionTecAnual)
            .pipe(finalize(() => (this.isLoadingResults = false)))
            .subscribe((respuesta) => {
              swal.fire('Ok', respuesta.mensaje, 'success');
              this.router.navigateByUrl(`prog/indisponibilidad/programacionanual`);
            });
     
      }
    });

    }

  }

 

  generarMensual(): void {
    this.programacionTecMensual = new ProgramacionTecnicaMensualModel();

    if (this.formMes.valid) {
      const form = this.formMes.value;
    this.programacionTecMensual.strNombre=form.tituloMes;
    this.programacionTecMensual.intAnho=form.controlAnho;
    this.programacionTecMensual.intMes=form.controlMes;
    this.programacionTecMensual.dtFechaGeneracion=form.fechaGeneracionMes;

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
      
          this.programacionTecMensual.intId = 0;
          console.log(this.programacionTecMensual);
          this.isLoadingResults = true;
          this.programacionTecnicaMesService
            .generar(this.programacionTecMensual)
            .pipe(finalize(() => (this.isLoadingResults = false)))
            .subscribe((respuesta) => {
              swal.fire('Ok', respuesta.mensaje, 'success');
              this.router.navigateByUrl(`prog/indisponibilidad/programacionmensual`);
            });
      }
    });
    }
  }

  generarSemana(): void {
    this.programacionTecSemanal = new ProgramacionTecnicaSemanalModel();

    if (this.formSemana.valid) {
      const form = this.formSemana.value;
    this.programacionTecSemanal.strNombre=form.tituloSemana;
    this.programacionTecSemanal.intAnho=form.controlAnhoSemana;
    this.programacionTecSemanal.intSemana=form.controlSemana;
    this.programacionTecSemanal.dtFechaGeneracion=form.fechaGeneracionSemana;
console.log(form);
    swal
    .fire({
      title: 'Confirmación',
      text: '¿Está seguro de generar la programación Semanal?.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#004f91',
      cancelButtonColor: '#7B7A83',
      confirmButtonText: 'Sí, Aceptar!',
      cancelButtonText: 'No, Cancelar!',
    })
    .then((result) => {
      if (result.value) {
      
          this.programacionTecSemanal.intId = 0;
          console.log(this.programacionTecSemanal);
          this.isLoadingResults = true;
          this.programacionTecnicaSemanalService
            .generar(this.programacionTecSemanal)
            .pipe(finalize(() => (this.isLoadingResults = false)))
            .subscribe((respuesta) => {
              swal.fire('Ok', respuesta.mensaje, 'success');
              this.router.navigateByUrl(`prog/indisponibilidad/programacionsemanal`);
            });
      }
    });
    }
  }


  getFontSize(): number {
    return 12;
  }

}
