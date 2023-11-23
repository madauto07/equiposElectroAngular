import { BaseModel } from "../general/base-model";

export class ProgramacionTecnicaModel extends BaseModel {
    intId: number;
    intVersion: number;
    strNombre: string;
    dtFechaVersion: Date;
    dtFechaInicio: Date;
    dtFechaFin: Date;
    dtFechaGeneracion: Date;
    strUsuarioGeneracion: string;
    intEstado: number;      
   
}