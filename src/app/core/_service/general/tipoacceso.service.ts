import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EConstante } from 'src/app/core/_model/general/EConstante'
import swal from 'sweetalert2';
// const TIPO_ACCESO_DEFAULT = EConstante.TipoAccesoLectura;
const TIPO_ACCESO_DEFAULT = EConstante.TipoAccesoEscritura; //Temporal

@Injectable({
  providedIn: 'root',
})
export class TipoAccesoService {
  private listaMenu: any;

  constructor() {
    this.listaMenu = JSON.parse(localStorage.getItem('listado_menu'));
  }

  getSoloLectura(idOpcion: number): boolean {
    let soloLectura = false;
    let tipoopcion = this.listaMenu?.find(
      (x) => x.idopcion === idOpcion
    )?.idtipoacceso;
    if (!tipoopcion) {
      tipoopcion = TIPO_ACCESO_DEFAULT;
    }
    if (parseInt(tipoopcion) == EConstante.TipoAccesoLectura) {
      soloLectura = true
    }
    console.log("Solo Lectura:",soloLectura);
    return soloLectura;
  }

  validarSoloLectura(soloLectura:boolean): boolean{
    //let continuarEjecucionCodigo = true
    let continuarEjecucionCodigo = true; //Solo Temporal
    if (soloLectura) {
      swal
      .fire({
        title: 'No tiene habilitada esta opción',
        icon: 'info',
        confirmButtonColor: '#004f91',
        cancelButtonColor: '#7B7A83',
        confirmButtonText: 'Aceptar',
      })
      continuarEjecucionCodigo = false
    }
    return continuarEjecucionCodigo
  }



}
