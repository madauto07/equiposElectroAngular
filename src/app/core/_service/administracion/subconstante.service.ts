import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { SubconstanteModel } from '../../_model/administracion/sub-constante-model';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SubconstanteService extends GenericService<
  GenericModel<SubconstanteModel>
> {
  RolCambio = new Subject<SubconstanteModel[]>();
  mensajeCambio = new Subject<string>();

  constructor(protected http: HttpClient) {
    super(http, `${environment.apiURL}/administracion/subconstantes`);
  }

  listar(): Observable<any> {
    return this.http.get<any>(`${this.url}`);
  }

  listarControlId(id: number):Observable<any>
  {

    return this.http.get<any>(`${this.url}/control?id=${id}`);
  }


  listarPageable(
    page: number,
    rows: number,
    idtipo: number,
    strnombre: string
  ): Observable<GenericModel<SubconstanteModel>> {
    return this.http.get<GenericModel<SubconstanteModel>>(
      `${this.url}/page?page=${page}&rows=${rows}&idconstante=${idtipo}&strnombre=${strnombre}`
    );
  }

  Obtener(intId: number): Observable<SubconstanteModel> {
    return this.http.get<SubconstanteModel>(`${this.url}/${intId}`);
  }

  Registrar(Model: SubconstanteModel) {
    return this.http.post<any>(`${this.url}/`, Model);
  }

  Actualizar(Model: SubconstanteModel) {
    return this.http.put<any>(`${this.url}/`, Model);
  }

  Eliminar(intId: number) {
    return this.http.delete<any>(`${this.url}/${intId}`);
  }
}
