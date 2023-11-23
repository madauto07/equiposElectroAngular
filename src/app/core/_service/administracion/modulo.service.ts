import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ModuloModel } from '../../_model/administracion/modulo-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ModuloService {

  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/administracion/modulos`;
  }

  listar(): Observable<ModuloModel[]> {
    return this.http.get<ModuloModel[]>(`${this.url}`);
  }

  listarPageable(
    page: number,
    rows: number,
    strnombre: string
  ): Observable<GenericModel<ModuloModel>> {
    return this.http.get<GenericModel<ModuloModel>>(
      `${this.url}/page?page=${page}&rows=${rows}&strnombre=${strnombre}`
    );
  }

  obtener(intId: number): Observable<ModuloModel> {
    return this.http.get<ModuloModel>(`${this.url}/${intId}`);
  }

  registrar(moduloModel: ModuloModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, moduloModel);
  }

  actualizar(moduloModel: ModuloModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, moduloModel);
  }

  eliminar(intIdModulo: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${intIdModulo}`);
  }

}
