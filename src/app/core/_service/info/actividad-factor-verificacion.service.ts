import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ActividadFactorVerificacionModel } from '../../_model/info/actividad-factor-verificacion-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ActividadFactorVerificacionService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/actividadfactor`;
  }

  listar(): Observable<ActividadFactorVerificacionModel[]> {
    return this.http.get<ActividadFactorVerificacionModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number, idactividad: number ) {
    return this.http.get<GenericModel<ActividadFactorVerificacionModel>>(`${this.url}/page?page=${page}&rows=${rows}&idactividad=${idactividad}`);
  }



  obtener(intId: number): Observable<ActividadFactorVerificacionModel> {
    return this.http.get<ActividadFactorVerificacionModel>(`${this.url}/${intId}`);
  }

  registrar(equipoModel: ActividadFactorVerificacionModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, equipoModel);
  }

  actualizar(equipoModel: ActividadFactorVerificacionModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, equipoModel);
  }

 
  eliminar(intIdactividad: number, intIdFactor: number): Observable<any> {
    return this.http.delete<any>(
      `${this.url}/?idactividad=${intIdactividad}&idfactor=${intIdFactor}`
    );
  }

}
