import { BaseModel } from "../general/base-model";
import { NivelModel } from './nivel-model';
export class PrefijoModel extends BaseModel {
    intId: number;
    intIdSuperior: number;
    strNombre: string;
    dbEstado: number;      
    strDescripcion: string;
    intOrden: number;
    intIdNivel: number; 
    intSuperior: number;
    strCodigo: string;
    intTamano: number;
    intidPrefijoLst : number;
    objNivel : NivelModel;
    
}