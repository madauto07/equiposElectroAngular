import { ConstanteModel } from '../administracion/constante-model';
import { BaseModel } from '../general/base-model';
import { DatoModel } from './dato-model';
export class EquipoModel extends BaseModel {
  intId: number;
  strNombre: string;
  strNumeroSerie: string;
  strCodigoSITEC: string;
  strCodigoKKS: string;
  strUbicacionTecnica: string;
  strCodigoEquipo: string;
  intIdTipoActivo: number;
  objConstanteTipoActivo: ConstanteModel;
  intIdMarca: number;
  objDatoMarca: DatoModel;
  strModelo: string;
  intIdTipoEquipo: number;
  objConstanteTipoEquipo: ConstanteModel;
  intCantidad: number;
  dtFechaFabricacion: Date;
  dtFechaInstalacion: Date;
  strSerie: string;
  strTipoEquipo: string;
  strReferencia: string;
  strInforme: string;
  intEstado: number;
}
