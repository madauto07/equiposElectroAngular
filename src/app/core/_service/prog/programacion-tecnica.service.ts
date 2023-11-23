import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { GenericModel } from '../../_model/generic-model';
import { ProgramacionTecnicaModel } from '../../_model/prog/programacion-tecnica-model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgramacionTecnicaService {
  url = '';

  constructor(private http: HttpClient) {
    this.url = `${environment.apiURL}/protecnica/programacion`;
  }

  listar(): Observable<ProgramacionTecnicaModel[]> {
    return this.http.get<ProgramacionTecnicaModel[]>(`${this.url}`);
  }

  listarPageable(page: number, rows: number, titulo: string, fechaInic:string, fechaFin:string ) {
    return this.http.get<GenericModel<ProgramacionTecnicaModel>>(`${this.url}/page?page=${page}&rows=${rows}&titulo=${titulo}&fechaInic=${fechaInic}&fechaFin=${fechaFin}`);
  }

  obtener(intId: number): Observable<ProgramacionTecnicaModel> {
    return this.http.get<ProgramacionTecnicaModel>(`${this.url}/${intId}`);
  }

  generar(programacionModel: ProgramacionTecnicaModel): Observable<any> {
    return this.http.post<any>(`${this.url}/generar`, programacionModel);
  }

  registrar(programacionModel: ProgramacionTecnicaModel): Observable<any> {
    return this.http.post<any>(`${this.url}/`, programacionModel);
  }

  actualizar(programacionModel: ProgramacionTecnicaModel): Observable<any> {
    return this.http.put<any>(`${this.url}/`, programacionModel);
  }

  eliminar(intId: number) : Observable<any>{
    return this.http.delete<any>(`${this.url}/${intId}`);
  }

}
