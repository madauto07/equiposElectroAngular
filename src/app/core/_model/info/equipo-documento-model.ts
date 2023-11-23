import { BaseModel } from "../general/base-model";
import { DocumentoModel } from "./documento-model";

export class EquipoDocumentoModel extends BaseModel {
  intIdEquipo: number;
  intIdDocumento: number;
  objDocumento : DocumentoModel
  intEstado: number
}
