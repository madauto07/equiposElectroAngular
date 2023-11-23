import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { EquipoDocumentoModel } from '../../_model/info/equipo-documento-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class EquipoDocumentoService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/equipodocumento`;
  }

  listar(): Observable<EquipoDocumentoModel[]> {
    return this.http.get<EquipoDocumentoModel[]>(`${this.url}`);
  }

  listarPageable(
    page: number,
    rows: number
  ): Observable<GenericModel<EquipoDocumentoModel>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('rows', rows.toString());
    return this.http.get<GenericModel<EquipoDocumentoModel>>(
      `${this.url}/page`,
      {
        params,
      }
    );
  }

  obtener(
    intIdEquipo: number,
    intIdDocumento: number
  ): Observable<EquipoDocumentoModel> {
    return this.http.get<EquipoDocumentoModel>(
      `${this.url}/?idequipo=${intIdEquipo}&iddocumento=${intIdDocumento}`
    );
  }

  registrar(form: any): Observable<any> {
    return this.http.post<any>(`${this.url}/`, this.toFormData(form));
  }

  eliminar(intIdEquipo: number, intIdDocumento: number): Observable<any> {
    return this.http.delete<any>(
      `${this.url}/?idequipo=${intIdEquipo}&iddocumento=${intIdDocumento}`
    );
  }

  toFormData<T>(formValue: T) {
    const formData = new FormData();
    for (const key of Object.keys(formValue)) {
      const value = formValue[key];
      formData.append(key, value);
    }
    return formData;
  }
}
