import { BaseModel } from "../general/base-model";

export class DocumentoModel extends BaseModel {
  intId: number;
   strNombre: string;
   strDescripcion: string;
   strRuta : string;
   strUrl : string;
   vbArchivo : any;
   intIdTipoDocumento: number
   intEstado: number
}
