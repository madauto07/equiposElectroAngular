import {   Component,OnInit, ViewChild, Input,EventEmitter,Output,OnChanges,SimpleChanges, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';
import { DatoModel } from 'src/app/core/_model/info/dato-model';
import { ProgramacionService } from 'src/app/core/_service/info/programacion-service';
import { ActividadEquipoModel } from 'src/app/core/_model/info/actividad-equipo-model';
import { ProgramacionModel } from 'src/app/core/_model/info/programacion-model';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import {ActividadEquipoService} from 'src/app/core/_service/info/actividad-equipo.service';

import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { EquipoModel } from 'src/app/core/_model/info/equipo-model';

@Component({
  selector: 'app-actividad-mantenimiento-programacion',
  templateUrl: './actividad-mantenimiento-programacion.component.html',
  styleUrls: ['./actividad-mantenimiento-programacion.component.scss'],
})
export class ActividadMantenimientoProgramacionComponent implements OnInit,OnChanges {

  @ViewChild(MatPaginator, { static: true }) paginator?: MatPaginator;
 
   @Input() idActividad: number;
  // @Input() listarAsignados: ActividadEquipoModel[];
   @Input() equiposSeleccionados: EquipoModel[];
  @Output() cerrar: EventEmitter<boolean> = new EventEmitter();
  @Output() listarEquiposAsignados: EventEmitter<boolean> = new EventEmitter();
  idProgramacion = 0;

  displayedColumns = ['id', 'tipo', 'frecuencia','inicio','fin','motivo', 'accion'];
  dataSource = new MatTableDataSource<any>();
  form: FormGroup;
  programacionModel: ProgramacionModel;
  programacion: ProgramacionModel;
  listaprogramacion : ProgramacionModel[]=[];
  idModuloSeleccionado = 0;
  programacion_temp : ProgramacionModel;
   listaProgramacion_temp : ProgramacionModel[]=[];

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

  constructor(
    private formBuilder: FormBuilder,
    private programacionService : ProgramacionService ,
    private constanteService : ConstanteService,
    private actividadEquipoService : ActividadEquipoService
  
  ) {this.construirFormulario(); }

  ngOnInit(): void {
    this.inicializar();

    this.obtenerListaTipoFrecuencia();

    this.dataSource.data = this.listaProgramacion_temp;

    //this.establecerDatosExistentes();
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
      controlTipoFrecuencia: ['']
     // controlEstado : [true],
      
      //estado : [true]
    });
    
  }

 
 
  inicializar(): void {
    this.limpiarForm();
    this.programacionModel =new ProgramacionModel();
   
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
        //console.log('lista tipo frecuencia');
      //  console.log(rpta);
       // console.log(this.idPrefijoLst);
        this.form.get('tipoFrecuenciaSelect').setValue(0);
       // this.setObservableCambioSelectModulo();
      });
  }
  agregarProgramacion(event: Event):void
  {

    let dataSourceProgramacion = new MatTableDataSource<ProgramacionModel>();
    if (this.form.valid) 
    {
       this.idItem ++;
       this.programacion_temp= new ProgramacionModel();
       this.programacion_temp.intId=this.idItem;
       this.programacion_temp.intIdTipo=this.form.value.tipoFrecuenciaSelect;
       this.programacion_temp.dtFechaInicio = this.form.value.controlFechaInic;
       this.programacion_temp.dtFechaFin = this.form.value.controlFechaFin;
       this.programacion_temp.strMotivo = this.form.value.controlMotivo;
       this.programacion_temp.intFrecuencia = this.form.value.controlFrecuencia;
       this.programacion_temp.strNombreTipo= this.textSelectedTipoFrecuencia;
       this.listaProgramacion_temp.push( this.programacion_temp);
       this.dataSource.data= this.listaProgramacion_temp;

    }
  
  }

  guardarProgramacion(event: Event): void {

    console.log(event);

    let estado = true;

    if( this.equiposSeleccionados.length > 0)
    {
      this.actividadEquipoModel =new ActividadEquipoModel();
      this.programacionModel = new ProgramacionModel();
      //this.listaProgramacion = new ProgramacionModel[];
      for(let equipo of this.equiposSeleccionados)
      {
        this.actividadEquipoModel =new ActividadEquipoModel();
        this.actividadEquipoModel.intIdActividad=this.idActividad;
        this.actividadEquipoModel.intIdEquipo = equipo.intId;
        this.actividadEquipoModel.intIndEquipo= 1;
        this.actividadEquipoModel.intIndSistema=1;
        this.listaActividadEquipoModel.push(this.actividadEquipoModel);

        if(this.listaProgramacion_temp.length > 0){
          estado=true;
          this.programacionModel=new ProgramacionModel();
            for(let programacion of this.listaProgramacion_temp){
              this.programacionModel=new ProgramacionModel();

              this.programacionModel.intId=0;
              this.programacionModel.intIdActividad=this.idActividad;
              this.programacionModel.intIdEquipo=equipo.intId;
              this.programacionModel.intIdTipo=programacion.intIdTipo;
              this.programacionModel.intFrecuencia=programacion.intFrecuencia;
              this.programacionModel.dtFechaInicio=programacion.dtFechaInicio;
              this.programacionModel.dtFechaFin=programacion.dtFechaFin;
              this.programacionModel.strMotivo=programacion.strMotivo;
              this.programacionModel.intEstado=1;
              this.listaprogramacion.push(this.programacionModel);

              }

         }else{
          estado=false; 
          return;}


      }
    }else{ estado=false; return;}

//console.log(this.listaActividadEquipoModel);
    if(estado)
    {
      event.preventDefault();
      if (this.form.valid) {
        swal
        .fire({
          title: 'Confirmación',
          text: '¿Está seguro de guardar las programaciones?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#004f91',
          cancelButtonColor: '#7B7A83',
          confirmButtonText: 'Sí, Aceptar!',
          cancelButtonText: 'No, Cancelar!',
        })
        .then((result) => {
          if (result.value) {
            if(this.idActividad > 0)
           {
            this.GrabarActividadEquipo(this.listaActividadEquipoModel);
            this.GrabarProgramacion(this.listaprogramacion);
            this.listarEquiposAsignados.emit(true);
            this.limpiarForm();
           }
          
          }
        });
    
      }

      

    }
    

  
  }

  GrabarActividadEquipo(listaactividadEquipo : ActividadEquipoModel[]){

    for(let item of listaactividadEquipo)
      {
        this.actividadEquipoService.registrar(item)
        .pipe
        (
          finalize(() => this.isLoadingResults = false)
        )
        .subscribe(respuesta => 
        {
        //  console.log(respuesta);
         // this.BuscarTrabajadoresAsignados(0,this.numeroFilas);
        })
      }

  }

  GrabarProgramacion(listaprogramacion : ProgramacionModel[])
  {
    for(let item of listaprogramacion)
    {
      this.programacionService.registrar(item)
      .pipe
      (
        finalize(() => this.isLoadingResults = false)
      )
      .subscribe(respuesta => 
      {
        //console.log(respuesta);
       // this.BuscarTrabajadoresAsignados(0,this.numeroFilas);
      })
    }


  }

  
  ocultarComponente(): void {
    this.cerrar.emit(false);
  }


  mostrarNombreModuloSelect(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
  }

  mostrarNombreOpcionSelect(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
  }

  mostrarNombreTipoAccesoSelect(option: any): string {
    if (option) {
      return option.strValor;
    } else {
      return '';
    }
  }

  getFontSize(): number {
    return 12;
  }

  EstablecerValorEnForm(nombreControl: string, valor: any) {
    this.form.get(nombreControl).setValue(valor);
    //console.log(this.formArea);
  }
  // establecerDatosExistentes(): void {
  //    if (this.idProgramacion > 0) {
  //     this.programacionService
  //       .obtener(this.idProgramacion)
  //       .subscribe((result: ProgramacionModel) => {
  //         this.programacionModel = result;
  //         this.form.get('controlFechaInic').setValue(this.programacionModel.dtFechaInicio);
  //         this.form.get('controlFechaFin').setValue(this.programacionModel.dtFechaFin);
  //         this.form.get('controlFrecuencia').setValue(this.programacionModel.intFrecuencia);
  //         this.form.get('controlMotivo').setValue(this.programacionModel.strMotivo);
  //         this.form.get('tipoFrecuenciaSelect').setValue(this.programacionModel.intIdTipo);
  //        // this.obtenerListadoModulos(true, this.model.intIdSuperior);
  //       });
  //   } else {
  //     this.limpiarForm();
  //     this.programacionModel = new ProgramacionModel();
  //   }
  // }

  
  limpiarForm(): void {
    this.form.reset();
    this.form.markAsUntouched();
    this.form.markAsPristine();
//    this.EstablecerValorEnForm('controlEstado', true);
    
    this.form.get('tipoFrecuenciaSelect').setErrors(null);
   // document.getElementById('controlCodigo').focus();
   this.limpiarLista();


  }

  selectedValueTipo(event: any): void {
    //console.log(event.source.triggerValue);
    this.textSelectedTipoFrecuencia = event.source.triggerValue;
  }

  Elminar_temp(item: ProgramacionModel)
  {
    let index = this.listaProgramacion_temp.findIndex(e=>e.intId === item.intId);
    if(index !== -1){
        this.listaProgramacion_temp.splice( index,1);
      }
      //console.log(index);
     // console.log(this.listaProgramacion_temp);

    this.dataSource.data = this.listaProgramacion_temp;

  }

  limpiarLista() {
   
      this.idItem = 0;
       this.dataSource = new MatTableDataSource<ProgramacionModel>();
       this.listaActividadEquipoModel=[];
       this.listaprogramacion=[];
       this.listaProgramacion_temp=[];

  }

}
