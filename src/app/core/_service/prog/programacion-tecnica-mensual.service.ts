import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ProgramacionTecnicaMensualModel } from '../../_model/prog/programacion-tecnica-mensual-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgramacionTecnicaMensualService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/protecnica/programacionmensual`;
  }

  listar(): Observable<ProgramacionTecnicaMensualModel[]> {
    return this.http.get<ProgramacionTecnicaMensualModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number, titulo: string, anho:number, mes:number ) {
    return this.http.get<GenericModel<ProgramacionTecnicaMensualModel>>(`${this.url}/page?page=${page}&rows=${rows}&titulo=${titulo}&anho=${anho}&mes=${mes}`);
  }

  obtener(intId: number): Observable<ProgramacionTecnicaMensualModel> {
    return this.http.get<ProgramacionTecnicaMensualModel>(`${this.url}/${intId}`);
  }

  generar(programacionModel: ProgramacionTecnicaMensualModel): Observable<any> {
    return this.http.post<any>(`${this.url}/generar`, programacionModel);
  }

  registrar(programacionModel: ProgramacionTecnicaMensualModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, programacionModel);
  }

  actualizar(programacionModel: ProgramacionTecnicaMensualModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, programacionModel);
  }

  eliminar(intId: number) {
    return this.http.delete<any>(`${this.url}/${intId}`);
  }

}
