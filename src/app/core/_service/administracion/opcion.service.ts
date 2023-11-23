import { Injectable } from '@angular/core';
import { GenericService } from '../generic.service';
import { GenericModel } from '../../_model/generic-model';
import { OpcionModel } from '../../_model/administracion/opcion-model';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpcionService {

  url = '';
  constructor(protected http: HttpClient) {
    this.url = `${environment.apiURL}/administracion/opciones`;
  }

  listar(): Observable<OpcionModel[]> {
    return this.http.get<OpcionModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number, idmodulo: number, strnombre: string) {
    return this.http.get<GenericModel<OpcionModel>>(
      `${this.url}/page?page=${page}&rows=${rows}&idmodulo=${idmodulo}&strnombre=${strnombre}`
    );
  }

  ObtenerOpcionPorId(intIdOpcion: number)
  {
    return this.http.get<OpcionModel>(`${this.url}/${intIdOpcion}`);
  }

  RegistrarOpcion(opcionModel: OpcionModel)
  {
    return this.http.post<any>(`${this.url}/`, opcionModel);
  }
  ActualizarOpcion(opcionModel: OpcionModel)
  {
    return this.http.put<any>(`${this.url}/`, opcionModel);
  }

  EliminarOpcion(intIdOpcion: number)
  {
    return this.http.delete<any>(`${this.url}/${intIdOpcion}`);
  }

}
