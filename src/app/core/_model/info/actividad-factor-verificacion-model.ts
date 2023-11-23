import { BaseModel } from "../general/base-model";
import { FactorVerificacionModel } from '../info/factor-verificacion-model';

export class ActividadFactorVerificacionModel extends BaseModel {
    intIdActividad: number;
    intIdFactor: number;
    intEstado: number;
    objFactorVerificacion : FactorVerificacionModel;
    
}