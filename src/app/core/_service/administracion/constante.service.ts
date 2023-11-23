import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { TipoConstanteModel } from '../../_model/administracion/tipo-constante-model';
import { ConstanteModel } from '../../_model/administracion/constante-model';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConstanteService  extends GenericService<GenericModel<ConstanteModel>>  {
  RolCambio = new Subject<ConstanteModel[]>();
  mensajeCambio = new Subject<string>();

  constructor( protected http:HttpClient) {

    super(http, `${environment.apiURL}/administracion/constantes`);
   }

   listar():Observable<any>
   {
 
     return this.http.get<any>(`${this.url}`);
   }

   listarAnho(nro : number): Observable<any> {
    return this.http.get<any>(`${this.url}/anho?nro=${nro}`);
  }

  listarSemana(nro : number): Observable<any> {
    return this.http.get<any>(`${this.url}/sem?nro=${nro}`);
  }

   listarControl():Observable<any>
   {
 
     return this.http.get<any>(`${this.url}`);
   }

   listarControlId(id: number):Observable<any>
   {
 
     return this.http.get<any>(`${this.url}/control?id=${id}`);
   }
 
 
   listarPageable(page: number, rows: number, idtipo: number,strnombre:string ) {
     return this.http.get<GenericModel<ConstanteModel>>(`${this.url}/page?page=${page}&rows=${rows}&idtipoconstante=${idtipo}&strnombre=${strnombre}`);
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
     return this.http.get<ConstanteModel>(`${this.url}/${intId}`);
   }
 
   Registrar(Model: ConstanteModel) 
   {
     return this.http.post<any>(`${this.url}/`, Model);
   }
   Actualizar(Model: ConstanteModel) 
   {
     return this.http.put<any>(`${this.url}/`, Model);
   }
 
   Eliminar(intId: number) 
   {
     return this.http.delete<any>(`${this.url}/${intId}`);
   }  

   

}