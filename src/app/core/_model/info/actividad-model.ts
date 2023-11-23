import { ConstanteModel } from '../administracion/constante-model';
import { SubconstanteModel } from '../administracion/sub-constante-model';
import { BaseModel } from '../general/base-model';
import { DatoModel } from './dato-model';
export class ActividadModel extends BaseModel {
  intId: number;
  strNombre: string;
  strCodigo : string;
  strTipoActivo : string;

   intIdTipoMantenimiento : number;
   objConstanteTipoMantenimiento: ConstanteModel;
   intIdObjeto : number;
   objConstanteObjeto: ConstanteModel;
   intIdParte : number;
   objConstanteParte: ConstanteModel;
   intIdSubParte : number;
   objSubConstanteSubParte: SubconstanteModel;
   strDuracion : string;
   intIdNivelResponsabilidad : number;
   objConstanteNivelResp: ConstanteModel;
   intIdTipoRive : number;
   objConstanteTipoRive: ConstanteModel;
   strProcedimiento : string;
   strProcedimientoTecnico : string;
   strProteccionPersonal : string;
   strPrevencionOperacional : string;
   intNumeroVersion : number;
   dtFechaVersion : Date;
   strHoraInicio : number;
   strHoraFin : string;
   intIdTipoPersonal : number;
   objConstanteTipoPersonal: ConstanteModel;
   intEstado : number;


}
