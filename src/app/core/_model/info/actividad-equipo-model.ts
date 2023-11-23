
import { BaseModel } from "../general/base-model";
import { EquipoModel } from "../info/equipo-model";
import { ActividadModel } from "../info/actividad-model";
import { ConstanteModel } from "../administracion/constante-model";
export class ActividadEquipoModel extends BaseModel {
    intIdActividad: number;
    intIdEquipo: number;
    intIndSistema: number;
    intIndEquipo: number;
    intEstado: number;    
    objActividad: ActividadModel;
    objEquipo: EquipoModel;
    objConstante : ConstanteModel;

}


   