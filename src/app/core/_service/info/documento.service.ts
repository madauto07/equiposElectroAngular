import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { DocumentoModel } from '../../_model/info/documento-model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class DocumentoService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/documento`;
  }

  listar(): Observable<DocumentoModel[]> {
    return this.http.get<DocumentoModel[]>(`${this.url}`);
  }

  listarPageable(
    page: number,
    rows: number,
    idEquipo: number,
    idTipoDocumento: number,
    nombre: string
  ): Observable<GenericModel<DocumentoModel>> {
    var params = new HttpParams()
      .set('page', page.toString())
      .set('rows', rows.toString())
      .set('idequipo', idEquipo)
      .set('idtipodocumento', idTipoDocumento)
      .set('nombre', nombre);
    return this.http.get<GenericModel<DocumentoModel>>(`${this.url}/page`, {
      params,
    });
  }

  obtener(intId: number): Observable<DocumentoModel> {
    return this.http.get<DocumentoModel>(`${this.url}/${intId}`);
  }

  registrar(model: DocumentoModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, model);
  }

  actualizar(model: DocumentoModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, model);
  }

  eliminar(intIdDocumento: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${intIdDocumento}`);
  }
}
