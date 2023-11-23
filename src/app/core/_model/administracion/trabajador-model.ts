import { BaseModel } from '../general/base-model';
import { AreaModel } from './area-model';
import { ConstanteModel } from './constante-model';

export class TrabajadorModel extends BaseModel {
  intId: number=0;
  intIdArea: number=0;
  objArea?: AreaModel;
  strNombre: string='';
  strApellido: string='';
  strCodigo: string='';
  intIdEspecialidad: number=0;
  objEspecialidad?: ConstanteModel;
  strTelefono: string='';
  strCorreo: string='';
  intEstado: number=0;
}
