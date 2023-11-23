
import { BaseModel } from "../general/base-model";
import { TrabajadorModel } from '../administracion/trabajador-model';

export class ActividadTrabajadorModel extends BaseModel {
    intIdActividad: number;
    intIdTrabajador: number;
    intEstado: number;
    objTrabajador : TrabajadorModel;
    
}