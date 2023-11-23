import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ModoVerificacionModel } from '../../_model/info/modo-verificacion-model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ModoVerificacionService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/modo`;
  }

  listar(): Observable<ModoVerificacionModel[]> {
    return this.http.get<ModoVerificacionModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number, idfactor : number ) {
    return this.http.get<GenericModel<ModoVerificacionModel>>(`${this.url}/page?page=${page}&rows=${rows}&idfactor=${idfactor}`);
  }



  obtener(intId: number): Observable<ModoVerificacionModel> {
    return this.http.get<ModoVerificacionModel>(`${this.url}/${intId}`);
  }

  registrar(equipoModel: ModoVerificacionModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, equipoModel);
  }

  actualizar(equipoModel: ModoVerificacionModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, equipoModel);
  }

  eliminar(intIdEquipo: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/${intIdEquipo}`);
  }
}

