import { Component, Inject,ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';
import { DatoModel } from 'src/app/core/_model/info/dato-model';
import { DatoService } from 'src/app/core/_service/info/dato.service';
import { EPrefijo } from 'src/app/core/_model/general/EPrefijo';
import { MatSort } from '@angular/material/sort';
import { ConstanteModel } from 'src/app/core/_model/administracion/constante-model';
import { TrabajadorModel } from 'src/app/core/_model/administracion/trabajador-model';
import { TrabajadorService } from 'src/app/core/_service/administracion/trabajador.service';
import { ConstanteService } from 'src/app/core/_service/administracion/constante.service';
import { ETipoConstante as TipoConstanteEnum } from 'src/app/core/_model/general/ETipoConstante';


@Component({
  selector: 'app-busqueda-codigo-trabajador-dialog',
  templateUrl: './busqueda-codigo-trabajador-dialog.component.html',
  styleUrls: ['./busqueda-codigo-trabajador-dialog.component.scss'],
})
export class BusquedaCodigoTrabajadorDialogComponent  {

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  displayedColumns: string[];
  
  dataSource = new MatTableDataSource<TrabajadorModel>();
  numeroFilas = 5;
  pageSizeOptions = [5, 10, 15, 20, 50];
  cantidadRegistros = 0;
  isLoadingResults = false;


  form: FormGroup = this.formBuilder.group({
    datoGSelectAC: [new DatoModel()],

  });

  listaDatoG: DatoModel[];
  listaDatoGFiltrada: Observable<DatoModel[]>;
  codigoGenerado: String = '';

  selectedEspecialidadFiltro = 0;
  textSelectedEspecialidadFiltro = 'Todos';
  especialidadTodos: ConstanteModel;
  strBuscarCodigo = ''; 
  listaEspecialidad: ConstanteModel[];


  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<BusquedaCodigoTrabajadorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datoService: DatoService,
    private trabajadorService: TrabajadorService,
    private constanteService: ConstanteService
  ) {
    this.isLoadingResults = true;
    //Obtener datos de Dato G
    const observable = forkJoin([
      this.datoService.select(0, EPrefijo.IdPrefijoG), //0
 
    ]);

    observable.pipe(finalize(() => (this.isLoadingResults = false))).subscribe({
      next: (value) => {
        this.listaDatoG = value[0];
     
      },
      complete: () => {
        this.setObservableCambioSelectDatoG();
     
      },
    });
    //Escuchar Cambios en FN para generar el codigo
    this.form.valueChanges.subscribe((val) => {
      this.construirCodigo();
    });
  }


  
  setListaEspecialidad(): void {
    this.especialidadTodos = new ConstanteModel();
    this.especialidadTodos.intId = 0;
    this.especialidadTodos.strValor = 'Todos';
    this.constanteService
      .listarControlId(TipoConstanteEnum.Especialidad)
      .subscribe((response) => {
        this.listaEspecialidad = response.Items;
        this.listaEspecialidad.splice(0, 0, this.especialidadTodos);
      });
  }

  selectedValueEspecialidad(event: any): void {
    this.textSelectedEspecialidadFiltro = event.source.triggerValue;
  }

  listar(indicePagina = 0, numeroFilasABuscar = this.numeroFilas): void {
    this.isLoadingResults = true;
    this.trabajadorService
      .listarPageable(
        indicePagina,
        numeroFilasABuscar,
        this.strBuscarCodigo,
        this.selectedEspecialidadFiltro
      )
      .pipe(finalize(() => (this.isLoadingResults = false)))
      .subscribe((response) => {
        this.cantidadRegistros = response.Total;
        this.dataSource.data = response.Items;
      });
  }



  construirCodigo() {
    const codDatoG = this.form.value.datoGSelectAC.strCodigo
      ? this.form.value.datoGSelectAC.strCodigo
      : '';

     this.codigoGenerado = `${codDatoG} `;
  }

  setObservableCambioSelectDatoG() {
    this.listaDatoGFiltrada = this.form.get('datoGSelectAC').valueChanges.pipe(
      startWith(new DatoModel()),
      map((valorInput) => this.filtrarlistaDatoG(valorInput))
    );
  }

  filtrarlistaDatoG(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoG.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

 

  seleccionar() {
    this.dialogRef.close({
      codigoTrabajadorSeleccionado: this.codigoGenerado,
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  mostrarNombreDatoGSelect(option: any): string {
    if (option) {
      return option.strNombre;
    } else {
      return '';
    }
  }



  selectedDatoG(event: any): void {
    let idDatoGSeleccionado: number = event.option.value.intId;
    //this.obtenerListadoDatoF0(idDatoGSeleccionado);
  }

  

}
