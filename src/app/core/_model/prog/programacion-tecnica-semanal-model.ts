import { BaseModel } from "../general/base-model";

export class ProgramacionTecnicaSemanalModel extends BaseModel {
    intId: number;
    intVersion: number;
    strNombre: string;
    dtFechaVersion: Date;
    intAnho: number;
    intSemana: number;
    dtFechaInicio: Date;
    dtFechaFin: Date;
    dtFechaGeneracion: Date;
    intEstado: number;      
   
}
