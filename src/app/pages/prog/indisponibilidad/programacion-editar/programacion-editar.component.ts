import { Component, OnInit,ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, startWith } from 'rxjs/operators';
import { ProgramacionTecnicaService } from 'src/app/core/_service/prog/programacion-tecnica.service';
import { ProgramacionTecnicaDetalleService } from 'src/app/core/_service/prog/programacion-tecnica-detalle.service';
import { ProgramacionTecnicaModel } from 'src/app/core/_model/prog/programacion-tecnica-model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-programacion-editar',
  templateUrl: './programacion-editar.component.html',
  styleUrls: ['./programacion-editar.component.scss'],
 
})
export class ProgramacionEditarComponent implements OnInit {
  idOpcion =0;
  idProgramacion = 0;
  titulo = '';
  fechaIni = '';
  fechaFin = '';
  programacionTecnicaModel: ProgramacionTecnicaModel = new ProgramacionTecnicaModel();
  form: FormGroup;
  soloLectura = false;
  numeroFilas = 25;
  pageSizeOptions = [25, 35, 45, 50, 100];
  cantidadRegistros: number = 0;
  public isLoadingResults = false;

  @ViewChild(MatPaginator, { static: true }) paginator?: MatPaginator;
  displayedColumns = ['id', 'idactividad', 'Actividad', 'TipoMant', 'parte','subparte','ubitecnica','codequipo','Equipo','condsistema','condequipo' ];
  dataSource = new MatTableDataSource<any>();

  constructor( private activateRoute: ActivatedRoute,
    private programacionTecnicaService:ProgramacionTecnicaService,
    private programacionTecnicaDetalleService :ProgramacionTecnicaDetalleService,
    private formBuilder: FormBuilder) { 
this.obtenerIdUrl();
this.construirFormulario();
    }

  ngOnInit(): void {
   
    this.obtenerDatos();
    this.listar();
  }

  obtenerIdUrl(): void {
    this.idProgramacion = Number(this.activateRoute.snapshot.paramMap.get('id'));
  }

  construirFormulario() {
    this.form = this.formBuilder.group({
      strSemana:[''],
      fechaInicio: [''],
      fechaFin: [''],
      strEstado: ['']
    });
  }

  
  obtenerDatos(): void {
    if (this.idProgramacion > 0) {
      console.log(this.idProgramacion);
      this.programacionTecnicaService.obtener(this.idProgramacion).subscribe((result) => {
       // this.programacionTecnicaModel = result;
        console.log(result);
        this.titulo=result.strNombre;
        this.fechaIni=result.dtFechaInicio.toString();
        this.fechaFin=result.dtFechaFin.toString();
        this.idProgramacion= result.intId;
      
      });
    }
  }

 
  
  listar(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
    this.isLoadingResults = true;
    
    this.programacionTecnicaDetalleService
    .listarPageDetallexId(1,
      indicePagina,
      numeroFilasABuscar,
      this.idProgramacion,
     ).pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        console.log( response);
       this.dataSource.data=response.Items;
      });
  }


  Guardar(): void
  {

  }

  handlePage(e: any) {
    this.numeroFilas = e.pageSize;
    if (this.dataSource.data.length > 0) {
      this.listar(e.pageIndex, e.pageSize);
    }
  }
  regresar(){

  }
}
