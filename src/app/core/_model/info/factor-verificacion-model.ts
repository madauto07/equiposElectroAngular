import { BaseModel } from "../general/base-model";
export class FactorVerificacionModel extends BaseModel {
    intId: number;
    strNombre: string;
    strParte: string;
    intPonderacion: number;
    intEstado: number;    
    
}