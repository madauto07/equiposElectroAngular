
import { BaseModel } from "../general/base-model";
export class ProgramacionTecnicaDetalleModel extends BaseModel {
    intId: number;
    intVersion: number;
    dtFechaVersion: Date;
    dtFechaInicio: Date;
    dtFechaFin: Date;
    dtHoraInicio: string;
    dtHoraFin: string;
    intIdAnual: number;
    intIdMensual: number;
    intIdSemanal: number;
    intIdActividad: number;
    intIdEquipo: number;
    intCondicionSistema: number;
    intCondicionEquipo: number;
    intIdResponsable: number;
    intBloqueo: number;
    intEstado: number;
}



  