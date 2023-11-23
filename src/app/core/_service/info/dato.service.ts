import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { SubconstanteModel } from '../../_model/administracion/sub-constante-model';
import { Observable, Subject } from 'rxjs';
import { PrefijoModel } from '../../_model/info/prefijo-model';
import { DatoModel } from '../../_model/info/dato-model';

@Injectable({
  providedIn: 'root',
})
export class DatoService  {

  url = '';
  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/dato`;
    //super(http, `${environment.apiURL}/infotecnica/dato`);
  }

  listar(): Observable<any> {
    return this.http.get<any>(`${this.url}`);
  }

  select(idSuperior : number, idPrefijo : number): Observable<any> {
    return this.http.get<any>(`${this.url}/select?idsuperior=${idSuperior}&idprefijo=${idPrefijo}`);
  }

  listarPageable(
    page: number,
    rows: number,
    idpref: number
  ): Observable<GenericModel<DatoModel>> { return this.http.get<GenericModel<DatoModel>>(
      `${this.url}/page?page=${page}&rows=${rows}&idpref=${idpref}`
    );
  }

  Obtener(intId: number): Observable<DatoModel> {
    return this.http.get<DatoModel>(`${this.url}/${intId}`);
  }

  Registrar(Model: DatoModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, Model);
  }

  Actualizar(Model: DatoModel) {
    return this.http.put<any>(`${this.url}/`, Model);
  }

  Eliminar(intId: number) {
    return this.http.delete<any>(`${this.url}/${intId}`);
  }
}
