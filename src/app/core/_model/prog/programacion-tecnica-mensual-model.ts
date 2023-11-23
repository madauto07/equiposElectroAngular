import { BaseModel } from "../general/base-model";

export class ProgramacionTecnicaMensualModel extends BaseModel {
    intId: number;
    intVersion: number;
    strNombre: string;
    dtFechaVersion: Date;
    intAnho: number;
    intMes: number;
    dtFechaInicio: Date;
    dtFechaFin: Date;
    dtFechaGeneracion: Date;
    intEstado: number;      
   
}


