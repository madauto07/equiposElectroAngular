import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { TrabajadorModel } from '../../_model/administracion/trabajador-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class TrabajadorService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/administracion/trabajadores`;
  }

  listar(): Observable<TrabajadorModel[]> {
    return this.http.get<TrabajadorModel[]>(`${this.url}`);
  }

  listarPageable(
    page: number,
    rows: number,
    codigo: string,
    idEspecialidad: number,
    idarea:number=0
  ): Observable<GenericModel<TrabajadorModel>> {
    return this.http.get<GenericModel<TrabajadorModel>>(
      `${this.url}/page?page=${page}&rows=${rows}&codigo=${codigo}&idespecialidad=${idEspecialidad}&idarea=${idarea}`
    );
  }

  obtener(id: number): Observable<TrabajadorModel> {
    return this.http.get<TrabajadorModel>(`${this.url}/${id}`);
  }

  registrar(model: TrabajadorModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, model);
  }

  actualizar(model: TrabajadorModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, model);
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${id}`);
  }
}
