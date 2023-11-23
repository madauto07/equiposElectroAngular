import { BaseModel } from '../general/base-model';
import { ModuloModel } from './modulo-model';
export class OpcionModel extends BaseModel {
  intId: number;
  strNombre: string;
  strDescripcion: string;
  strURL: string;
  intIdOpcionPadre: number;
  strClase: string;
  strToken: string;
  strRutaIcono: string;
  dbOrden: number;
  intIdSistema: number;
  intIdModulo: number;
  objModulo: ModuloModel;
  intEstado: number;
}
