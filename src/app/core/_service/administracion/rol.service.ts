import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { RolModel } from '../../_model/administracion/rol-model';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolService  extends GenericService<GenericModel<RolModel>>  {
  RolCambio = new Subject<RolModel[]>();
  mensajeCambio = new Subject<string>();

  constructor( protected http:HttpClient) {

    super(http, `${environment.apiURL}/administracion/roles`);
   }

   listar():Observable<any>
   {
 
     return this.http.get<any>(`${this.url}`);
   }
 
   listarPageable(page: number, rows: number,strnombre:string ) {
     return this.http.get<GenericModel<RolModel>>(`${this.url}/page?page=${page}&rows=${rows}&strnombre=${strnombre}`);
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
     return this.http.get<RolModel>(`${this.url}/${intId}`);
   }
 
   Registrar(rolModel: RolModel) 
   {
     return this.http.post<any>(`${this.url}/`, rolModel);
   }
   Actualizar(rolModel: RolModel) 
   {
     return this.http.put<any>(`${this.url}/`, rolModel);
   }
 
   Eliminar(intId: number) 
   {
     return this.http.delete<any>(`${this.url}/${intId}`);
   }  


}