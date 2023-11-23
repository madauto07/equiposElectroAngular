import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';
import { DatoModel } from 'src/app/core/_model/info/dato-model';
import { DatoService } from 'src/app/core/_service/info/dato.service';
import { EPrefijo } from 'src/app/core/_model/general/EPrefijo';
import { stringify } from 'querystring';

@Component({
  selector: 'app-busqueda-codigo-ubicacion-tecnica-dialog',
  templateUrl: './busqueda-codigo-ubicacion-tecnica-dialog.component.html',
  styleUrls: ['./busqueda-codigo-ubicacion-tecnica-dialog.component.scss'],
})
export class BusquedaCodigoUbicacionTecnicaDialogComponent {
  public isLoadingResults = false;
  form: FormGroup = this.formBuilder.group({
    datoGSelectAC: [new DatoModel()],
    datoF0SelectAC: [new DatoModel()],
    datoF1SelectAC: [new DatoModel()],
    datoF2SelectAC: [new DatoModel()],
    datoF3SelectAC: [new DatoModel()],
    datoFN: ['', [Validators.maxLength(2)]],
  });

  listaDatoG: DatoModel[];
  listaDatoGFiltrada: Observable<DatoModel[]>;
  listaDatoF0: DatoModel[];
  listaDatoF0Filtrada: Observable<DatoModel[]>;
  listaDatoF1: DatoModel[];
  listaDatoF1Filtrada: Observable<DatoModel[]>;
  listaDatoF2: DatoModel[];
  listaDatoF2Filtrada: Observable<DatoModel[]>;
  listaDatoF3: DatoModel[];
  listaDatoF3Filtrada: Observable<DatoModel[]>;

  codigoGenerado: String = '';

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<BusquedaCodigoUbicacionTecnicaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datoService: DatoService
  ) {
    this.isLoadingResults = true;
    //Obtener datos de Dato G
    const observable = forkJoin([
      this.datoService.select(0, EPrefijo.IdPrefijoG), //0
      this.datoService.select(0, EPrefijo.IdPrefijoF1), //1
    ]);

    observable.pipe(finalize(() => (this.isLoadingResults = false))).subscribe({
      next: (value) => {
        this.listaDatoG = value[0];
        this.listaDatoF1 = value[1];
      },
      complete: () => {
       this.setObservableCambioSelectDatoG();
        this.setObservableCambioSelectDatoF1();
      },
    });
    //Escuchar Cambios en FN para generar el codigo
    this.form.valueChanges.subscribe((val) => {
      this.construirCodigo();
    });
  }

  construirCodigo() {
    const codDatoG = this.form.value.datoGSelectAC.strCodigo
      ? this.form.value.datoGSelectAC.strCodigo
      : '';
    const codDatoF0 = this.form.value.datoF0SelectAC.strCodigo
      ? this.form.value.datoF0SelectAC.strCodigo
      : '';
    const codDatoF1 = this.form.value.datoF1SelectAC.strCodigo
      ? this.form.value.datoF1SelectAC.strCodigo
      : '';
    const codDatoF2 = this.form.value.datoF2SelectAC.strCodigo
      ? this.form.value.datoF2SelectAC.strCodigo
      : '';
    const codDatoF3 = this.form.value.datoF3SelectAC.strCodigo
      ? this.form.value.datoF3SelectAC.strCodigo
      : '';
    const datoFN = this.form.value.datoFN;
    this.codigoGenerado = `${codDatoG} ${codDatoF0}${codDatoF1}${codDatoF2}${codDatoF3}${datoFN}`;
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
   // console.log(valorFiltrado);
    return this.listaDatoG.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  setObservableCambioSelectDatoF1() {
    this.listaDatoF1Filtrada = this.form
      .get('datoF1SelectAC')
      .valueChanges.pipe(
        startWith(new DatoModel()),
        map((valorInput) => this.filtrarlistaDatoF1(valorInput))
      );
  }

  filtrarlistaDatoF1(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoF1.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  seleccionar() {
    this.dialogRef.close({
      codigoUbicacionTecnicaSeleccionado: this.codigoGenerado,
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  mostrarNombreDatoGSelect(option: any): string {
    if (option) {
      let valor='';
      if(option.strCodigo){
        valor = option.strCodigo +' - ' + option.strNombre;
      }
      return  valor;
    } else {
      return '';
    }
  }

  mostrarNombreDatoF0Select(option: any): string {
    if (option) {
      let valor='';
      if(option.strCodigo){
        valor = option.strCodigo +' - ' + option.strNombre;
      }
      return  valor;
    } else {
      return '';
    }
  }

  mostrarNombreDatoF1Select(option: any): string {
    if (option) {
      let valor='';
      if(option.strCodigo){
        valor = option.strCodigo +' - ' + option.strNombre;
      }
      return  valor;
    } else {
      return '';
    }

  }

  mostrarNombreDatoF2Select(option: any): string {
    if (option) {
      let valor='';
      if(option.strCodigo){
        valor = option.strCodigo +' - ' + option.strNombre;
      }
      return  valor;
    } else {
      return '';
    }

  }

  mostrarNombreDatoF3Select(option: any): string {
    if (option) {
      let valor='';
      if(option.strCodigo){
        valor = option.strCodigo +' - ' + option.strNombre;
      }
      return  valor;
    } else {
      return '';
    }

  }

  selectedDatoG(event: any): void {
    let idDatoGSeleccionado: number = event.option.value.intId;
    this.obtenerListadoDatoF0(idDatoGSeleccionado);
  }

  obtenerListadoDatoF0(idDatoGSeleccionado: number): void {
    this.datoService
      .select(idDatoGSeleccionado, EPrefijo.IdPrefijoF0)
      .subscribe((rpta) => {
        this.listaDatoF0 = rpta;
        this.setObservableCambioSelectDatoF0();
      });
  }

  setObservableCambioSelectDatoF0() {
    this.listaDatoF0Filtrada = this.form
      .get('datoF0SelectAC')
      .valueChanges.pipe(
        startWith(new DatoModel()),
        map((valorInput) => this.filtrarlistaDatoF0(valorInput))
      );
  }

  filtrarlistaDatoF0(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoF0.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  selectedDatoF1(event: any): void {
    let idDatoF1Seleccionado: number = event.option.value.intId;
    this.obtenerListadoDatoF2(idDatoF1Seleccionado);
  }

  obtenerListadoDatoF2(idDatoF1Seleccionado: number): void {
    this.datoService
      .select(idDatoF1Seleccionado, EPrefijo.IdPrefijoF2)
      .subscribe((rpta) => {
        this.listaDatoF2 = rpta;
        this.setObservableCambioSelectDatoF2();
      });
  }

  setObservableCambioSelectDatoF2() {
    this.listaDatoF2Filtrada = this.form
      .get('datoF2SelectAC')
      .valueChanges.pipe(
        startWith(new DatoModel()),
        map((valorInput) => this.filtrarlistaDatoF2(valorInput))
      );
  }

  filtrarlistaDatoF2(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoF2.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  selectedDatoF2(event: any): void {
    let idDatoF2Seleccionado: number = event.option.value.intId;
    this.obtenerListadoDatoF3(idDatoF2Seleccionado);
  }

  obtenerListadoDatoF3(idDatoF2Seleccionado: number): void {
    this.datoService
      .select(idDatoF2Seleccionado, EPrefijo.IdPrefijoF3)
      .subscribe((rpta) => {
        this.listaDatoF3 = rpta;
        this.setObservableCambioSelectDatoF3();
      });
  }

  setObservableCambioSelectDatoF3() {
    this.listaDatoF3Filtrada = this.form
      .get('datoF3SelectAC')
      .valueChanges.pipe(
        startWith(new DatoModel()),
        map((valorInput) => this.filtrarlistaDatoF3(valorInput))
      );
  }

  filtrarlistaDatoF3(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoF3.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }
}
