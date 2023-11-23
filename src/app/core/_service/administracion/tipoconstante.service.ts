import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { TipoConstanteModel } from '../../_model/administracion/tipo-constante-model';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TipoConstanteService  extends GenericService<GenericModel<TipoConstanteModel>>  {
  RolCambio = new Subject<TipoConstanteModel[]>();
  mensajeCambio = new Subject<string>();

  constructor( protected http:HttpClient) {

    super(http, `${environment.apiURL}/administracion/tipoconstantes`);
   }

   listar():Observable<any>
   {
 
     return this.http.get<any>(`${this.url}`);
   }

   listarControl():Observable<any>
   {
 
     return this.http.get<any>(`${this.url}`);
   }
 
   listarPageable(page: number, rows: number,strnombre:string ) {
     return this.http.get<GenericModel<TipoConstanteModel>>(`${this.url}/page?page=${page}&rows=${rows}&strnombre=${strnombre}`);
   }

   Reporte(strnombre : string, 
    intIdUsuario : number):Observable<any>
  {
    var params = new HttpParams()
    .set('strNombre', strnombre)
     .set('intIdUsuario', intIdUsuario.toString())
    
    return this.http.get(`${this.url}/reportes?`, {params, responseType: 'blob'});
  }

 
   Obtener(intId: number) 
   {
     return this.http.get<TipoConstanteModel>(`${this.url}/${intId}`);
   }
 
   Registrar(Model: TipoConstanteModel) 
   {
     return this.http.post<any>(`${this.url}/`, Model);
   }
   Actualizar(Model: TipoConstanteModel) 
   {
     return this.http.put<any>(`${this.url}/`, Model);
   }
 
   Eliminar(intId: number) 
   {
     return this.http.delete<any>(`${this.url}/${intId}`);
   }  


}