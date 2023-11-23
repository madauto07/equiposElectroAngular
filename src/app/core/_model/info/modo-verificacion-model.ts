import { BaseModel } from "../general/base-model";
export class ModoVerificacionModel extends BaseModel {
    intId: number;
    intIdFactor: number;
    strNombre: string;
    strValor: string;
    intEvaluacion: number;
    intEstado: number;    
    
}