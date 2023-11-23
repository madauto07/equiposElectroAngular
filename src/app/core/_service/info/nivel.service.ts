import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { SubconstanteModel } from '../../_model/administracion/sub-constante-model';
import { Observable, Subject } from 'rxjs';
import { PrefijoModel } from '../../_model/info/prefijo-model';
import { NivelModel } from '../../_model/info/nivel-model';

@Injectable({
  providedIn: 'root',
})
export class NivelService extends GenericService<GenericModel<NivelModel>> {


  constructor(protected http: HttpClient) {
    super(http, `${environment.apiURL}/infotecnica/nivel`);
  }

  listar(): Observable<any> {
    return this.http.get<any>(`${this.url}`);
  }

  listarPageable(
    page: number,
    rows: number,
    strnombre: string
  ): Observable<GenericModel<NivelModel>> {
    return this.http.get<GenericModel<NivelModel>>(
      `${this.url}/page?page=${page}&rows=${rows}&strnombre=${strnombre}`
    );
  }

  Obtener(intId: number): Observable<NivelModel> {
    return this.http.get<NivelModel>(`${this.url}/${intId}`);
  }

  Registrar(Model: NivelModel) {
    return this.http.post<any>(`${this.url}/`, Model);
  }

  Actualizar(Model: NivelModel) {
    return this.http.put<any>(`${this.url}/`, Model);
  }

  Eliminar(intId: number) {
    return this.http.delete<any>(`${this.url}/${intId}`);
  }
}
