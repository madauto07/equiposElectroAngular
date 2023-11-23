import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { FactorVerificacionModel } from '../../_model/info/factor-verificacion-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class FactorVerificacionService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/factor`;
  }

  listar(): Observable<FactorVerificacionModel[]> {
    return this.http.get<FactorVerificacionModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number ) {
    return this.http.get<GenericModel<FactorVerificacionModel>>(`${this.url}/page?page=${page}&rows=${rows}`);
  }



  // listarPageable(
  //   page: number,
  //   rows: number
   
  // ): Observable<GenericModel<FactorVerificacionModel>> {
  //   var params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('rows', rows.toString());
      
  //   return this.http.get<GenericModel<FactorVerificacionModel>>(`${this.url}/page`, {
  //     params,
  //   });
  // }

  obtener(intId: number): Observable<FactorVerificacionModel> {
    return this.http.get<FactorVerificacionModel>(`${this.url}/${intId}`);
  }

  registrar(equipoModel: FactorVerificacionModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, equipoModel);
  }

  actualizar(equipoModel: FactorVerificacionModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, equipoModel);
  }

  eliminar(intIdEquipo: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${intIdEquipo}`);
  }
}

