import { BaseModel } from 'src/app/core/_model/general/base-model';

export class RolModel extends BaseModel {
  intId: number;
  strNombre: string;
  strDescripcion: string;
  intIdSistema: number;
  intEstado: number;
}
