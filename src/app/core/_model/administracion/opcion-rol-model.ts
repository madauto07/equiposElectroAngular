import { BaseModel } from '../general/base-model';
import { ConstanteModel } from './constante-model';
import { OpcionModel } from './opcion-model';
import { RolModel } from './rol-model';

export class OpcionRolModel extends BaseModel {
  intIdRol: number;
  objRol: RolModel;
  intIdOpcion: number;
  objOpcion: OpcionModel;
  intIdTipoAcceso: number;
  objTipoAcceso: ConstanteModel;
  intEstado: number;
}
