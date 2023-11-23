import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { forkJoin, Observable } from 'rxjs';
import { finalize, map, startWith } from 'rxjs/operators';
import { DatoModel } from 'src/app/core/_model/info/dato-model';
import { DatoService } from 'src/app/core/_service/info/dato.service';
import { EPrefijo } from 'src/app/core/_model/general/EPrefijo';

@Component({
  selector: 'app-busqueda-codigo-equipo-dialog',
  templateUrl: './busqueda-codigo-equipo-dialog.component.html',
  styleUrls: ['./busqueda-codigo-equipo-dialog.component.scss'],
})
export class BusquedaCodigoEquipoDialogComponent {
  public isLoadingResults = false;
  form: FormGroup = this.formBuilder.group({
    datoA0SelectAC: [new DatoModel()],
    datoA1SelectAC: [new DatoModel()],
    datoA2SelectAC: [new DatoModel()],
    datoAN: ['', [Validators.maxLength(2)]],
    datoB1SelectAC: [new DatoModel()],
    datoB2SelectAC: [new DatoModel()],
    datoBN: ['', [Validators.maxLength(2)]],
  });

  listaDatoA0: DatoModel[];
  listaDatoA0Filtrada: Observable<DatoModel[]>;
  listaDatoA1: DatoModel[];
  listaDatoA1Filtrada: Observable<DatoModel[]>;
  listaDatoA2: DatoModel[];
  listaDatoA2Filtrada: Observable<DatoModel[]>;
  listaDatoB1: DatoModel[];
  listaDatoB1Filtrada: Observable<DatoModel[]>;
  listaDatoB2: DatoModel[];
  listaDatoB2Filtrada: Observable<DatoModel[]>;
  listaDatoB3: DatoModel[];
  listaDatoB3Filtrada: Observable<DatoModel[]>;

  codigoGenerado: String = '';

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<BusquedaCodigoEquipoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datoService: DatoService
  ) {
    this.isLoadingResults = true;
    //Obtener datos de datos con superior = No
    const observable = forkJoin([
      this.datoService.select(0, EPrefijo.IdPrefijoA0), //0
      this.datoService.select(0, EPrefijo.IdPrefijoA1), //1
      this.datoService.select(0, EPrefijo.IdPrefijoB1), //2
    ]);

    observable.pipe(finalize(() => (this.isLoadingResults = false))).subscribe({
      next: (value) => {
        this.listaDatoA0 = value[0];
        this.listaDatoA1 = value[1];
        this.listaDatoB1 = value[2];
      },
      complete: () => {
        this.setObservableCambioSelectDatoA0();
        this.setObservableCambioSelectDatoA1();
        this.setObservableCambioSelectDatoB1();
      },
    });
    //Escuchar Cambios en el formulario para generar el codigo
    this.form.valueChanges.subscribe((val) => {
      this.construirCodigo();
    });
  }

  construirCodigo() {
    const codDatoA0 = this.form.value.datoA0SelectAC.strCodigo
      ? this.form.value.datoA0SelectAC.strCodigo
      : '';
    const codDatoA1 = this.form.value.datoA1SelectAC.strCodigo
      ? this.form.value.datoA1SelectAC.strCodigo
      : '';
    const codDatoA2 = this.form.value.datoA2SelectAC.strCodigo
      ? this.form.value.datoA2SelectAC.strCodigo
      : '';
    const datoAN = this.form.value.datoAN;
    const codDatoB1 = this.form.value.datoB1SelectAC.strCodigo
      ? this.form.value.datoB1SelectAC.strCodigo
      : '';
    const codDatoB2 = this.form.value.datoB2SelectAC.strCodigo
      ? this.form.value.datoB2SelectAC.strCodigo
      : '';
    const datoBN = this.form.value.datoBN;
    this.codigoGenerado = `${codDatoA0}${codDatoA1}${codDatoA2}${datoAN} ${codDatoB1}${codDatoB2}${datoBN}`;
  }

  setObservableCambioSelectDatoA0() {
    this.listaDatoA0Filtrada = this.form
      .get('datoA0SelectAC')
      .valueChanges.pipe(
        startWith(new DatoModel()),
        map((valorInput) => this.filtrarlistaDatoA0(valorInput))
      );
  }

  filtrarlistaDatoA0(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoA0.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  setObservableCambioSelectDatoA1() {
    this.listaDatoA1Filtrada = this.form
      .get('datoA1SelectAC')
      .valueChanges.pipe(
        startWith(new DatoModel()),
        map((valorInput) => this.filtrarlistaDatoA1(valorInput))
      );
  }

  filtrarlistaDatoA1(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoA1.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  setObservableCambioSelectDatoB1() {
    this.listaDatoB1Filtrada = this.form
      .get('datoB1SelectAC')
      .valueChanges.pipe(
        startWith(new DatoModel()),
        map((valorInput) => this.filtrarlistaDatoB1(valorInput))
      );
  }

  filtrarlistaDatoB1(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoB1.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  seleccionar() {
    this.dialogRef.close({
      codigoEquipoSeleccionado: this.codigoGenerado,
      objDatoA0Seleccionado: this.form.get('datoA0SelectAC').value,
    });
  }

  cancelar() {
    this.dialogRef.close();
  }

  mostrarNombreDatoA0Select(option: any): string {
    if (option) {
      let valor='';
      if(option.strCodigo){
        valor = option.strCodigo +'' + option.strNombre;
      }
      return  valor;
    } else {
      return '';
    }

  }

  mostrarNombreDatoA1Select(option: any): string {
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

  mostrarNombreDatoA2Select(option: any): string {
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

  mostrarNombreDatoB1Select(option: any): string {
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

  mostrarNombreDatoB2Select(option: any): string {
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

  selectedDatoA1(event: any): void {
    let idDatoA1Seleccionado: number = event.option.value.intId;
    this.obtenerListadoDatoA2(idDatoA1Seleccionado);
    //this.construirCodigo();
  }

  obtenerListadoDatoA2(idDatoA1Seleccionado: number): void {
    this.datoService
      .select(idDatoA1Seleccionado, EPrefijo.IdPrefijoA2)
      .subscribe((rpta) => {
        this.listaDatoA2 = rpta;
        this.setObservableCambioSelectDatoA2();
      });
  }

  setObservableCambioSelectDatoA2() {
    this.listaDatoA2Filtrada = this.form
      .get('datoA2SelectAC')
      .valueChanges.pipe(
        startWith(new DatoModel()),
        map((valorInput) => this.filtrarlistaDatoA2(valorInput))
      );
  }

  filtrarlistaDatoA2(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoA2.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }

  selectedDatoB1(event: any): void {
    let idDatoB1Seleccionado: number = event.option.value.intId;
    this.obtenerListadoDatoB2(idDatoB1Seleccionado);
    //this.construirCodigo();
  }

  obtenerListadoDatoB2(idDatoB1Seleccionado: number): void {
    this.datoService
      .select(idDatoB1Seleccionado, EPrefijo.IdPrefijoB2)
      .subscribe((rpta) => {
        this.listaDatoB2 = rpta;
        this.setObservableCambioSelectDatoB2();
      });
  }

  setObservableCambioSelectDatoB2() {
    this.listaDatoB2Filtrada = this.form
      .get('datoB2SelectAC')
      .valueChanges.pipe(
        startWith(new DatoModel()),
        map((valorInput) => this.filtrarlistaDatoB2(valorInput))
      );
  }

  filtrarlistaDatoB2(val: any): DatoModel[] {
    let valorFiltrado = '';
    if (typeof val === 'string') {
      valorFiltrado = val;
    } else {
      valorFiltrado = val.strNombre ? val.strNombre : '';
    }
    return this.listaDatoB2.filter((x) =>
      x.strNombre.toLowerCase().includes(valorFiltrado)
    );
  }
}
