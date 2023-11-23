import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { SubconstanteModel } from '../../_model/administracion/sub-constante-model';
import { Observable, Subject } from 'rxjs';
import { PrefijoModel } from '../../_model/info/prefijo-model';

@Injectable({
  providedIn: 'root',
})
export class PrefijoService extends GenericService<GenericModel<SubconstanteModel>> {
  RolCambio = new Subject<SubconstanteModel[]>();
  mensajeCambio = new Subject<string>();

  constructor(protected http: HttpClient) {
    super(http, `${environment.apiURL}/infotecnica/prefijo`);
  }

  listar(): Observable<any> {
    return this.http.get<any>(`${this.url}`);
  }

  listarPageable(
    page: number,
    rows: number,
    strnombre: string,
    idnivel : number,
  ): Observable<GenericModel<PrefijoModel>> {
    return this.http.get<GenericModel<PrefijoModel>>(
      `${this.url}/page?page=${page}&rows=${rows}&strnombre=${strnombre}&idnivel=${idnivel}`
    );
  }

  Obtener(intId: number): Observable<PrefijoModel> {
    return this.http.get<PrefijoModel>(`${this.url}/${intId}`);
  }

  Registrar(Model: PrefijoModel) {
    return this.http.post<any>(`${this.url}/`, Model);
  }

  Actualizar(Model: PrefijoModel) {
    return this.http.put<any>(`${this.url}/`, Model);
  }

  Eliminar(intId: number) {
    return this.http.delete<any>(`${this.url}/${intId}`);
  }
}
