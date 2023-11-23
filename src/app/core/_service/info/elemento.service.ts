import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ElementoModel } from '../../_model/info/elemento-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ElementoService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/elemento`;
  }

  listar(): Observable<ElementoModel[]> {
    return this.http.get<ElementoModel[]>(`${this.url}`);
  }

  listarxActividad(idActividad: number): Observable<ElementoModel[]> {
    return this.http.get<ElementoModel[]>(`${this.url}/actividad?idactividad=${idActividad}`);
  }

  listarPageable(
    page: number,
    rows: number
  ): Observable<GenericModel<ElementoModel>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('rows', rows.toString());
    return this.http.get<GenericModel<ElementoModel>>(
      `${this.url}/page`,
      {
        params,
      }
    );
  }

  obtener(intId: number): Observable<ElementoModel> {
    return this.http.get<ElementoModel>(`${this.url}/${intId}`);
  }

  registrar(form: any): Observable<any> {
    return this.http.post<any>(`${this.url}/`, this.toFormData(form));
  }

  actualizar(form: any): Observable<any> {
    return this.http.put<any>(`${this.url}/`, this.toFormData(form));
  }

  eliminar(elemento: any): Observable<any> {
    return this.http.delete<any>(`${this.url}/`,{body: elemento});
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
