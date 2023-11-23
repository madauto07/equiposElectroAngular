import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { EquipoModel } from '../../_model/info/equipo-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class EquipoService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/equipo`;
  }

  listar(): Observable<EquipoModel[]> {
    return this.http.get<EquipoModel[]>(`${this.url}`);
  }

  listarPageable(
    page: number,
    rows: number,
    descripcion: string,
    codigoKKS: string,
    idTipo: number,
    ubicacionTecnica: string,
    codigoEquipo: string
  ): Observable<GenericModel<EquipoModel>> {
    var params = new HttpParams()
      .set('page', page.toString())
      .set('rows', rows.toString())
      .set('descripcion', descripcion)
      .set('codigokks', codigoKKS)
      .set('idtipo', idTipo)
      .set('ubicaciontecnica', ubicacionTecnica)
      .set('codigoequipo', codigoEquipo);
    return this.http.get<GenericModel<EquipoModel>>(`${this.url}/page`, {
      params,
    });
  }

  obtener(intId: number): Observable<EquipoModel> {
    return this.http.get<EquipoModel>(`${this.url}/${intId}`);
  }

  registrar(equipoModel: EquipoModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, equipoModel);
  }

  actualizar(equipoModel: EquipoModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, equipoModel);
  }

  eliminar(intIdEquipo: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${intIdEquipo}`);
  }

}
