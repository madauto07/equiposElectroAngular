import { BaseModel } from "../general/base-model";
import { ConstanteModel } from '../administracion/constante-model';
export class ProgramacionModel extends BaseModel {
    intId: number;
    intIdActividad: number;
    intIdEquipo: number;
    intIdTipo: number;
    objConstanteTipoFrecuencia: ConstanteModel;
    intFrecuencia: number;
    dtFechaInicio: Date;
    dtFechaFin: Date;
    strMotivo: string;
    intEstado: number;
    strNombreTipo : string;    
    
}



