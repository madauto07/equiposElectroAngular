import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { OpcionRolModel } from '../../_model/administracion/opcion-rol-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class OpcionRolService {

  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/administracion/opcionesrol`;
  }

  listar(): Observable<OpcionRolModel[]> {
    return this.http.get<OpcionRolModel[]>(`${this.url}`);
  }

  listarPageable(
    page: number,
    rows: number,
    idRol: number
  ): Observable<GenericModel<OpcionRolModel>> {
    return this.http.get<GenericModel<OpcionRolModel>>(
      `${this.url}/page?page=${page}&rows=${rows}&idrol=${idRol}`
    );
  }

  obtener(idOpcion: number, IdRol: number): Observable<OpcionRolModel> {
    return this.http.get<OpcionRolModel>(`${this.url}/?idopcion=${idOpcion}&idrol=${IdRol}`);
  }

  registrar(opcionRol: OpcionRolModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, opcionRol);
  }

  eliminar(idOpcion: number, IdRol: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/?idopcion=${idOpcion}&idrol=${IdRol}`);
  }

}
