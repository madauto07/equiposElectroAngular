import { BaseModel } from "../general/base-model";
import { DocumentoModel } from "./documento-model";

export class ElementoModel extends BaseModel {
  intId: number = 0;
  strNombre: string;
  intIdDocumento: number;
  objDocumento: DocumentoModel;
  intEstado: number;
}
