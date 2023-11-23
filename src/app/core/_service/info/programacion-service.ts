import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ProgramacionModel } from '../../_model/info/programacion-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgramacionService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/infotecnica/programacion`;
  }

  listar(): Observable<ProgramacionModel[]> {
    return this.http.get<ProgramacionModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number, idprogramacion: number, idactividad:number, idequipo:number ) {
    return this.http.get<GenericModel<ProgramacionModel>>(`${this.url}/page?page=${page}&rows=${rows}&idprogramacion=${idprogramacion}&idactividad=${idactividad}&idequipo=${idequipo}`);
  }

  obtener(intId: number): Observable<ProgramacionModel> {
    return this.http.get<ProgramacionModel>(`${this.url}/${intId}`);
  }

  registrar(programacionModel: ProgramacionModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, programacionModel);
  }

  actualizar(programacionModel: ProgramacionModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, programacionModel);
  }

  eliminar(intId: number) {
    return this.http.delete<any>(`${this.url}/${intId}`);
  }

}
