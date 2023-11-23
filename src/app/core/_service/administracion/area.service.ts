import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { AreaModel } from '../../_model/administracion/area-model';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AreaService extends GenericService<GenericModel<AreaModel>> {
  
  private urls: string = `${environment.apiURL}/administracion/areas`;


  constructor(protected http: HttpClient) {
    super(http, `${environment.apiURL}/administracion/areas`);
  }
  
  
  // listar()
  // {

  //   return this.http.get<any>(`${this.urls}`).pipe(map((res:any) => {
  //     return res;
  //   }))
  // }

  listar():Observable<GenericModel<AreaModel>>
  {
    return this.http.get<GenericModel<AreaModel>>(`${this.url}`);
  }
  
  listarControl():Observable<any>
  {

    return this.http.get<any>(`${this.url}`);
  }


  listarPageable(page: number, rows: number,strnombre:string ) {
    return this.http.get<GenericModel<AreaModel>>(`${this.url}/page?page=${page}&rows=${rows}&strnombre=${strnombre}`);
  }

  Obtener(intIdArea: number) 
  {
    return this.http.get<AreaModel>(`${this.url}/${intIdArea}`);
  }


  // ObtenerId(intIdArea: number) 
  // {
  //   return this.http.get<AreaModel>(`${this.url}/${intIdArea}`);
  // }



  Registrar(areaModel: AreaModel) 
  {
    return this.http.post<any>(`${this.url}/`, areaModel);
  }

  Actualizar(areaModel: AreaModel) 
  {
    return this.http.put<any>(`${this.url}/`, areaModel);
  }

  Eliminar(intIdArea: number) 
  {
    return this.http.delete<any>(`${this.url}/${intIdArea}`);
  }
  
 

}
