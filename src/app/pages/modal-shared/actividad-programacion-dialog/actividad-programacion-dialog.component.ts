import {   Component,Inject,OnInit, ViewChild, Input,EventEmitter,Output,OnChanges,SimpleChanges } from '@angular/core';
//import { DatePipe } from '@angular/common';
import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import swal,{ SweetAlertOptions }  from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FactorVerificacionModel } from 'src/app/core/_model/info/factor-verificacion-model';
import { ModoVerificacionModel } from 'src/app/core/_model/info/modo-verificacion-model';
import { FactorVerificacionService } from 'src/app/core/_service/info/factor-verificacion.service';
import { ProgramacionService } from 'src/app/core/_service/info/programacion-service';
import { ActividadEquipoModel } from 'src/app/core/_model/info/actividad-equipo-model';
import { ProgramacionModel } from 'src/app/core/_model/info/programacion-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import {ActividadEquipoService} from 'src/app/core/_service/info/actividad-equipo.service';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';

import { EquipoModel } from 'src/app/core/_model/info/equipo-model';

@Component({
  selector: 'app-actividad-programacion-dialog',
  templateUrl: './actividad-programacion-dialog.component.html',
  styleUrls: ['./actividad-programacion-dialog.component.css']

})
export class ActividadProgramacionDialogComponent implements OnInit {
  
  
  displayTitulo  : string ='Programación';
  intIdActividad: number = 0;
  intIdEquipo : number = 0;
  idProgramacion : number = 0;

  intDatoActivoId : number
  strDatoActivoTipo : string ="";
  strDatoActivoKKS: string ="";
  strDatoActivoDescripcion : string ="";
  strDatoActivoNserie : string ="";
  strDatoActivoMarca : string ="";
  strDatoActivoModelo: string ="";
  numeroFilas: number=10;
  displayedColumns = ['id', 'tipo', 'frecuencia','inicio','fin','motivo', 'accion'];
  dataSource = new MatTableDataSource<any>();
  form: FormGroup;
  actividadEquipo : ActividadEquipoModel;
  programacionModel: ProgramacionModel;
  programacion: ProgramacionModel;
  listaprogramacion : ProgramacionModel[]=[];
  idModuloSeleccionado = 0;
  programacion_temp : ProgramacionModel;
   //listaProgramacion_temp : ProgramacionModel[]=[];
   @Output() cerrar: EventEmitter<boolean> = new EventEmitter();
   actividadEquipoModel : ActividadEquipoModel;
   listaActividadEquipoModel : ActividadEquipoModel[]=[];

  listaconstante : ConstanteModel[];
  constante : ConstanteModel;
  isLoading = false;
  isDisable = true;
//  hiddenTipo : string='';
  textSelectedTipoFrecuencia = '';
  idItem : number=0;
  isLoadingResults: false;
  cantidadRegistros = 0;
 
  // controlCondicionSistema : true;
  // controlCondicionEquipo : true;


  constructor(
    
    private formBuilder: FormBuilder,
    private programacionService : ProgramacionService ,
    private constanteService : ConstanteService,
    private actividadEquipoService : ActividadEquipoService,
    public dialogRef: MatDialogRef<ActividadEquipoModel>,
    //public datepipe : DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any) {

      this.intIdActividad = data.idactividad;
      this.intIdEquipo = data.idequipo;
      this.construirFormulario();
     }
    

  ngOnInit(): void {
    
    console.log(this.intIdActividad);
    console.log(this.intIdEquipo);

    this.inicializar();
    this.obtenerListaTipoFrecuencia();
    this.obtenerDatosActividadEquipo();
    this.obtenerListaDatosProgramacion(0, this.numeroFilas);
   // this.dataSource.data = this.listaProgramacion_temp;
  }

  
  ngOnChanges(changes: SimpleChanges): void {
   // this.establecerDatosExistentes();
  }

  construirFormulario(): void {
    this.form = this.formBuilder.group({
      controlCodigo :[''],
      controlFechaInic : ['',Validators.required],
      controlFechaFin : ['',Validators.required],
      controlFrecuencia: ['',Validators.required],
      controlMotivo: [''],
      tipoFrecuenciaSelect: [0,Validators.required],
      controlTipoFrecuencia: [''],

      controlCondicionSistema : [''],
      controlCondicionEquipo : [''],
    });
    
  }
  inicializar(): void {
    this.limpiarForm();
    this.displayTitulo='Programación';
    this.programacionModel =new ProgramacionModel();
   
  }
  limpiarForm(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
    this.form.get('tipoFrecuenciaSelect').setErrors(null);
    this.idItem = 0;
    this.idProgramacion=0;
  // this.limpiarLista();
  }
  limpiarLista() {
   
    this.idItem = 0;
     this.dataSource = new MatTableDataSource<ProgramacionModel>();
     this.listaActividadEquipoModel=[];
     this.listaprogramacion=[];
    // this.listaProgramacion_temp=[];
}

obtenerListaTipoFrecuencia(): void {
    
  this.isLoading = true;
  this.constante = new ConstanteModel();
  this.constante.intId = 0;
  this.constante.strNombre = 'Ninguno';
  this.constanteService
    .listarControlId(TipoConstanteEnum.TipoFrecuencia)
    .pipe(
      finalize(() => {
        this.isLoading = false;
      })
    )
    .subscribe((rpta) => {
      this.listaconstante =  rpta.Items;
      this.listaconstante.splice(0, 0, this.constante);
       this.form.get('tipoFrecuenciaSelect').setValue(0);
     // this.setObservableCambioSelectModulo();
    });
}

agregarProgramacion(event: Event):void
{

}
NuevoProgramacion(): void
{
this.limpiarForm();
  
}

limpiarForm2(): void {
  this.form.reset();
  this.form.markAsUntouched();
  this.form.markAsPristine();
}

Elminar(item: ProgramacionModel)
{

  swal.fire
  ({
      title: 'Confirmación',
      text: `¿Está seguro de eliminar ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#004f91',
      cancelButtonColor: '#7B7A83',
      confirmButtonText: 'Sí, Aceptar!',
      cancelButtonText: 'No, Cancelar!'
  }).then((result) => 
  {
    if (result.value) 
    {
      //this.isLoadingResults = true;
      this.programacionService.eliminar(item.intId)
        .pipe(
          finalize(() => this.isLoadingResults = false)
        )
        .subscribe(respuesta => 
        {
          swal.fire('Ok', respuesta.mensaje, 'success')
         // swal.fire('Ok', respuesta.toString(), 'success')
          this.obtenerListaDatosProgramacion(0,this.numeroFilas);
        })
        
    }
  })  

}

editar(item : ProgramacionModel)
{
  console.log(item);

  this.programacionModel= item;

  this.idProgramacion = this.programacionModel.intId;
  
  this.form.get('controlCodigo').setValue(this.programacionModel.intId);
  this.form.get('controlFechaInic').setValue(this.programacionModel.dtFechaInicio);
  this.form.get('controlFechaFin').setValue(this.programacionModel.dtFechaFin);
  this.form.get('controlFrecuencia').setValue(this.programacionModel.intFrecuencia);
  this.form.get('controlMotivo').setValue(this.programacionModel.strMotivo);
  this.form.get('tipoFrecuenciaSelect').setValue(this.programacionModel.intIdTipo);

}

  ocultarComponente(): void {
//    this.cerrar.emit(false);
    this.dialogRef.close();

  }



  selectedValueTipo(event: any): void {
    //console.log(event.source.triggerValue);
    this.textSelectedTipoFrecuencia = event.source.triggerValue;
  }

  obtenerDatosProgramacion(): void {
  
    if (this.idProgramacion > 0) {
       this.programacionService
         .obtener(this.idProgramacion)
         .subscribe((result: ProgramacionModel) => {
           this.programacionModel = result;
           this.form.get('controlFechaInic').setValue(this.programacionModel.dtFechaInicio);
           this.form.get('controlFechaFin').setValue(this.programacionModel.dtFechaFin);
           this.form.get('controlFrecuencia').setValue(this.programacionModel.intFrecuencia);
           this.form.get('controlMotivo').setValue(this.programacionModel.strMotivo);
           this.form.get('tipoFrecuenciaSelect').setValue(this.programacionModel.intIdTipo);
         });
     } else {
       this.limpiarForm();
       this.programacionModel = new ProgramacionModel();
     }
   }

   obtenerListaDatosProgramacion(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
  
   // if (this.intIdActividad > 0) {
       this.programacionService
         .listarPageable(indicePagina,numeroFilasABuscar,0,this.intIdActividad,this.intIdEquipo)
         .pipe(finalize(() => (this.isLoadingResults = false)))
         .subscribe((response) => {
          this.cantidadRegistros = response.Total;
          this.dataSource.data = response.Items;
          console.log('programaciones');
          console.log(response.Items);
           
         });
    //  } else {
    //    this.limpiarForm();
    //    this.programacionModel = new ProgramacionModel();
    //  }
   }

obtenerDatosActividadEquipo(): void {
  this.actividadEquipo = new ActividadEquipoModel();

     if (this.intIdActividad > 0) {
       this.actividadEquipoService
         .obtener(this.intIdActividad, this.intIdEquipo)
         .subscribe((result: ActividadEquipoModel) => {
           this.actividadEquipo = result;
           console.log(result);
          this.intDatoActivoId = this.actividadEquipo.objEquipo.intId;
          this.strDatoActivoTipo = this.actividadEquipo.objConstante.strValor;
          this.strDatoActivoKKS = this.actividadEquipo.objEquipo.strCodigoKKS;
          this.strDatoActivoDescripcion = this.actividadEquipo.objEquipo.strNombre;
          this.strDatoActivoNserie= this.actividadEquipo.objEquipo.strNumeroSerie;
          this.strDatoActivoMarca = this.actividadEquipo.objEquipo.strModelo;
          this.strDatoActivoModelo= this.actividadEquipo.objEquipo.strModelo;
          // this.form.get('controlCondicionSistema').setValue( this.actividadEquipo.intIndSistema);
          // this.form.get('controlCondicionEquipo').setValue(this.actividadEquipo.intIndEquipo);

          let boolestadoIndSistema = this.actividadEquipo.intIndSistema;
          let boolestadoIndEquipo = this.actividadEquipo.intIndSistema;
          if(boolestadoIndSistema === 1 )
          {
            this.EstablecerValorEnFormActividadEquipo("controlCondicionSistema",true)
          }else
          {
            this.EstablecerValorEnFormActividadEquipo("controlCondicionSistema",false)
          }
        
          if(boolestadoIndEquipo === 1 )
          {
            this.EstablecerValorEnFormActividadEquipo("controlCondicionEquipo",true)
          }else
          {
            this.EstablecerValorEnFormActividadEquipo("controlCondicionEquipo",false)
          }
              
         });
     } else {
       this.limpiarForm();
       this.actividadEquipo = new ActividadEquipoModel();
     }
   }

   EstablecerValorEnFormActividadEquipo(nombreControl: string, valor : any)
   {
     this.form.controls[nombreControl].setValue(valor);
    
   }
 

   ActualizarEstados():void{

    console.log(this.form.value);
  let formAct = this.form.value;
this.actividadEquipoModel = new ActividadEquipoModel();
this.actividadEquipoModel.intIdActividad= this.intIdActividad;
this.actividadEquipoModel.intIdEquipo=this.intIdEquipo;

let valorEstadointIdEquipo = formAct.controlCondicionEquipo;
      if(valorEstadointIdEquipo)
      {this.actividadEquipoModel.intIndEquipo = 1;}
      else{this.actividadEquipoModel.intIndEquipo = 0;}

      let valorEstadointIndSistema = formAct.controlCondicionSistema;
      if(valorEstadointIndSistema)
      {this.actividadEquipoModel.intIndSistema = 1;}
      else{this.actividadEquipoModel.intIndSistema = 0;}




    swal.fire
  ({
      title: 'Confirmación',
      text: `¿Está seguro de Actualizar las condiciones?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#004f91',
      cancelButtonColor: '#7B7A83',
      confirmButtonText: 'Sí, Aceptar!',
      cancelButtonText: 'No, Cancelar!'
  }).then((result) => 
  {
    if (result.value) 
    {
      //this.isLoadingResults = true;
      this.actividadEquipoService.actualizar(this.actividadEquipoModel)
        .pipe(
          finalize(() => this.isLoadingResults = false)
        )
        .subscribe(respuesta => 
        {
          swal.fire('Ok', respuesta.mensaje, 'success')
         // swal.fire('Ok', respuesta.toString(), 'success')
       //   this.obtenerListaDatosProgramacion(0,this.numeroFilas);
        })
        
    }
  })  


   }

   Grabar():void
   {
     this.programacionModel = new ProgramacionModel();
     if(this.form.valid)
   {
     let formProgramacion = this.form.value;
     console.log(formProgramacion);
     //this.factorModel.intId= formfactor.codigoFV;
     this.programacionModel.intIdActividad = this.intIdActividad;
     this.programacionModel.intIdEquipo = this.intIdEquipo;
     this.programacionModel.strMotivo = formProgramacion.controlMotivo;
     this.programacionModel.intFrecuencia = formProgramacion.controlFrecuencia;
     this.programacionModel.intIdTipo = formProgramacion.tipoFrecuenciaSelect;
    
     this.programacionModel.dtFechaInicio = formProgramacion.controlFechaInic;
     this.programacionModel.dtFechaFin = formProgramacion.controlFechaFin;



     //this.isLoadingResults = true;
     //console.log(this.modoModel);

     swal.fire
     ({
       title: 'Confirmación',
       text: "¿Está seguro de guardar los cambios?.",
       icon: 'question',
       showCancelButton: true,
       confirmButtonColor: '#004f91',
       cancelButtonColor: '#7B7A83',
       confirmButtonText: 'Sí, Aceptar!',
       cancelButtonText: 'No, Cancelar!'
     }).then((result) => 
     {
       if (result.value) 
       {
       //  console.log(this.intIdModo);
         if(this.idProgramacion > 0)
         {
           this.programacionModel.intId = formProgramacion.controlCodigo;
           //this.isLoadingResults = true;

           this.programacionService.actualizar(this.programacionModel)
             .pipe
             (
               finalize(() => this.isLoadingResults = false)
             )
             .subscribe(respuesta => 
             {
               swal.fire('Ok',respuesta.mensaje,'success')
              // this.dialogRef.close();
              // this.router.navigateByUrl(`administracion/areas`);
              this.obtenerListaDatosProgramacion(0, this.numeroFilas);
             })

         } 
         else{
           this.programacionModel.intEstado = 1;
          
           //console.log(this.modoModel);
          // this.isLoadingResults = true;
           this.programacionService.registrar(this.programacionModel)
             .pipe
             (
               finalize(() => this.isLoadingResults = false)
             )
             .subscribe(respuesta => 
             {
               swal.fire('Ok',respuesta.toString(),'success')
               //this.dialogRef.close();
               this.obtenerListaDatosProgramacion(0, this.numeroFilas);
               //swal.fire('Ok',respuesta.mensaje,'success')
              // this.router.navigateByUrl(`administracion/areas`);
             })
           }
       }
     });
   }
   }



   GrabarProgramacion(programacion : ProgramacionModel)
   {
     
       this.programacionService.registrar(programacion)
       .pipe
       (
         finalize(() => this.isLoadingResults = false)
       )
       .subscribe(respuesta => 
       {
         console.log(respuesta);
        // this.BuscarTrabajadoresAsignados(0,this.numeroFilas);
       })
     
 
 
   }

}
