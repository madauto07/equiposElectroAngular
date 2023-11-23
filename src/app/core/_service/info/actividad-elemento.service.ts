import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ActividadElementoModel } from '../../_model/info/actividad-elemento-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ActividadElementoService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/actividadelemento`;
  }

  listar(): Observable<ActividadElementoModel[]> {
    return this.http.get<ActividadElementoModel[]>(`${this.url}`);
  }

  listarPageable(
    page: number,
    rows: number
  ): Observable<GenericModel<ActividadElementoModel>> {
    var params = new HttpParams()
      .set('page', page.toString())
      .set('rows', rows.toString());
    return this.http.get<GenericModel<ActividadElementoModel>>(
      `${this.url}/page`,
      {
        params,
      }
    );
  }

  obtener(
    idActividad: number,
    idElemento: number
  ): Observable<ActividadElementoModel> {
    return this.http.get<ActividadElementoModel>(
      `${this.url}/?idactividad=${idActividad}&idelemento=${idElemento}`
    );
  }

  registrar(actividadElemento: ActividadElementoModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, actividadElemento);
  }

  actualizar(actividadElemento: ActividadElementoModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, actividadElemento);
  }

  eliminar(actividadElemento: ActividadElementoModel): Observable<any> {
    return this.http.delete<any>(`${this.url}/`,{body: actividadElemento});
  }
}
