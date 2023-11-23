import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConstanteModel } from '../../_model/administracion/constante-model';

const NUMERO_FILAS = '25';
const RANGO_PAGINACION = '35, 45, 50, 100';
const TAMAÑO_PREVIEW_IMAGEN_DOCUMENTO = '450px';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private listaConfiguracion: any;

  constructor() {
    this.listaConfiguracion = JSON.parse(localStorage.getItem('configuracion'));
  }

  getNumeroFilas(): number {
    // Cantidad Filas
    let constante = this.listaConfiguracion?.find(
      (x: ConstanteModel) => x.strNombre === 'Numero Filas Paginacion'
    )?.strValor;
    if (!constante) {
      constante = NUMERO_FILAS;
    }
    return parseInt(constante);
  }

  getRangoPaginacion(): any {
    let constante = this.listaConfiguracion?.find(
      (x: ConstanteModel) => x.strNombre === 'Rango paginacion'
    )?.strValor;
    if (!constante) {
      constante = RANGO_PAGINACION;
    }
    return JSON.parse(`[${this.getNumeroFilas()},${constante}]`);
  }

  getTamañoPreviewImagenEquipo(): string {
    let constante = this.listaConfiguracion?.find(
      (x: ConstanteModel) => x.strNombre === 'Tamaño vista previa de imagenes'
    )?.strValor;
    if (!constante) {
      constante = TAMAÑO_PREVIEW_IMAGEN_DOCUMENTO;
    }
    return constante;
  }

  getNombreActivo(): string{
    return 'Activo';
  }

  getNombreInactivo(): string{
    return 'Inactivo'
  }

  getTituloRegistro(nombreOpcion: string): string{
    return `Registro de ${nombreOpcion}`
  }

  getTituloEdicion(nombreOpcion: string): string{
    return `Edición de ${nombreOpcion}`
  }

}
