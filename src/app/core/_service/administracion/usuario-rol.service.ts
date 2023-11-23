import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { UsuarioModel } from '../../_model/administracion/usuario-model';
import { UsuarioRolModel } from '../../_model/administracion/usuario-rol-model';

import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioRolService  extends GenericService<GenericModel<UsuarioRolModel>>  {
  RolCambio = new Subject<UsuarioRolModel[]>();
  mensajeCambio = new Subject<string>();

  constructor( protected http:HttpClient) {

    super(http, `${environment.apiURL}/administracion/usuarioroles`);
   }

   listar():Observable<GenericModel<UsuarioRolModel>>
   {
 
     return this.http.get<GenericModel<UsuarioRolModel>>(`${this.url}`);
   }
 
   listarPageable(page: number, rows: number,strlogin:string, intIdArea: number, intIdPerfil: number ) {
     return this.http.get<GenericModel<UsuarioRolModel>>(`${this.url}/page?page=${page}&rows=${rows}&strlogin=${strlogin}&intIdarea=${intIdArea}&intidperfil=${intIdPerfil}`);
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
     return this.http.get<UsuarioRolModel>(`${this.url}/${intId}`);
   }
 
   Registrar(usuarioModel: UsuarioRolModel) 
   {
     return this.http.post<any>(`${this.url}/`, usuarioModel);
   }
   Actualizar(usuarioModel: UsuarioRolModel) 
   {
     return this.http.put<any>(`${this.url}/`, usuarioModel);
   }
 
   Eliminar(intId: number) 
   {
     return this.http.delete<any>(`${this.url}/${intId}`);
   }  


}